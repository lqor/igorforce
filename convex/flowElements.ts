import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const elementTypeValidator = v.union(
  v.literal("start"),
  v.literal("screen"),
  v.literal("decision"),
  v.literal("assignment"),
  v.literal("loop"),
  v.literal("getRecords"),
  v.literal("createRecords"),
  v.literal("updateRecords"),
  v.literal("deleteRecords"),
  v.literal("action"),
  v.literal("subflow"),
  v.literal("pause"),
  v.literal("end"),
);

export const listByFlow = query({
  args: { flowId: v.id("flowDefinitions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flowElements")
      .withIndex("by_flow", (q) => q.eq("flowId", args.flowId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("flowElements") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    flowId: v.id("flowDefinitions"),
    type: elementTypeValidator,
    label: v.string(),
    description: v.optional(v.string()),
    positionX: v.number(),
    positionY: v.number(),
    config: v.optional(v.any()),
    defaultConnectorLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const flow = await ctx.db.get(args.flowId);
    if (!flow) throw new Error("Flow definition not found");

    // Auto-assign sortOrder
    const existing = await ctx.db
      .query("flowElements")
      .withIndex("by_flow", (q) => q.eq("flowId", args.flowId))
      .collect();
    const maxSort = existing.reduce((max, e) => Math.max(max, e.sortOrder), -1);

    return await ctx.db.insert("flowElements", {
      ...args,
      sortOrder: maxSort + 1,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("flowElements"),
    label: v.optional(v.string()),
    description: v.optional(v.string()),
    positionX: v.optional(v.number()),
    positionY: v.optional(v.number()),
    config: v.optional(v.any()),
    defaultConnectorLabel: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Flow element not found");

    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) filtered[key] = value;
    }

    await ctx.db.patch(id, filtered);
  },
});

export const updatePosition = mutation({
  args: {
    id: v.id("flowElements"),
    positionX: v.number(),
    positionY: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Flow element not found");
    await ctx.db.patch(args.id, {
      positionX: args.positionX,
      positionY: args.positionY,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("flowElements") },
  handler: async (ctx, args) => {
    const element = await ctx.db.get(args.id);
    if (!element) throw new Error("Flow element not found");
    if (element.type === "start") {
      throw new Error("Cannot delete the Start element");
    }

    // Cascade delete connections referencing this element
    const outgoing = await ctx.db
      .query("flowConnections")
      .withIndex("by_source", (q) => q.eq("sourceElementId", args.id))
      .collect();
    for (const conn of outgoing) {
      await ctx.db.delete(conn._id);
    }

    const incoming = await ctx.db
      .query("flowConnections")
      .withIndex("by_target", (q) => q.eq("targetElementId", args.id))
      .collect();
    for (const conn of incoming) {
      await ctx.db.delete(conn._id);
    }

    await ctx.db.delete(args.id);
  },
});
