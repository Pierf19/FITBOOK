import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get bookings by user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get all booked slots for a trainer
export const getBookedSlots = query({
  args: { trainerId: v.id("trainers"), goal: v.string() },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId))
      .collect();

    return bookings
      .filter((b) => {
        const active = b.status === "pending" || b.status === "confirmed";
        return active && b.goal === args.goal;
      })
      .map((b) => `${b.day}-${b.time}`);
  },
});

// Create booking
export const create = mutation({
  args: {
    userId: v.id("users"),
    trainerId: v.id("trainers"),
    trainerName: v.string(),
    trainerSpec: v.string(),
    goal: v.string(),
    day: v.string(),
    time: v.string(),
    sessionType: v.string(),
    fitnessLevel: v.string(),
    notes: v.optional(v.string()),
    totalPrice: v.number(),
  },
  handler: async (ctx, args) => {
    // Check slot not already taken
    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId))
      .collect();

    const conflict = existingBookings.find((booking) => {
      const active = booking.status === "pending" || booking.status === "confirmed";
      const sameDay = booking.day === args.day;
      const sameTime = booking.time === args.time;
      const sameGoal = booking.goal === args.goal;
      return active && sameDay && sameTime && sameGoal;
    });

    if (conflict) throw new Error("Slot ini sudah dibooking orang lain");

    return await ctx.db.insert("bookings", {
      ...args,
      status: "confirmed",
      createdAt: Date.now(),
    });
  },
});

// Cancel booking
export const cancel = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, { status: "cancelled" });
  },
});
