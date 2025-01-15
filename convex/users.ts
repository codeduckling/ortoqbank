import { UserJSON } from "@clerk/backend";
import { internalMutation, query, QueryCtx } from "./_generated/server";
import { ConvexError, v, Validator } from "convex/values";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    console.log("no user info found", identity);
    return null;
  }
  return await userByClerkUserId(ctx, identity.subject);
}

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

async function userByClerkUserId(ctx: QueryCtx, clerkUserId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerkUserId")
    .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
    .unique();
}

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  async handler(ctx, { data }) {
    const userAttributes = {
      email: data.email_addresses[0].email_address,
      clerkUserId: data.id,
      firstName: data.first_name ?? undefined,
      lastName: data.last_name ?? undefined,
      imageUrl: data.image_url ?? undefined,
    };

    const user = await userByClerkUserId(ctx, data.id);
    if (user === null) {
      const newUser = await ctx.db.insert("users", userAttributes);
      return newUser;
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, { clerkUserId }) => {
    const user = await userByClerkUserId(ctx, clerkUserId);

    if (user) {
      await ctx.db.delete(user._id);
    } else {
      throw new ConvexError("User not found");
    }
  },
});
