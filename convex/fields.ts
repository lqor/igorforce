import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByObject = query({
  args: { objectId: v.id("objects") },
  handler: async (ctx, args) => {
    const fields = await ctx.db
      .query("fields")
      .withIndex("by_object", (q) => q.eq("objectId", args.objectId))
      .collect();
    return fields.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listByObjectName = query({
  args: { objectName: v.string() },
  handler: async (ctx, args) => {
    const obj = await ctx.db
      .query("objects")
      .withIndex("by_name", (q) => q.eq("name", args.objectName))
      .first();
    if (!obj) return [];
    const fields = await ctx.db
      .query("fields")
      .withIndex("by_object", (q) => q.eq("objectId", obj._id))
      .collect();
    return fields.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listByLookupTarget = query({
  args: { targetObjectName: v.string() },
  handler: async (ctx, args) => {
    // Get all fields and filter for lookups pointing to target
    const allObjects = await ctx.db.query("objects").collect();
    const results: Array<{
      field: any;
      objectName: string;
      objectLabel: string;
    }> = [];
    for (const obj of allObjects) {
      const fields = await ctx.db
        .query("fields")
        .withIndex("by_object", (q) => q.eq("objectId", obj._id))
        .collect();
      for (const field of fields) {
        if (field.type === "lookup" && field.lookupObject === args.targetObjectName) {
          results.push({
            field,
            objectName: obj.name,
            objectLabel: obj.label,
          });
        }
      }
    }
    return results;
  },
});

export const create = mutation({
  args: {
    objectId: v.id("objects"),
    name: v.string(),
    label: v.string(),
    type: v.string(),
    required: v.optional(v.boolean()),
    defaultValue: v.optional(v.string()),
    picklistValues: v.optional(v.array(v.string())),
    lookupObject: v.optional(v.string()),
    isCustom: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existingFields = await ctx.db
      .query("fields")
      .withIndex("by_object", (q) => q.eq("objectId", args.objectId))
      .collect();
    const sortOrder = existingFields.length;
    const isCustom = args.isCustom ?? true;
    const apiName = isCustom ? args.name.replace(/\s+/g, "_") + "__c" : args.name;

    return await ctx.db.insert("fields", {
      objectId: args.objectId,
      name: apiName,
      label: args.label,
      type: args.type,
      required: args.required ?? false,
      defaultValue: args.defaultValue,
      picklistValues: args.picklistValues,
      lookupObject: args.lookupObject,
      isNameField: false,
      isCustom,
      sortOrder,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("fields"),
    label: v.optional(v.string()),
    required: v.optional(v.boolean()),
    picklistValues: v.optional(v.array(v.string())),
    defaultValue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("fields") },
  handler: async (ctx, args) => {
    const field = await ctx.db.get(args.id);
    if (!field) throw new Error("Field not found");
    if (field.isNameField) throw new Error("Cannot delete the Name field");
    await ctx.db.delete(args.id);
  },
});
