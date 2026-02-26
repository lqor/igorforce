import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  objects: defineTable({
    name: v.string(),
    label: v.string(),
    pluralLabel: v.string(),
    isCustom: v.boolean(),
    icon: v.string(),
    description: v.optional(v.string()),
  }).index("by_name", ["name"]),

  fields: defineTable({
    objectId: v.id("objects"),
    name: v.string(),
    label: v.string(),
    type: v.string(),
    required: v.boolean(),
    defaultValue: v.optional(v.string()),
    picklistValues: v.optional(v.array(v.string())),
    lookupObject: v.optional(v.string()),
    isNameField: v.boolean(),
    isCustom: v.boolean(),
    sortOrder: v.number(),
  }).index("by_object", ["objectId"]),

  records: defineTable({
    objectId: v.id("objects"),
    data: v.any(),
  }).index("by_object", ["objectId"]),
});
