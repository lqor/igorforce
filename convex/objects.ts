import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("objects").collect();
  },
});

export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("objects")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

export const get = query({
  args: { id: v.id("objects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    label: v.string(),
    pluralLabel: v.string(),
    icon: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiName = args.name.replace(/\s+/g, "_") + "__c";
    const objectId = await ctx.db.insert("objects", {
      name: apiName,
      label: args.label,
      pluralLabel: args.pluralLabel,
      isCustom: true,
      icon: args.icon ?? "Box",
      description: args.description,
    });
    // Auto-create Name field for every custom object
    await ctx.db.insert("fields", {
      objectId,
      name: "Name",
      label: "Name",
      type: "text",
      required: true,
      isNameField: true,
      isCustom: false,
      sortOrder: 0,
    });
    return objectId;
  },
});

export const remove = mutation({
  args: { id: v.id("objects") },
  handler: async (ctx, args) => {
    const obj = await ctx.db.get(args.id);
    if (!obj || !obj.isCustom) {
      throw new Error("Can only delete custom objects");
    }
    // Cascade delete fields
    const fields = await ctx.db
      .query("fields")
      .withIndex("by_object", (q) => q.eq("objectId", args.id))
      .collect();
    for (const field of fields) {
      await ctx.db.delete(field._id);
    }
    // Cascade delete records
    const records = await ctx.db
      .query("records")
      .withIndex("by_object", (q) => q.eq("objectId", args.id))
      .collect();
    for (const record of records) {
      await ctx.db.delete(record._id);
    }
    await ctx.db.delete(args.id);
  },
});
