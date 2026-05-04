import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isSystemAdmin } from "./auth.helpers";

// List all moderators — system_admin only
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    if (!(await isSystemAdmin(ctx, userId))) return [];

    const allRoles = await ctx.db.query("roles").collect();
    const moderatorRoles = allRoles.filter(
      (r) => r.role === "moderator" && r.roleStatus === "active",
    );

    return Promise.all(
      moderatorRoles.map(async (r) => {
        const user = await ctx.db.get(r.userId);
        return {
          roleId: r._id,
          userId: r.userId,
          email: (user as any)?.email ?? "Unknown",
        };
      }),
    );
  },
});

// Add a moderator by email — system_admin only
export const add = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (!(await isSystemAdmin(ctx, userId))) throw new Error("Not authorized");

    // Find user by email
    const users = await ctx.db.query("users").collect();
    const targetUser = users.find(
      (u) => (u as any).email?.toLowerCase() === args.email.toLowerCase(),
    );
    if (!targetUser) {
      throw new Error("No user found with that email. They need to sign up first.");
    }

    // Check if already a moderator
    const existingRoles = await ctx.db
      .query("roles")
      .withIndex("by_userId", (q) => q.eq("userId", targetUser._id))
      .collect();
    const alreadyMod = existingRoles.some(
      (r) => r.role === "moderator" && r.roleStatus === "active",
    );
    if (alreadyMod) throw new Error("User is already a moderator");

    await ctx.db.insert("roles", {
      userId: targetUser._id,
      role: "moderator",
      roleStatus: "active",
    });
  },
});

// Remove a moderator — system_admin only
export const remove = mutation({
  args: { roleId: v.id("roles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (!(await isSystemAdmin(ctx, userId))) throw new Error("Not authorized");

    const role = await ctx.db.get(args.roleId);
    if (!role || role.role !== "moderator") throw new Error("Not a moderator role");

    await ctx.db.delete(args.roleId);
  },
});
