import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getEntries = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("progressEntries")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc") // newest first
      .collect();
  },
});

export const addEntry = mutation({
  args: {
    userId: v.id("users"),
    date: v.string(),
    weight: v.number(),
    bodyFat: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Basic auth check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const newId = await ctx.db.insert("progressEntries", {
      userId: args.userId,
      date: args.date,
      weight: args.weight,
      bodyFat: args.bodyFat,
      notes: args.notes,
      createdAt: Date.now(),
    });
    return newId;
  },
});

export const deleteEntry = mutation({
  args: { entryId: v.id("progressEntries") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    
    await ctx.db.delete(args.entryId);
  },
});
