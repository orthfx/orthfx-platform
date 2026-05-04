import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      email: (user as any).email ?? null,
      name: (user as any).name ?? null,
    };
  },
});

export const updateEmail = mutation({
  args: { newEmail: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const newEmail = args.newEmail.toLowerCase().trim();

    // Check new email not already in use
    const existingAccounts = await ctx.db.query("authAccounts").collect();
    const conflict = existingAccounts.find(
      (a) => a.providerAccountId === newEmail && a.userId !== userId,
    );
    if (conflict) throw new Error("That email is already in use");

    // Update the password provider account identifier
    const myAccount = existingAccounts.find(
      (a) => a.userId === userId && a.provider === "password",
    );
    if (!myAccount) throw new Error("No password account found");

    await ctx.db.patch(myAccount._id, { providerAccountId: newEmail });

    // Update user record
    await ctx.db.patch(userId, { email: newEmail } as any);
  },
});
