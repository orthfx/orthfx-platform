import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import { assertCanEditCommunity, canDeleteCommunity, isSystemAdmin } from "./auth.helpers";

async function resolveImageUrls(
  ctx: QueryCtx,
  community: { avatarId?: Id<"_storage">; bannerId?: Id<"_storage"> },
) {
  return {
    avatarUrl: community.avatarId ? await ctx.storage.getUrl(community.avatarId) : null,
    bannerUrl: community.bannerId ? await ctx.storage.getUrl(community.bannerId) : null,
  };
}

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const communities = await ctx.db.query("communities").collect();
    const published = communities.filter((c) => c.published);
    return Promise.all(
      published.map(async (c) => ({
        ...c,
        ...(await resolveImageUrls(ctx, c)),
      })),
    );
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const community = await ctx.db
      .query("communities")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!community) return null;
    return { ...community, ...(await resolveImageUrls(ctx, community)) };
  },
});

// Get a single community by ID with role info (for edit view)
export const getById = query({
  args: { id: v.id("communities") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const community = await ctx.db.get(args.id);
    if (!community) return null;

    // Determine user's role
    const isSysAdmin = await isSystemAdmin(ctx, userId);
    let role = "system_admin";

    if (!isSysAdmin) {
      const userRoles = await ctx.db
        .query("roles")
        .withIndex("by_userId_communityId", (q) =>
          q.eq("userId", userId).eq("communityId", args.id),
        )
        .collect();
      const activeRole = userRoles.find((r) => r.roleStatus === "active");
      if (!activeRole) return null; // No access
      role = activeRole.role;
    }

    return {
      ...community,
      ...(await resolveImageUrls(ctx, community)),
      role,
    };
  },
});

// Communities where the user has a direct role assignment (admin/editor)
export const getMyDirect = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const userRoles = await ctx.db
      .query("roles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const activeRoles = userRoles.filter(
      (r) => r.roleStatus === "active" && r.communityId && r.role !== "system_admin",
    );

    const communities = await Promise.all(activeRoles.map((r) => ctx.db.get(r.communityId!)));

    return Promise.all(
      communities
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .map(async (c) => {
          const role = activeRoles.find((r) => r.communityId === c._id)!;
          return {
            ...c,
            ...(await resolveImageUrls(ctx, c)),
            role: role.role,
          };
        }),
    );
  },
});

// All communities — system_admin or moderator, with optional search
export const listAll = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Check for system_admin or moderator role
    const userRoles = await ctx.db
      .query("roles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const hasAccess = userRoles.some(
      (r) => (r.role === "system_admin" || r.role === "moderator") && r.roleStatus === "active",
    );
    if (!hasAccess) return [];

    const all = await ctx.db.query("communities").collect();

    const filtered = args.search
      ? all.filter((c) => {
          const q = args.search!.toLowerCase();
          return (
            c.name.toLowerCase().includes(q) ||
            c.slug.toLowerCase().includes(q) ||
            (c.city && c.city.toLowerCase().includes(q)) ||
            (c.state && c.state.toLowerCase().includes(q)) ||
            (c.jurisdiction && c.jurisdiction.toLowerCase().includes(q))
          );
        })
      : all;

    return Promise.all(
      filtered.map(async (c) => ({
        ...c,
        ...(await resolveImageUrls(ctx, c)),
        role: "system_admin" as const,
      })),
    );
  },
});

// Pending claims — system_admin only
export const listPendingClaims = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    if (!(await isSystemAdmin(ctx, userId))) return [];

    const pending = await ctx.db
      .query("communities")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const pendingWithDetails = await Promise.all(
      pending.map(async (c) => {
        const pendingRoles = await ctx.db
          .query("roles")
          .withIndex("by_communityId", (q) => q.eq("communityId", c._id))
          .collect();
        const pendingRole = pendingRoles.find((r) => r.roleStatus === "pending");

        let claimant: {
          email: string | null;
          name: string | null;
          userId: string | null;
          signedUp: number | null;
          otherCommunities: string[];
        } = {
          email: null,
          name: null,
          userId: null,
          signedUp: null,
          otherCommunities: [],
        };

        if (pendingRole) {
          const user = await ctx.db.get(pendingRole.userId);
          if (user) {
            claimant.email = (user as any).email ?? null;
            claimant.name = (user as any).name ?? null;
            claimant.userId = user._id;
            claimant.signedUp = user._creationTime;

            // Find other communities this user has roles in
            const userRoles = await ctx.db
              .query("roles")
              .withIndex("by_userId", (q) => q.eq("userId", pendingRole.userId))
              .collect();
            const otherCommunityIds = userRoles
              .filter((r) => r.communityId && r.communityId !== c._id && r.roleStatus === "active")
              .map((r) => r.communityId!);

            const otherCommunities = await Promise.all(
              otherCommunityIds.map((id) => ctx.db.get(id)),
            );
            claimant.otherCommunities = otherCommunities
              .filter((oc): oc is NonNullable<typeof oc> => oc !== null)
              .map((oc) => oc.name);
          }
        }

        return {
          ...c,
          ...(await resolveImageUrls(ctx, c)),
          role: "system_admin" as const,
          pendingRoleId: pendingRole?._id ?? null,
          claimant,
        };
      }),
    );

    return pendingWithDetails;
  },
});

// Reject a claim — system_admin only
export const rejectClaim = mutation({
  args: {
    communityId: v.id("communities"),
    roleId: v.id("roles"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (!(await isSystemAdmin(ctx, userId))) throw new Error("Not authorized");

    // Delete the pending role
    await ctx.db.delete(args.roleId);

    // Set community back to unclaimed
    await ctx.db.patch(args.communityId, { status: "unclaimed" });
  },
});

// Get the current user's top-level role
export const getMyRole = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const userRoles = await ctx.db
      .query("roles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const active = userRoles.filter((r) => r.roleStatus === "active");
    if (active.some((r) => r.role === "system_admin")) return "system_admin";
    if (active.some((r) => r.role === "moderator")) return "moderator";
    return "user";
  },
});

