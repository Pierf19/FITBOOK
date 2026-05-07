// convex/bookings.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

const TIME_REGEX = /^\d{2}:\d{2}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function dayOfWeek(dateStr) {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return days[new Date(dateStr).getUTCDay()];
}

function isValidSlotForDay(day, startTime, endTime) {
  const isWeekend = day === "Saturday" || day === "Sunday";
  const maxStartHour = isWeekend ? 21 : 19;
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  if (Number.isNaN(startHour) || Number.isNaN(startMinute)) return false;
  if (Number.isNaN(endHour) || Number.isNaN(endMinute)) return false;
  if (startMinute !== 0 || endMinute !== 0) return false;
  if (startHour < 6 || startHour > maxStartHour) return false;
  if (endHour !== startHour + 1) return false;

  return true;
}

export const createBooking = mutation({
  args: {
    trainerId: v.id("trainers"),
    sessionDate: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    whatsapp: v.optional(v.string()),
    level: v.optional(v.string()),
    sessionCount: v.optional(v.number()),
    userEmail: v.string(), // Added for demo auth bypass
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.userEmail))
      .first();
    if (!user) throw new ConvexError("User record not found");

    // 2. Validate input formats
    if (!DATE_REGEX.test(args.sessionDate)) throw new ConvexError("Invalid date format. Use YYYY-MM-DD");
    if (!TIME_REGEX.test(args.startTime)) throw new ConvexError("Invalid start time. Use HH:MM");
    if (!TIME_REGEX.test(args.endTime)) throw new ConvexError("Invalid end time. Use HH:MM");
    if (args.startTime >= args.endTime) throw new ConvexError("Start time must be before end time");

    // Session date must not be in the past
    const today = new Date().toISOString().split("T")[0];
    if (args.sessionDate < today) throw new ConvexError("Cannot book a past date");

    const trainer = await ctx.db.get(args.trainerId);
    if (!trainer) throw new ConvexError("Trainer not found");

    // 3. Validate slot by global booking schedule
    const requestedDay = dayOfWeek(args.sessionDate);
    const slotAvailable = isValidSlotForDay(
      requestedDay,
      args.startTime,
      args.endTime
    );
    if (!slotAvailable) {
      throw new ConvexError("Slot must be 06:00-19:00 on weekdays or 06:00-21:00 on weekends");
    }

    // 4. Atomic double-booking check — done server-side only
    const existing = await ctx.db
      .query("bookings")
      .withIndex("by_trainer_date", (q) =>
        q.eq("trainerId", args.trainerId).eq("sessionDate", args.sessionDate)
      )
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), "cancelled"),
          q.or(
            // New slot starts during an existing booking
            q.and(
              q.gte(q.field("startTime"), args.startTime),
              q.lt(q.field("startTime"), args.endTime)
            ),
            // New slot ends during an existing booking
            q.and(
              q.gt(q.field("endTime"), args.startTime),
              q.lte(q.field("endTime"), args.endTime)
            ),
            // New slot completely contains an existing booking
            q.and(
              q.lte(q.field("startTime"), args.startTime),
              q.gte(q.field("endTime"), args.endTime)
            )
          )
        )
      )
      .first();

    if (existing) throw new ConvexError("This time slot is already booked");

    // 5. Insert confirmed booking
    const bookingId = await ctx.db.insert("bookings", {
      userId: user._id,
      trainerId: args.trainerId,
      sessionDate: args.sessionDate,
      startTime: args.startTime,
      endTime: args.endTime,
      whatsapp: args.whatsapp,
      level: args.level,
      sessionCount: args.sessionCount,
      status: "confirmed",
      createdAt: Date.now(),
    });

    // 6. Record activity for habit-based recommendation
    const spec = trainer.specialization[0] ?? "general";
    await ctx.db.insert("userActivity", {
      userId: user._id,
      sessionDate: args.sessionDate,
      startTime: args.startTime,
      type: spec,
      trainerId: args.trainerId,
    });

    return bookingId;
  },
});

export const getMyBookings = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    if (!args.userEmail) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.userEmail))
      .first();
    if (!user) return [];

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Enrich with trainer name
    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const trainer = await ctx.db.get(b.trainerId);
        const trainerUser = trainer ? await ctx.db.get(trainer.userId) : null;
        return {
          ...b,
          trainerName: trainerUser?.name ?? "Unknown",
          trainerSpecialization: trainer?.specialization ?? [],
          pricePerSession: trainer?.pricePerSession ?? 0,
        };
      })
    );

    return enriched.sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));
  },
});

export const cancelBooking = mutation({
  args: { bookingId: v.id("bookings"), userEmail: v.string() },
  handler: async (ctx, args) => {
    if (!args.userEmail) throw new ConvexError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.userEmail))
      .first();
    if (!user) throw new ConvexError("User not found");

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new ConvexError("Booking not found");

    // Verify ownership — user can only cancel their own bookings
    if (booking.userId !== user._id) throw new ConvexError("Unauthorized");
    if (booking.status === "cancelled") throw new ConvexError("Already cancelled");

    await ctx.db.patch(args.bookingId, { status: "cancelled" });
  },
});

// For trainer dashboard — bookings made with them
export const getTrainerBookings = query({
  args: { trainerId: v.id("trainers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_trainerId", (q) => q.eq("trainerId", args.trainerId))
      .collect();

    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const user = await ctx.db.get(b.userId);
        return { ...b, clientName: user?.name ?? "Unknown" };
      })
    );

    return enriched
      .filter((b) => b.status !== "cancelled")
      .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));
  },
});

// Returns booked slots for a trainer on a given date (for calendar display)
export const getBookedSlots = query({
  args: { trainerId: v.id("trainers"), sessionDate: v.string() },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_trainer_date", (q) =>
        q.eq("trainerId", args.trainerId).eq("sessionDate", args.sessionDate)
      )
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    return bookings.map((b) => ({ startTime: b.startTime, endTime: b.endTime }));
  },
});

// Returns all booked slots for a trainer across multiple dates at once.
export const getBookedSlotsForDates = query({
  args: {
    trainerId: v.id("trainers"),
    dates: v.array(v.string()), 
  },
  handler: async (ctx, args) => {
    const result = {};

    for (const date of args.dates) {
      const bookings = await ctx.db
        .query("bookings")
        .withIndex("by_trainer_date", (q) =>
          q.eq("trainerId", args.trainerId).eq("sessionDate", date)
        )
        .filter((q) => q.neq(q.field("status"), "cancelled"))
        .collect();

      result[date] = bookings.map((b) => ({
        startTime: b.startTime,
        endTime: b.endTime,
      }));
    }

    return result;
  },
});

export const getAllBookings = query({
  args: {},
  handler: async (ctx) => {
    const bookings = await ctx.db.query("bookings").order("desc").collect();
    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const user = await ctx.db.get(b.userId);
        const trainer = await ctx.db.get(b.trainerId);
        const trainerUser = trainer ? await ctx.db.get(trainer.userId) : null;
        return {
          ...b,
          userName: user?.name ?? "Unknown",
          trainerName: trainerUser?.name ?? "Unknown",
        };
      })
    );
    return enriched;
  },
});