// convex/trainers.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

function generateDefaultSlots() {
  const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const WEEKEND = ["Saturday", "Sunday"];
  const slots = [];
  for (const day of WEEKDAYS) {
    for (let h = 6; h < 19; h++) {
      slots.push({
        day,
        startTime: `${String(h).padStart(2, "0")}:00`,
        endTime: `${String(h + 1).padStart(2, "0")}:00`,
      });
    }
  }
  for (const day of WEEKEND) {
    for (let h = 6; h < 21; h++) {
      slots.push({
        day,
        startTime: `${String(h).padStart(2, "0")}:00`,
        endTime: `${String(h + 1).padStart(2, "0")}:00`,
      });
    }
  }
  return slots;
}

const DEFAULT_SLOTS = generateDefaultSlots();

const DUMMY_TRAINERS = [
  {
    name: "Ariel Ramadan",
    email: "ariel@fitbook.demo",
    bio: "Coach hypertrophy dengan fokus teknik aman, progres bertahap, dan nutrisi praktis.",
    specialization: ["Strength", "Hypertrophy", "Nutrition"],
    pricePerSession: 150000,
  },
  {
    name: "Sinta Maharani",
    email: "sinta@fitbook.demo",
    bio: "Spesialis cardio dan HIIT untuk fat loss dengan program yang menyesuaikan level klien.",
    specialization: ["Cardio", "HIIT", "Zumba"],
    pricePerSession: 130000,
  },
  {
    name: "Dimas Pratama",
    email: "dimas@fitbook.demo",
    bio: "Coach calisthenics dan mobility untuk kekuatan tubuh sendiri dan fleksibilitas.",
    specialization: ["Calisthenics", "Mobility", "Yoga"],
    pricePerSession: 120000,
  },
  {
    name: "Nabila Fitri",
    email: "nabila@fitbook.demo",
    bio: "Pendamping body recomposition: turunkan lemak sambil menjaga massa otot.",
    specialization: ["Body Recomposition", "Nutrition", "Cardio"],
    pricePerSession: 160000,
  },
  {
    name: "Raka Aditya",
    email: "raka@fitbook.demo",
    bio: "Strength and conditioning untuk performa olahraga, endurance, dan postur.",
    specialization: ["Strength", "Conditioning", "Stamina"],
    pricePerSession: 140000,
  },
  {
    name: "Maya Sari",
    email: "maya@fitbook.demo",
    bio: "General fitness dan kesehatan dasar. Cocok untuk pemula yang ingin memulai gaya hidup sehat tanpa tekanan berat.",
    specialization: ["General", "Basic Fitness", "Nutrition"],
    pricePerSession: 100000,
  },
  {
    name: "Bima Wijaya",
    email: "bima@fitbook.demo",
    bio: "Pelatih fungsional dan atletik dengan pendekatan disiplin dan hasil yang terukur.",
    specialization: ["General", "Functional", "Strength"],
    pricePerSession: 125000,
  },
  {
    name: "Anisa Fitria",
    email: "anisa@fitbook.demo",
    bio: "Instruktur Yoga berpengalaman yang fokus pada pernapasan, postur, dan relaksasi mental.",
    specialization: ["Yoga", "Meditation", "Flexibility"],
    pricePerSession: 110000,
  },
];

export const listTrainers = query({
  args: { specialization: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const trainers = await ctx.db.query("trainers").collect();

    // Enrich each trainer with their user name
    const enriched = await Promise.all(
      trainers.map(async (t) => {
        const user = await ctx.db.get(t.userId);
        return { ...t, userName: user?.name ?? "Unknown" };
      })
    );

    if (args.specialization) {
      return enriched.filter((t) =>
        t.specialization.includes(args.specialization)
      );
    }
    return enriched;
  },
});

export const getTrainer = query({
  args: { trainerId: v.id("trainers") },
  handler: async (ctx, args) => {
    const trainer = await ctx.db.get(args.trainerId);
    if (!trainer) return null;
    const user = await ctx.db.get(trainer.userId);
    // Keamanan: Kita tidak mengembalikan user.email ke frontend agar privasi pelatih terjaga
    return { ...trainer, userName: user?.name ?? "Unknown" };
  },
});

export const createTrainerProfile = mutation({
  args: {
    bio: v.string(),
    specialization: v.array(v.string()),
    pricePerSession: v.number(),
    availableSlots: v.array(
      v.object({
        day: v.string(),
        startTime: v.string(),
        endTime: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();
    if (!user) throw new ConvexError("User record not found");
    if (user.role !== "trainer") throw new ConvexError("Only trainers can create a profile");

    const existing = await ctx.db
      .query("trainers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (existing) throw new ConvexError("Trainer profile already exists");

    if (args.bio.trim().length === 0) throw new ConvexError("Bio cannot be empty");
    if (args.specialization.length === 0) throw new ConvexError("At least one specialization required");
    if (args.pricePerSession <= 0) throw new ConvexError("Price must be positive");

    return await ctx.db.insert("trainers", {
      userId: user._id,
      bio: args.bio.trim(),
      specialization: args.specialization,
      pricePerSession: args.pricePerSession,
      availableSlots: args.availableSlots,
    });
  },
});

export const updateAvailability = mutation({
  args: {
    trainerId: v.id("trainers"),
    availableSlots: v.array(
      v.object({
        day: v.string(),
        startTime: v.string(),
        endTime: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();
    if (!user) throw new ConvexError("User not found");

    const trainer = await ctx.db.get(args.trainerId);
    if (!trainer) throw new ConvexError("Trainer not found");

    // Ensure the caller owns this trainer profile
    if (trainer.userId !== user._id) throw new ConvexError("Unauthorized");

    await ctx.db.patch(args.trainerId, { availableSlots: args.availableSlots });
  },
});

// Fetch trainer profile for the logged-in trainer user
export const getMyTrainerProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();
    if (!user) return null;

    return await ctx.db
      .query("trainers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
  },
});

export const seedDummyTrainers = mutation({
  args: {},
  handler: async (ctx) => {
    let created = 0;

    for (const item of DUMMY_TRAINERS) {
      let user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", item.email))
        .first();

      if (!user) {
        const userId = await ctx.db.insert("users", {
          name: item.name,
          email: item.email,
          role: "trainer",
          createdAt: Date.now(),
        });
        user = await ctx.db.get(userId);
      } else if (user.role !== "trainer") {
        await ctx.db.patch(user._id, { role: "trainer", name: item.name });
      }

      const existingTrainer = await ctx.db
        .query("trainers")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first();

      if (!existingTrainer) {
        await ctx.db.insert("trainers", {
          userId: user._id,
          bio: item.bio,
          specialization: item.specialization,
          pricePerSession: item.pricePerSession,
          availableSlots: DEFAULT_SLOTS,
        });
        created += 1;
      }
    }

    return {
      created,
      totalSeeded: DUMMY_TRAINERS.length,
      message: created === 0 ? "Dummy trainers already exist" : "Dummy trainers seeded",
    };
  },
});
