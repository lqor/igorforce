import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listByFlow = query({
  args: { flowId: v.id("flowDefinitions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flowConnections")
      .withIndex("by_flow", (q) => q.eq("flowId", args.flowId))
      .collect();
  },
});

export const listBySource = query({
  args: { sourceElementId: v.id("flowElements") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flowConnections")
      .withIndex("by_source", (q) => q.eq("sourceElementId", args.sourceElementId))
      .collect();
  },
});

export const listByTarget = query({
  args: { targetElementId: v.id("flowElements") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flowConnections")
      .withIndex("by_target", (q) => q.eq("targetElementId", args.targetElementId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("flowConnections") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    flowId: v.id("flowDefinitions"),
    sourceElementId: v.id("flowElements"),
    targetElementId: v.id("flowElements"),
    conditionLabel: v.optional(v.string()),
    condition: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Validate source and target exist and belong to the same flow
    const source = await ctx.db.get(args.sourceElementId);
    if (!source) throw new Error("Source element not found");
    if (source.flowId !== args.flowId) throw new Error("Source element belongs to a different flow");

    const target = await ctx.db.get(args.targetElementId);
    if (!target) throw new Error("Target element not found");
    if (target.flowId !== args.flowId) throw new Error("Target element belongs to a different flow");

    // Prevent self-connections
    if (args.sourceElementId === args.targetElementId) {
      throw new Error("Cannot connect an element to itself");
    }

    // Auto-assign sortOrder
    const existing = await ctx.db
      .query("flowConnections")
      .withIndex("by_source", (q) => q.eq("sourceElementId", args.sourceElementId))
      .collect();
    const maxSort = existing.reduce((max, c) => Math.max(max, c.sortOrder), -1);

    return await ctx.db.insert("flowConnections", {
      ...args,
      sortOrder: maxSort + 1,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("flowConnections"),
    conditionLabel: v.optional(v.string()),
    condition: v.optional(v.any()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Flow connection not found");

    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) filtered[key] = value;
    }

    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("flowConnections") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Flow connection not found");
    await ctx.db.delete(args.id);
  },
});
