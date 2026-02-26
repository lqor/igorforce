import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("flowDefinitions").collect();
  },
});

export const listByStatus = query({
  args: { status: v.union(v.literal("draft"), v.literal("active"), v.literal("inactive")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flowDefinitions")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const listByTrigger = query({
  args: {
    triggerObject: v.string(),
    triggerEvent: v.union(
      v.literal("create"),
      v.literal("update"),
      v.literal("createOrUpdate"),
      v.literal("delete"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flowDefinitions")
      .withIndex("by_trigger", (q) =>
        q.eq("triggerObject", args.triggerObject).eq("triggerEvent", args.triggerEvent),
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("flowDefinitions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flowDefinitions")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("screen"),
      v.literal("recordTriggered"),
      v.literal("scheduled"),
      v.literal("autolaunched"),
    ),
    triggerObject: v.optional(v.string()),
    triggerEvent: v.optional(
      v.union(
        v.literal("create"),
        v.literal("update"),
        v.literal("createOrUpdate"),
        v.literal("delete"),
      ),
    ),
    triggerCondition: v.optional(v.any()),
    scheduleFrequency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const flowId = await ctx.db.insert("flowDefinitions", {
      ...args,
      status: "draft",
      version: 1,
    });

    // Auto-create a Start element for every new flow
    await ctx.db.insert("flowElements", {
      flowId,
      type: "start",
      label: "Start",
      positionX: 400,
      positionY: 50,
      sortOrder: 0,
    });

    return flowId;
  },
});

export const update = mutation({
  args: {
    id: v.id("flowDefinitions"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("screen"),
        v.literal("recordTriggered"),
        v.literal("scheduled"),
        v.literal("autolaunched"),
      ),
    ),
    triggerObject: v.optional(v.string()),
    triggerEvent: v.optional(
      v.union(
        v.literal("create"),
        v.literal("update"),
        v.literal("createOrUpdate"),
        v.literal("delete"),
      ),
    ),
    triggerCondition: v.optional(v.any()),
    scheduleFrequency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Flow definition not found");

    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) filtered[key] = value;
    }

    await ctx.db.patch(id, filtered);
  },
});

export const activate = mutation({
  args: { id: v.id("flowDefinitions") },
  handler: async (ctx, args) => {
    const flow = await ctx.db.get(args.id);
    if (!flow) throw new Error("Flow definition not found");

    // Validate: must have at least a Start element
    const elements = await ctx.db
      .query("flowElements")
      .withIndex("by_flow", (q) => q.eq("flowId", args.id))
      .collect();
    const hasStart = elements.some((e) => e.type === "start");
    if (!hasStart) throw new Error("Flow must have a Start element");

    // For record-triggered flows, trigger config is required
    if (flow.type === "recordTriggered") {
      if (!flow.triggerObject || !flow.triggerEvent) {
        throw new Error("Record-triggered flows require triggerObject and triggerEvent");
      }
    }

    await ctx.db.patch(args.id, { status: "active", version: flow.version + 1 });
  },
});

export const deactivate = mutation({
  args: { id: v.id("flowDefinitions") },
  handler: async (ctx, args) => {
    const flow = await ctx.db.get(args.id);
    if (!flow) throw new Error("Flow definition not found");
    await ctx.db.patch(args.id, { status: "inactive" });
  },
});

export const remove = mutation({
  args: { id: v.id("flowDefinitions") },
  handler: async (ctx, args) => {
    const flow = await ctx.db.get(args.id);
    if (!flow) throw new Error("Flow definition not found");
    if (flow.status === "active") {
      throw new Error("Cannot delete an active flow. Deactivate it first.");
    }

    // Cascade delete connections
    const connections = await ctx.db
      .query("flowConnections")
      .withIndex("by_flow", (q) => q.eq("flowId", args.id))
      .collect();
    for (const conn of connections) {
      await ctx.db.delete(conn._id);
    }

    // Cascade delete elements
    const elements = await ctx.db
      .query("flowElements")
      .withIndex("by_flow", (q) => q.eq("flowId", args.id))
      .collect();
    for (const el of elements) {
      await ctx.db.delete(el._id);
    }

    await ctx.db.delete(args.id);
  },
});
