import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { isModerator } from "./auth.helpers";

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

// Create a new invite with pre-provisioned permissions
export const create = mutation({
  args: {
    label: v.optional(v.string()),
    preAssignedCommunities: v.array(
      v.object({
        communityId: v.id("communities"),
        role: v.union(v.literal("admin"), v.literal("editor")),
      }),
    ),
    maxNewCommunities: v.number(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (!(await isModerator(ctx, userId))) {
      throw new Error("Not authorized — moderator or system_admin required");
    }

    const token = generateToken();

    const inviteId = await ctx.db.insert("invites", {
      token,
      createdBy: userId,
      label: args.label,
      preAssignedCommunities: args.preAssignedCommunities,
      maxNewCommunities: args.maxNewCommunities,
      email: args.email ? args.email.toLowerCase().trim() : undefined,
    });

    return { inviteId, token };
  },
});

// Update an unredeemed invite's permissions
export const update = mutation({
  args: {
    inviteId: v.id("invites"),
    label: v.optional(v.string()),
    preAssignedCommunities: v.optional(
      v.array(
        v.object({
          communityId: v.id("communities"),
          role: v.union(v.literal("admin"), v.literal("editor")),
        }),
      ),
    ),
    maxNewCommunities: v.optional(v.number()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (!(await isModerator(ctx, userId))) {
      throw new Error("Not authorized");
    }

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invite not found");
    if (invite.usedBy) throw new Error("Cannot edit a redeemed invite");
    if (invite.revokedAt) throw new Error("Cannot edit a revoked invite");

    const updates: Record<string, unknown> = {};
    if (args.label !== undefined) updates.label = args.label;
    if (args.preAssignedCommunities !== undefined)
      updates.preAssignedCommunities = args.preAssignedCommunities;
    if (args.maxNewCommunities !== undefined) updates.maxNewCommunities = args.maxNewCommunities;
    if (args.email !== undefined) updates.email = args.email;

    await ctx.db.patch(args.inviteId, updates);
  },
});

// Revoke an unredeemed invite
export const revoke = mutation({
  args: { inviteId: v.id("invites") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (!(await isModerator(ctx, userId))) {
      throw new Error("Not authorized");
    }

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invite not found");
    if (invite.usedBy) throw new Error("Cannot revoke a redeemed invite");

    await ctx.db.patch(args.inviteId, { revokedAt: Date.now() });
  },
});

// Redeem an invite — applies pre-provisioned permissions to the current user
export const redeem = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const invite = await ctx.db
      .query("invites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!invite) throw new Error("Invalid invite link");
    if (invite.usedBy) throw new Error("This invite has already been used");
    if (invite.revokedAt) throw new Error("This invite has been revoked");

    // Email lock check — use authAccounts.providerAccountId (the password
    // provider stores the email there; users.email may not be set yet on signup)
    if (invite.email) {
      const accounts = await ctx.db.query("authAccounts").collect();
      const passwordAccount = accounts.find(
        (a) => a.userId === userId && a.provider === "password",
      );
      const userEmail = (
        passwordAccount?.providerAccountId ??
        ((await ctx.db.get(userId)) as any)?.email ??
        ""
      )
        .toLowerCase()
        .trim();
      if (userEmail !== invite.email.toLowerCase().trim()) {
        throw new Error("This invite is reserved for a different email address");
      }
    }

    // Check user doesn't already have a profile (double-redeem protection)
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existingProfile) {
      throw new Error("You have already redeemed an invite");
    }

    // Apply pre-assigned community roles
    for (const assignment of invite.preAssignedCommunities) {
      const community = await ctx.db.get(assignment.communityId);
      if (!community) continue;

      // Check not already assigned
      const existing = await ctx.db
        .query("roles")
        .withIndex("by_userId_communityId", (q) =>
          q.eq("userId", userId).eq("communityId", assignment.communityId),
        )
        .unique();
      if (!existing) {
        await ctx.db.insert("roles", {
          userId,
          communityId: assignment.communityId,
          role: assignment.role,
          roleStatus: "active",
        });
        // Auto-verify if previously unclaimed
        if (community.status === "unclaimed") {
          await ctx.db.patch(assignment.communityId, { status: "verified" });
        }
      }
    }

    // Create user profile with creation quota
    await ctx.db.insert("userProfiles", {
      userId,
      maxNewCommunities: invite.maxNewCommunities,
      communitiesCreated: 0,
    });

    // Mark invite as used
    await ctx.db.patch(invite._id, {
      usedBy: userId,
      usedAt: Date.now(),
    });

    const needsOnboarding =
      invite.preAssignedCommunities.length === 0 && invite.maxNewCommunities > 0;

    return {
      needsOnboarding,
      communitiesAssigned: invite.preAssignedCommunities.length,
    };
  },
});

// Get invite info by token (for signup/redeem page, pre-auth)
export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!invite) return null;

    const communities = await Promise.all(
      invite.preAssignedCommunities.map(async (a) => {
        const c = await ctx.db.get(a.communityId);
        return c ? { name: c.name, slug: c.slug, role: a.role } : null;
      }),
    );

    return {
      label: invite.label ?? null,
      communities: communities.filter(Boolean),
      maxNewCommunities: invite.maxNewCommunities,
      used: !!invite.usedBy,
      revoked: !!invite.revokedAt,
      emailLocked: !!invite.email,
    };
  },
});

// List all invites (moderator+)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    if (!(await isModerator(ctx, userId))) return [];

    const invites = await ctx.db.query("invites").collect();

    return Promise.all(
      invites.map(async (inv) => {
        const communities = await Promise.all(
          inv.preAssignedCommunities.map(async (a) => {
            const c = await ctx.db.get(a.communityId);
            return c ? { name: c.name, slug: c.slug, role: a.role } : null;
          }),
        );

        let redeemedUser: {
          email: string | null;
          name: string | null;
        } | null = null;
        if (inv.usedBy) {
          const user = await ctx.db.get(inv.usedBy);
          if (user) {
            redeemedUser = {
              email: (user as any).email ?? null,
              name: (user as any).name ?? null,
            };
          }
        }

        return {
          _id: inv._id,
          token: inv.token,
          label: inv.label ?? null,
          communities: communities.filter(Boolean),
          maxNewCommunities: inv.maxNewCommunities,
          emailLocked: inv.email ?? null,
          used: !!inv.usedBy,
          usedBy: inv.usedBy ?? null,
          usedAt: inv.usedAt ?? null,
          revoked: !!inv.revokedAt,
          revokedAt: inv.revokedAt ?? null,
          redeemedUser,
          _creationTime: inv._creationTime,
        };
      }),
    );
  },
});
