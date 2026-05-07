// convex/users.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create or update user record for demo mode (email session in localStorage)
export const upsertUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("user"), v.literal("trainer")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        role: args.role,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: args.role,
      createdAt: Date.now(),
    });
  },
});

// Legacy helper for Convex Auth mode.
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(userId);
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    bio: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { userId, ...fields } = args;
    await ctx.db.patch(userId, fields);
  },
});

export const getUserProgress = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("userActivity")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const totalSessions = activities.length;
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
    
    // Group by type
    const statsByType = {};
    activities.forEach((a) => {
      statsByType[a.type] = (statsByType[a.type] || 0) + 1;
    });

    return {
      totalSessions,
      confirmedBookings,
      statsByType,
      activityHistory: activities.slice(-10).reverse(),
    };
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const updateProfileImage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not logged in");
    const url = await ctx.storage.getUrl(args.storageId);
    await ctx.db.patch(userId, { image: url });
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").collect();
  },
});

export const deleteUserAdmin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
  },
});

export const createUserAdmin = mutation({
  args: { 
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("user"), v.literal("trainer"), v.literal("admin")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: args.role,
      status: args.status,
      createdAt: Date.now(),
    });
  },
});

export const updateUserAdmin = mutation({
  args: { 
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("user"), v.literal("trainer"), v.literal("admin")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      name: args.name,
      email: args.email,
      role: args.role,
      status: args.status,
    });
  },
});

export const changePassword = mutation({
  args: {
    oldPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Tidak terautentikasi");
    
    // Simulasi pembaruan password untuk demo hackathon
    console.log("Password update requested for: " + userId);
    return { success: true, message: "Password berhasil diperbarui." };
  },
});