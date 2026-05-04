import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  communities: defineTable({
    name: v.string(),
    slug: v.string(),
    customDomain: v.optional(v.string()),
    type: v.union(
      v.literal("parish"),
      v.literal("mission"),
      v.literal("monastery"),
      v.literal("chapel"),
      v.literal("cathedral"),
    ),
    status: v.union(v.literal("verified"), v.literal("unclaimed"), v.literal("pending")),
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
    published: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_customDomain", ["customDomain"])
    .index("by_status", ["status"])
    .index("by_jurisdiction", ["jurisdiction"]),

  personnel: defineTable({
    communityId: v.id("communities"),
    name: v.string(),
    title: v.string(),
    order: v.number(),
    avatarId: v.optional(v.id("_storage")),
  }).index("by_communityId", ["communityId"]),

  roles: defineTable({
    userId: v.id("users"),
    communityId: v.optional(v.id("communities")),
    jurisdictionId: v.optional(v.string()),
    role: v.union(
      v.literal("system_admin"),
      v.literal("moderator"),
      v.literal("jurisdiction_admin"),
      v.literal("admin"),
      v.literal("editor"),
    ),
    roleStatus: v.union(v.literal("active"), v.literal("pending")),
  })
    .index("by_userId", ["userId"])
    .index("by_communityId", ["communityId"])
    .index("by_jurisdictionId", ["jurisdictionId"])
    .index("by_userId_communityId", ["userId", "communityId"]),

  invites: defineTable({
    token: v.string(),
    createdBy: v.id("users"),
    label: v.optional(v.string()),
    preAssignedCommunities: v.array(
      v.object({
        communityId: v.id("communities"),
        role: v.union(v.literal("admin"), v.literal("editor")),
      }),
    ),
    maxNewCommunities: v.number(),
    email: v.optional(v.string()),
    usedBy: v.optional(v.id("users")),
    usedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
  })
    .index("by_token", ["token"])
    .index("by_createdBy", ["createdBy"])
    .index("by_usedBy", ["usedBy"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    maxNewCommunities: v.number(),
    communitiesCreated: v.number(),
  }).index("by_userId", ["userId"]),

  // ---------------------------------------------------------
  // CORE FINANCIAL PRIMITIVES (THE ENGINE)
  // ---------------------------------------------------------

  funds: defineTable({
    name: v.string(), // e.g., "General Operating", "Roof Repair"
    description: v.optional(v.string()),
    
    // Who owns the money in this fund?
    communityId: v.optional(v.id("communities")), // If owned by a church
    creatorId: v.id("users"), // Person who created the fund
    
    // Stripe Connect ID to route funds to
    stripeAccountId: v.optional(v.string()), 
    
    // Optional goal constraints
    financialGoal: v.optional(v.number()), // Target in cents, if applicable
    amountRaised: v.number(), // Cached total in cents
    
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("archived")
    ),
  })
    .index("by_communityId", ["communityId"])
    .index("by_creatorId", ["creatorId"])
    .index("by_status", ["status"]),

  transactions: defineTable({
    fundId: v.id("funds"),
    amount: v.number(), // Amount in cents
    
    // Donor info
    userId: v.optional(v.id("users")), // If donor has an account
    donorName: v.optional(v.string()), 
    donorEmail: v.optional(v.string()),
    isAnonymous: v.boolean(), // Prevent donorName from appearing on public feeds
    message: v.optional(v.string()), 
    
    status: v.union(
      v.literal("pending"), 
      v.literal("succeeded"), 
      v.literal("failed"),
      v.literal("refunded")
    ),
    
    type: v.union(v.literal("one_time"), v.literal("recurring")),
    subscriptionId: v.optional(v.id("subscriptions")), // If part of a recurring plan
    
    // Stripe references
    stripeCheckoutSessionId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    stripeInvoiceId: v.optional(v.string()),
  })
    .index("by_fundId", ["fundId"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_subscriptionId", ["subscriptionId"])
    .index("by_fund_status", ["fundId", "status"]),

  subscriptions: defineTable({
    fundId: v.id("funds"),
    userId: v.optional(v.id("users")),
    donorName: v.optional(v.string()),
    donorEmail: v.optional(v.string()),
    
    amount: v.number(), // Cents per interval
    interval: v.union(v.literal("week"), v.literal("month"), v.literal("year")),
    
    status: v.union(
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
      v.literal("unpaid")
    ),
    
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
  })
    .index("by_fundId", ["fundId"])
    .index("by_userId", ["userId"])
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"]),

  // ---------------------------------------------------------
  // PRESENTATION PRIMITIVES (THE UI WRAPPERS)
  // ---------------------------------------------------------

  pledgePages: defineTable({
    // Visual wrapper for a specific fund (GoFundMe style)
    targetFundId: v.id("funds"),
    title: v.string(),
    slug: v.string(),
    storyRichText: v.string(),
    
    coverImageId: v.optional(v.id("_storage")),
    videoUrl: v.optional(v.string()),
    
    publishedAt: v.optional(v.number()),
    deadlineAt: v.optional(v.number()),
    
    allowAnonymousDonations: v.boolean(),
    allowRecurringDonations: v.boolean(),
    
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
  })
    .index("by_slug", ["slug"])
    .index("by_targetFundId", ["targetFundId"])
    .index("by_status", ["status"]),

  givingForms: defineTable({
    // Configuration for an embedded giving widget on a `sites` page
    communityId: v.id("communities"),
    
    // Which funds show up in the dropdown?
    availableFundIds: v.array(v.id("funds")),
    defaultFundId: v.optional(v.id("funds")),
    
    allowCustomAmounts: v.boolean(),
    suggestedAmounts: v.array(v.number()), // e.g. [5000, 10000, 25000] for $50, $100, $250
    
    // Visual customization for the widget
    primaryColor: v.optional(v.string()),
    title: v.optional(v.string()), // e.g., "Support Our Parish"
    description: v.optional(v.string()),
  })
    .index("by_communityId", ["communityId"]),

  pledgePageUpdates: defineTable({
    pledgePageId: v.id("pledgePages"),
    creatorId: v.id("users"),
    title: v.string(),
    body: v.string(),
    imageId: v.optional(v.id("_storage")),
  })
    .index("by_pledgePageId", ["pledgePageId"])
    .index("by_creatorId", ["creatorId"]),
});
