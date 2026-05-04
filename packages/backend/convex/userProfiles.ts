import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isModerator } from "./auth.helpers";

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

// Moderator adjusts a user's creation quota
export const updateQuota = mutation({
  args: {
    userId: v.id("users"),
    maxNewCommunities: v.number(),
  },
  handler: async (ctx, args) => {
    const callerId = await getAuthUserId(ctx);
    if (!callerId) throw new Error("Not authenticated");
    if (!(await isModerator(ctx, callerId))) throw new Error("Not authorized");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) throw new Error("User has no profile");

    await ctx.db.patch(profile._id, {
      maxNewCommunities: args.maxNewCommunities,
    });
  },
});

// Moderator assigns an additional community role to an existing invited user
export const assignCommunity = mutation({
  args: {
    userId: v.id("users"),
    communityId: v.id("communities"),
    role: v.union(v.literal("admin"), v.literal("editor")),
  },
  handler: async (ctx, args) => {
    const callerId = await getAuthUserId(ctx);
    if (!callerId) throw new Error("Not authenticated");
    if (!(await isModerator(ctx, callerId))) throw new Error("Not authorized");

    // Check user has a profile (was onboarded via invite)
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!profile) throw new Error("User was not onboarded via invite");

    // Check not already assigned
    const existing = await ctx.db
      .query("roles")
      .withIndex("by_userId_communityId", (q) =>
        q.eq("userId", args.userId).eq("communityId", args.communityId),
      )
      .unique();
    if (existing) throw new Error("User already has a role in this community");

    const community = await ctx.db.get(args.communityId);
    if (!community) throw new Error("Community not found");

    await ctx.db.insert("roles", {
      userId: args.userId,
      communityId: args.communityId,
      role: args.role,
      roleStatus: "active",
    });

    if (community.status === "unclaimed") {
      await ctx.db.patch(args.communityId, { status: "verified" });
    }
  },
});

// Get profile + community info for a specific user (moderator view)
export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const callerId = await getAuthUserId(ctx);
    if (!callerId) return null;
    if (!(await isModerator(ctx, callerId))) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!profile) return null;

    const roles = await ctx.db
      .query("roles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const activeRoles = roles.filter((r) => r.roleStatus === "active" && r.communityId);

    const communities = await Promise.all(
      activeRoles.map(async (r) => {
        const c = await ctx.db.get(r.communityId!);
        return c ? { communityId: c._id, name: c.name, slug: c.slug, role: r.role } : null;
      }),
    );

    return {
      ...profile,
      communities: communities.filter(Boolean),
    };
  },
});
