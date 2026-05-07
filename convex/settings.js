import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("systemSettings").first();
    if (!settings) {
      // Default settings
      return {
        dailyBookingLimit: 3,
        maintenanceMode: false,
        whatsappNotifications: true,
        accentColor: "#cdff00",
        complexAnimations: true,
      };
    }
    return settings;
  },
});

export const updateSettings = mutation({
  args: {
    dailyBookingLimit: v.optional(v.number()),
    maintenanceMode: v.optional(v.boolean()),
    whatsappNotifications: v.optional(v.boolean()),
    accentColor: v.optional(v.string()),
    complexAnimations: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("systemSettings").first();
    const update = {
      ...args,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, update);
    } else {
      // Create with defaults if not exists
      await ctx.db.insert("systemSettings", {
        dailyBookingLimit: 3,
        maintenanceMode: false,
        whatsappNotifications: true,
        accentColor: "#cdff00",
        complexAnimations: true,
        ...update,
      });
    }
  },
});