export const searchUnclaimed = query({
  args: { search: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Only users with a profile (invited) can search
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return [];

    const unclaimed = await ctx.db
      .query("communities")
      .withIndex("by_status", (q) => q.eq("status", "unclaimed"))
      .collect();

    const q = args.search.toLowerCase();
    const filtered = unclaimed.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.state && c.state.toLowerCase().includes(q)) ||
        (c.jurisdiction && c.jurisdiction.toLowerCase().includes(q)),
    );

    return filtered.slice(0, 20).map((c) => ({
      _id: c._id,
      name: c.name,
      slug: c.slug,
      type: c.type,
      city: c.city,
      state: c.state,
      jurisdiction: c.jurisdiction,
      address: c.address,
    }));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    type: v.optional(
      v.union(
        v.literal("parish"),
        v.literal("mission"),
        v.literal("monastery"),
        v.literal("chapel"),
        v.literal("cathedral"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check creation quota (system_admin and moderators are exempt)
    const userRoles = await ctx.db
      .query("roles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const isPrivileged = userRoles.some(
      (r) => (r.role === "system_admin" || r.role === "moderator") && r.roleStatus === "active",
    );

    if (!isPrivileged) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();

      if (!profile) {
        throw new Error("An invite is required to create communities");
      }
      if (profile.communitiesCreated >= profile.maxNewCommunities) {
        throw new Error("You have reached your community creation limit");
      }
    }

    const existing = await ctx.db
      .query("communities")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error("That subdomain is already taken");

    if (!/^[a-z0-9-]+$/.test(args.slug)) {
      throw new Error("Subdomain can only contain lowercase letters, numbers, and hyphens");
    }

    const communityId = await ctx.db.insert("communities", {
      name: args.name,
      slug: args.slug,
      type: args.type ?? "parish",
      status: "verified",
      published: false,
    });

    await ctx.db.insert("roles", {
      userId,
      communityId,
      role: "admin",
      roleStatus: "active",
    });

    // Increment counter for non-privileged users
    if (!isPrivileged) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();
      if (profile) {
        await ctx.db.patch(profile._id, {
          communitiesCreated: profile.communitiesCreated + 1,
        });
      }
    }

    return communityId;
  },
});

export const update = mutation({
  args: {
    id: v.id("communities"),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("parish"),
        v.literal("mission"),
        v.literal("monastery"),
        v.literal("chapel"),
        v.literal("cathedral"),
      ),
    ),
    jurisdiction: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    avatarId: v.optional(v.id("_storage")),
    bannerId: v.optional(v.id("_storage")),
    services: v.optional(
      v.array(
        v.object({
          name: v.string(),
          day: v.string(),
          time: v.string(),
        }),
      ),
    ),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await assertCanEditCommunity(ctx, userId, args.id);

    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }

    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("communities") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!(await canDeleteCommunity(ctx, userId, args.id))) {
      throw new Error("Not authorized");
    }

    // Delete associated personnel
    const personnel = await ctx.db
      .query("personnel")
      .withIndex("by_communityId", (q) => q.eq("communityId", args.id))
      .collect();
    for (const p of personnel) {
      await ctx.db.delete(p._id);
    }

    // Delete associated roles
    const roles = await ctx.db
      .query("roles")
      .withIndex("by_communityId", (q) => q.eq("communityId", args.id))
      .collect();
    for (const r of roles) {
      await ctx.db.delete(r._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const claim = mutation({
  args: { id: v.id("communities") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const community = await ctx.db.get(args.id);
    if (!community) throw new Error("Not found");
    if (community.status !== "unclaimed") {
      throw new Error("This community has already been claimed");
    }

    // Users with a profile (came through invite) get auto-approved
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      // Check quota
      if (profile.communitiesCreated >= profile.maxNewCommunities) {
        throw new Error("You have reached your community creation limit");
      }

      await ctx.db.patch(args.id, { status: "verified" });
      await ctx.db.insert("roles", {
        userId,
        communityId: args.id,
        role: "admin",
        roleStatus: "active",
      });
      await ctx.db.patch(profile._id, {
        communitiesCreated: profile.communitiesCreated + 1,
      });
    } else {
      // No profile — go through approval flow
      await ctx.db.patch(args.id, { status: "pending" });
      await ctx.db.insert("roles", {
        userId,
        communityId: args.id,
        role: "admin",
        roleStatus: "pending",
      });
    }
  },
});

export const approveClaim = mutation({
  args: {
    communityId: v.id("communities"),
    roleId: v.id("roles"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Must be system_admin or jurisdiction_admin
    const isSysAdmin = await isSystemAdmin(ctx, userId);
    if (!isSysAdmin) {
      const community = await ctx.db.get(args.communityId);
      if (!community) throw new Error("Not found");

      if (community.jurisdiction) {
        const userRoles = await ctx.db
          .query("roles")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .collect();
        const hasJurisdictionAccess = userRoles.some(
          (r) =>
            r.role === "jurisdiction_admin" &&
            r.roleStatus === "active" &&
            r.jurisdictionId === community.jurisdiction,
        );
        if (!hasJurisdictionAccess) throw new Error("Not authorized");
      } else {
        throw new Error("Not authorized");
      }
    }

    await ctx.db.patch(args.roleId, { roleStatus: "active" });
    await ctx.db.patch(args.communityId, { status: "verified" });
  },
});
