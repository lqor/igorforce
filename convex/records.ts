import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByObject = query({
  args: { objectId: v.id("objects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("records")
      .withIndex("by_object", (q) => q.eq("objectId", args.objectId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("records") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listByLookup = query({
  args: {
    objectId: v.id("objects"),
    fieldName: v.string(),
    lookupValue: v.string(),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("records")
      .withIndex("by_object", (q) => q.eq("objectId", args.objectId))
      .collect();
    return records.filter(
      (r) => (r.data as Record<string, unknown>)[args.fieldName] === args.lookupValue
    );
  },
});

export const create = mutation({
  args: {
    objectId: v.id("objects"),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("records", {
      objectId: args.objectId,
      data: args.data,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("records"),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { data: args.data });
  },
});

export const remove = mutation({
  args: { id: v.id("records") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
