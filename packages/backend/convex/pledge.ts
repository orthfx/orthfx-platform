import { v } from "convex/values";
import { query } from "./_generated/server";

export const getPledgePages = query({
  args: {},
  handler: async (ctx) => {
    const pages = await ctx.db
      .query("pledgePages")
      .filter((q) => q.eq(q.field("status"), "published"))
      .order("desc")
      .take(20);

    // Enrich with fund data
    const enriched = await Promise.all(
      pages.map(async (page) => {
        const fund = await ctx.db.get(page.targetFundId);
        return { ...page, fund };
      })
    );

    return enriched;
  },
});

export const getPledgePageBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("pledgePages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!page) return null;

    const fund = await ctx.db.get(page.targetFundId);
    return { ...page, fund };
  },
});
