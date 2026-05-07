// convex/reports.js
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    // Basic admin check (this can be improved with a real admin flag in users table)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const totalUsers = (await ctx.db.query("users").collect()).length;
    const totalTrainers = (await ctx.db.query("trainers").collect()).length;
    const totalBookings = (await ctx.db.query("bookings").collect()).length;
    const activeBookings = (await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "confirmed"))
      .collect()).length;

    const trainers = await ctx.db.query("trainers").collect();
    const totalRevenue = trainers.reduce((acc, t) => acc + (t.pricePerSession || 0), 0); // Simplified logic

    return {
      totalUsers,
      totalTrainers,
      totalBookings,
      activeBookings,
      totalRevenue,
    };
  },
});

export const getUserStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;

    const progressEntries = await ctx.db
      .query("progressEntries")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    let weightChange = 0;
    if (progressEntries.length >= 2) {
      weightChange = progressEntries[0].weight - progressEntries[progressEntries.length - 1].weight;
    }

    return {
      totalBookings: bookings.length,
      confirmedBookings: confirmed,
      cancelledBookings: cancelled,
      currentWeight: progressEntries[0]?.weight ?? 0,
      weightChange: weightChange.toFixed(1),
      bmi: progressEntries[0]?.bmi ?? 0,
    };
  },
});
