// convex/recommendations.js
import { query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const getSuggestedSlots = query({
  args: { trainerId: v.id("trainers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();
    if (!user) return [];

    // Pull all past activity for this user with this trainer
    const activities = await ctx.db
      .query("userActivity")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("trainerId"), args.trainerId))
      .collect();

    if (activities.length === 0) return [];

    // Count frequency of each (day-of-week, startTime) combination
    const freq = {};
    for (const act of activities) {
      const date = new Date(act.sessionDate);
      const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const day = days[date.getUTCDay()];
      const key = `${day}|${act.startTime}`;
      freq[key] = (freq[key] ?? 0) + 1;
    }

    // Sort by frequency descending, take top 3
    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const trainer = await ctx.db.get(args.trainerId);
    if (!trainer) return [];

    // Map back to full slot objects from trainer's current availability
    return sorted.flatMap(([key, count]) => {
      const [day, startTime] = key.split("|");
      const slot = trainer.availableSlots.find(
        (s) => s.day === day && s.startTime === startTime
      );
      if (!slot) return [];
      return [{ ...slot, frequency: count }];
    });
  },
});
