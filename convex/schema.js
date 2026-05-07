import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("user"), v.literal("trainer"), v.literal("admin")),
    bio: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    createdAt: v.number(),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    status: v.optional(v.string()),
  })
    .index("email", ["email"]),

  trainers: defineTable({
    userId: v.id("users"),
    bio: v.string(),
    specialization: v.array(v.string()),
    pricePerSession: v.number(),
    availableSlots: v.array(
      v.object({
        day: v.string(),       // "Monday", "Tuesday", etc.
        startTime: v.string(), // "09:00"
        endTime: v.string(),   // "10:00"
      })
    ),
  }).index("by_userId", ["userId"]),

  bookings: defineTable({
    userId: v.id("users"),
    trainerId: v.id("trainers"),
    sessionDate: v.string(), // "YYYY-MM-DD"
    startTime: v.string(),   // "09:00"
    endTime: v.string(),     // "10:00"
    whatsapp: v.optional(v.string()),
    level: v.optional(v.string()),
    sessionCount: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_trainerId", ["trainerId"])
    .index("by_status", ["status"])
    .index("by_trainer_date", ["trainerId", "sessionDate"]),

  userActivity: defineTable({
    userId: v.id("users"),
    sessionDate: v.string(),
    startTime: v.string(),
    type: v.string(),        // specialization type
    trainerId: v.id("trainers"),
  }).index("by_userId", ["userId"]),

  progressEntries: defineTable({
    userId: v.id("users"),
    date: v.string(), // "YYYY-MM-DD"
    weight: v.number(), // in kg
    height: v.optional(v.number()), // in cm
    bmi: v.optional(v.number()),
    bodyFat: v.optional(v.number()), // in percentage
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  systemSettings: defineTable({
    dailyBookingLimit: v.number(),
    maintenanceMode: v.boolean(),
    whatsappNotifications: v.boolean(),
    accentColor: v.string(),
    complexAnimations: v.boolean(),
    updatedAt: v.number(),
  }),
});
