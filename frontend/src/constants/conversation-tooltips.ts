


export const conversationTooltips = {

  dialog: {
    header: "Conversation configurations define how traces are grouped into conversations using stitching attributes. Traces sharing the same value for any configured attribute are automatically grouped together, enabling you to view complete conversation threads across multiple traces."
  },


  form: {
    name: "A descriptive name for this conversation configuration (e.g., 'Default Conversation', 'User Session Grouping'). This name appears in configuration lists and helps identify the grouping strategy.",
    description: "Optional description explaining the purpose of this conversation configuration and which types of traces it groups together. Helps team members understand when and how this configuration is used.",
    orOperation: "Traces will be grouped into conversations if they share the same value for **any** of the configured attribute names. Multiple attribute names are combined with an OR operation - this means a trace matches if it has a matching value for ANY of the attributes, not all of them.",
    stitchingAttributesHeader: "Stitching attributes are OpenTelemetry span attribute keys that identify which traces belong to the same conversation. Traces with matching values for any of these attributes will be grouped together into a conversation.",
    stitchingAttributeInput: "An OpenTelemetry span attribute key that identifies traces belonging to the same conversation. Examples: 'conversation.id', 'trace.conversation_id', 'session.id'. Traces sharing the same value for this attribute will be grouped together. Multiple attributes use OR logic - traces match if they share a value for ANY configured attribute."
  },


  import: {
    dialogHeader: "Import conversation configurations from a YAML file. The file should contain one or more conversation configuration definitions."
  }
} as const;
export type ConversationTooltips = typeof conversationTooltips;