import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all trainers
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("trainers").collect();
  },
});

// Seed default trainers (run once)
export const seed = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("trainers").first();
    if (existing) return "Already seeded";

    const defaultTrainers = [
      {
        initials: "AR",
        name: "Ariel Ramadan",
        specialization: "Strength & Hypertrophy",
        tags: ["Weight Training", "Nutrition"],
        experience: 5,
        rating: 4.9,
        pricePerSession: 150000,
        goals: ["muscle"],
        isRecommended: true,
      },
      {
        initials: "SM",
        name: "Sinta Maharani",
        specialization: "Cardio & HIIT",
        tags: ["HIIT", "Zumba", "Pilates"],
        experience: 3,
        rating: 4.8,
        pricePerSession: 130000,
        goals: ["weight", "cardio"],
      },
      {
        initials: "DP",
        name: "Dimas Pratama",
        specialization: "Calisthenics & Mobility",
        tags: ["Bodyweight", "Yoga"],
        experience: 4,
        rating: 4.7,
        pricePerSession: 120000,
        goals: ["mobility", "weight"],
      },
      {
        initials: "NF",
        name: "Nabila Fitri",
        specialization: "Body Recomposition",
        tags: ["Nutrition", "Cardio"],
        experience: 6,
        rating: 4.9,
        pricePerSession: 160000,
        goals: ["weight", "muscle"],
      },
    ];

    for (const t of defaultTrainers) {
      await ctx.db.insert("trainers", t);
    }
    return "Seeded!";
  },
});
