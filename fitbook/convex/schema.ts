import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(), // hashed in real app, plain for prototype
    role: v.union(v.literal("user"), v.literal("trainer")),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  trainers: defineTable({
    userId: v.optional(v.id("users")),
    initials: v.string(),
    name: v.string(),
    specialization: v.string(),
    tags: v.array(v.string()),
    experience: v.number(),
    rating: v.number(),
    pricePerSession: v.number(),
    goals: v.array(v.string()),
    isRecommended: v.optional(v.boolean()),
  }),

  bookings: defineTable({
    userId: v.id("users"),
    trainerId: v.id("trainers"),
    trainerName: v.string(),
    trainerSpec: v.string(),
    goal: v.optional(v.string()),
    day: v.string(),
    time: v.string(),
    sessionType: v.string(),
    fitnessLevel: v.string(),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("done"),
      v.literal("cancelled")
    ),
    totalPrice: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_trainer", ["trainerId"])
    .index("by_trainer_and_goal", ["trainerId", "goal"]),
});
