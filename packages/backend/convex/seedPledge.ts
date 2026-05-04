import { mutation } from "./_generated/server";

export const seedPledgeData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if we already have pledge pages
    const existing = await ctx.db.query("pledgePages").first();
    if (existing) {
      return "Already seeded";
    }

    // Get a user to act as creator, or create a mock user if none exists
    let user = await ctx.db.query("users").first();
    let userId = user?._id;

    if (!userId) {
      // Create a mock user since auth uses the users table
      userId = await ctx.db.insert("users", {
        email: "test@orthfx.com",
      } as any);
    }

    // Insert a Fund
    const fundId = await ctx.db.insert("funds", {
      name: "St. Herman's Roof Repair Fund",
      description: "We are currently raising funds to repair the roof of the nave before the winter snows arrive.",
      creatorId: userId,
      financialGoal: 5000000, // $50,000 in cents
      amountRaised: 1250000, // $12,500 in cents
      status: "active",
    });

    // Insert a Pledge Page
    await ctx.db.insert("pledgePages", {
      targetFundId: fundId,
      title: "Save St. Herman's Roof",
      slug: "save-st-hermans-roof",
      storyRichText: "Our parish has been standing for over 50 years, but the recent storms have taken a toll on the roof. We need your help to keep the nave dry and safe for the coming winter. Every dollar counts!",
      allowAnonymousDonations: true,
      allowRecurringDonations: true,
      status: "published",
    });

    // Insert an Ongoing Fund
    const ongoingFundId = await ctx.db.insert("funds", {
      name: "General Operating Fund",
      description: "Ongoing support for our parish ministries and daily operations.",
      creatorId: userId,
      amountRaised: 420000,
      status: "active",
    });

    // Insert a Pledge Page for ongoing
    await ctx.db.insert("pledgePages", {
      targetFundId: ongoingFundId,
      title: "Support Our Ministries",
      slug: "support-our-ministries",
      storyRichText: "Help us continue to serve the community, feed the hungry, and maintain our daily cycle of services. Your ongoing support makes everything we do possible.",
      allowAnonymousDonations: true,
      allowRecurringDonations: true,
      status: "published",
    });

    return "Successfully seeded pledge data";
  },
});
