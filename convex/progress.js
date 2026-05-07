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
    height: v.optional(v.number()),
    bmi: v.optional(v.number()),
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
      height: args.height,
      bmi: args.bmi,
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
    
    const entry = await ctx.db.get(args.entryId);
    if (!entry) throw new Error("Entry not found");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();
    
    if (!user || entry.userId !== user._id) {
      throw new Error("Unauthorized to delete this entry");
    }

    await ctx.db.delete(args.entryId);
  },
});

export const updateEntry = mutation({
  args: {
    entryId: v.id("progressEntries"),
    weight: v.optional(v.number()),
    height: v.optional(v.number()),
    bmi: v.optional(v.number()),
    bodyFat: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const entry = await ctx.db.get(args.entryId);
    if (!entry) throw new Error("Entry not found");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first();

    if (!user || entry.userId !== user._id) {
      throw new Error("Unauthorized to update this entry");
    }

    const { entryId, ...updates } = args;
    await ctx.db.patch(entryId, updates);
  },
});
