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

  flowDefinitions: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("screen"),
      v.literal("recordTriggered"),
      v.literal("scheduled"),
      v.literal("autolaunched"),
    ),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("inactive")),
    // For recordTriggered flows
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
    // For scheduled flows
    scheduleFrequency: v.optional(v.string()),
    // Metadata
    version: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_status", ["status"])
    .index("by_type_status", ["type", "status"])
    .index("by_trigger", ["triggerObject", "triggerEvent"]),

  flowElements: defineTable({
    flowId: v.id("flowDefinitions"),
    type: v.union(
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
    ),
    label: v.string(),
    description: v.optional(v.string()),
    // Canvas position
    positionX: v.number(),
    positionY: v.number(),
    // Type-specific configuration stored as flexible JSON
    config: v.optional(v.any()),
    // For decision elements: default connector target
    defaultConnectorLabel: v.optional(v.string()),
    sortOrder: v.number(),
  })
    .index("by_flow", ["flowId"])
    .index("by_flow_type", ["flowId", "type"]),

  flowConnections: defineTable({
    flowId: v.id("flowDefinitions"),
    sourceElementId: v.id("flowElements"),
    targetElementId: v.id("flowElements"),
    // For decision branches or loop iteration paths
    conditionLabel: v.optional(v.string()),
    // Condition logic (e.g., for decision outcomes)
    condition: v.optional(v.any()),
    sortOrder: v.number(),
  })
    .index("by_flow", ["flowId"])
    .index("by_source", ["sourceElementId"])
    .index("by_target", ["targetElementId"]),
});
