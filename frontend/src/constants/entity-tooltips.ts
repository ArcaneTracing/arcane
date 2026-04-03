


export const entityTooltips = {

  whatAreEntities: {
    comprehensive: "Entities are reusable definitions that categorize and identify different components in your AI/LLM system. They work like smart labels that automatically tag spans in your traces based on matching rules you define.\n\n**How they work:**\n- You create an entity with matching rules (e.g., match spans where 'gen_ai.request.model' equals 'gpt-4-turbo')\n- The system automatically tags matching spans with that entity\n- You can then filter traces by entity, visualize entity-specific metrics, and understand your AI system's architecture\n\n**Common use cases:**\n- Track different LLM models (GPT-4, Claude, etc.)\n- Monitor tools and function calls\n- Identify agents and multi-step workflows\n- Categorize custom components (environments, pipelines, etc.)\n\n**Benefits:**\n- Automatic span categorization without manual tagging\n- Consistent organization across your observability data\n- Easy filtering and analysis of specific components\n- Visual representation of your AI system's structure",
    medium: "Entities categorize AI/LLM components (models, tools, agents, custom types) in your traces. They use matching rules based on OpenTelemetry attributes to automatically tag spans, making it easy to filter, visualize, and analyze specific parts of your AI infrastructure.",
    short: "Entities automatically categorize and tag spans in your traces based on matching rules. They help identify and analyze different AI/LLM components like models, tools, and agents.",
    oneLiner: "Entities categorize AI components in traces using automatic matching rules."
  },


  tab: {
    header: "Entities categorize AI/LLM components (models, tools, agents, custom types) in your traces. They use matching rules based on OpenTelemetry attributes to automatically tag spans, making it easy to filter, visualize, and analyze specific parts of your AI infrastructure.",
    newEntityButton: "Create a new entity to categorize and track LLM components (models, tools, agents, etc.) in your traces.",
    importButton: "Import entities from a JSON or CSV file. Useful for bulk importing entity configurations or migrating from another system.",
    exportButton: "Export all entities to a file for backup, sharing, or migration purposes."
  },


  dialog: {
    header: "Entities categorize and identify AI/LLM components in your traces. They use matching rules (based on OpenTelemetry attributes) to automatically tag spans, making it easy to filter and analyze specific models, tools, agents, or custom components."
  },


  entityType: {
    dropdown: "Select the type of AI/LLM component this entity represents. Each type has pre-configured attributes optimized for that component type.",
    model: "For LLM models (GPT-4, Claude, etc.). Automatically includes attributes like model name, input/output tokens, and request/response models.",
    tool: "For function calling tools used by LLMs. Tracks tool names and execution details in your traces.",
    embedding: "For embedding models that convert text to vectors. Tracks embedding dimensions, model names, and token usage.",
    retriever: "For RAG (Retrieval-Augmented Generation) retrieval systems. Tracks data source IDs and retrieval operations.",
    guardrail: "For safety and content moderation systems. Tracks guardrail IDs, names, and enforcement actions.",
    evaluator: "For evaluation and scoring systems that assess LLM outputs. Tracks evaluator names, score labels, and values.",
    agent: "For AI agents and multi-step reasoning systems. Tracks agent names and orchestration details.",
    custom: "Create a custom entity type for components not covered by standard types. Define your own type identifier and select an icon."
  },


  customEntity: {
    typeInput: "Enter a unique identifier for this custom entity type (e.g., 'CHAIN', 'PIPELINE', 'EMBEDDER'). This will be displayed as the entity type in traces and tables.",
    iconPicker: "Select a visual icon to represent this custom entity. Icons help quickly identify entity types in trace visualizations and dashboards."
  },


  basicInfo: {
    name: "A descriptive name for this entity (e.g., 'GPT-4 Turbo Production', 'Content Moderation Guardrail'). This name appears in trace views and entity lists.",
    description: "Optional description explaining what this entity represents and how it's used in your AI system. Helps team members understand the entity's purpose."
  },


  matching: {
    attributeKey: "The OpenTelemetry span attribute key that identifies this entity in traces. Common examples: 'gen_ai.request.model' for models, 'gen_ai.agent.id' for agents. This is how the system matches spans to entities.",
    patternTypeValue: "Use exact value matching when you know the exact attribute value (e.g., 'gpt-4-turbo'). Best for specific model names or IDs.",
    patternTypeRegex: "Use JavaScript/ECMAScript regex pattern matching for flexible matching (e.g., '^gpt-4.*' matches all GPT-4 variants). Useful when attribute values follow a pattern. Patterns use JavaScript's native RegExp engine.",
    matchValue: "The exact value that must match the span attribute. Example: If attribute key is 'gen_ai.request.model', enter 'gpt-4-turbo' to match only that specific model.",
    matchPattern: "A JavaScript/ECMAScript regular expression pattern to match attribute values. Example: '^gpt-4.*' matches 'gpt-4-turbo', 'gpt-4-32k', etc. Use this for flexible matching across model variants. Patterns use JavaScript's native RegExp engine."
  },


  highlights: {
    sectionHeader: "Highlights are span attributes that will be prominently displayed when viewing traces. They help surface important information like token counts, model names, or error codes at a glance.",
    title: "A user-friendly label for this highlight (e.g., 'Input Tokens', 'Model Name'). This is what users see in the trace viewer.",
    spanAttributeKey: "The OpenTelemetry attribute key from spans that contains the data to highlight. Examples: 'gen_ai.usage.input_tokens', 'gen_ai.request.model'. Must match the actual attribute keys in your traces.",
    valueType: "The data type of this attribute: String (text), Number (numeric values), or Boolean (true/false). Ensures proper formatting and sorting in the UI."
  },


  messageMatching: {
    typeDropdown: "Configure how conversation messages are extracted from spans. Required for Model entities to display chat conversations in trace views.",
    canonical: "Use when your instrumentation library follows OpenTelemetry semantic conventions and stores messages in the standard format with dedicated input/output attribute keys (e.g., 'llm.input.messages', 'llm.output.messages').",
    flat: String.raw`Use when message data is stored as individual span attributes (e.g., separate attributes for role, content, tool calls). This is where most current instrumentation libraries fall - they store message components as separate attributes rather than following OpenTelemetry semantic conventions.

**Important:** Flat patterns use JavaScript/ECMAScript regex syntax with capture groups to extract message indices. Use capture groups (e.g., (\d+)) in your patterns to extract the message index from attribute keys. This index is used to group message components together - all attributes with the same index belong to the same message. Example: 'llm\.input_messages\.(\d+)\.message\.role' extracts the index from the (\d+) group. Patterns are tested against span attribute keys using JavaScript's native RegExp engine. Remember to escape special characters (e.g., use 'message\.role' not 'message.role').`,
    canonicalInputKey: "The span attribute key containing input messages in OpenTelemetry format. Typically 'llm.input.messages' or 'gen_ai.request.messages'. Must contain an array of message objects.",
    canonicalOutputKey: "The span attribute key containing output/response messages in OpenTelemetry format. Typically 'llm.output.messages' or 'gen_ai.response.messages'. Must contain an array of message objects.",
    flatRolePattern: String.raw`A JavaScript/ECMAScript regex pattern that matches span attribute keys for message roles (user, assistant, system, tool). **IMPORTANT:** Use capture groups to extract the message index. Example: 'llm\.input_messages\.(\d+)\.message\.role' - the (\d+) captures the message index. This index is used to group message components together. Without a capture group, the system will attempt to extract the index from the matched portion, but using an explicit capture group is recommended for reliability. Remember to escape dots and special characters.`,
    flatContentPattern: String.raw`A JavaScript/ECMAScript regex pattern that matches span attribute keys for message content/text. **IMPORTANT:** Use capture groups to extract the message index. Example: 'llm\.input_messages\.(\d+)\.message\.content' - the (\d+) captures the message index. This index must match the index from the role pattern to correctly associate content with its message. Without a capture group, the system will attempt to extract the index from the matched portion, but using an explicit capture group is recommended for reliability. Remember to escape dots and special characters.`,
    flatNamePattern: String.raw`A JavaScript/ECMAScript regex pattern that matches span attribute keys for message names (optional, used for named messages in some LLM APIs). **IMPORTANT:** Use capture groups to extract the message index. Example: 'llm\.input_messages\.(\d+)\.name' - the (\d+) captures the message index. This index must match the index from the role pattern to correctly associate the name with its message. Without a capture group, the system will attempt to extract the index from the matched portion, but using an explicit capture group is recommended for reliability. Remember to escape dots and special characters.`,
    flatToolMessageCallPattern: String.raw`A JavaScript/ECMAScript regex pattern that matches span attribute keys for tool message call IDs. Used to link tool messages with their corresponding tool calls. **IMPORTANT:** Use capture groups to extract the message index. Example: 'llm\.tool_messages\.(\d+)\.tool_call_id' - the (\d+) captures the message index. This index must match the index from the role pattern to correctly associate tool messages with their messages. Without a capture group, the system will attempt to extract the index from the matched portion, but using an explicit capture group is recommended for reliability. Remember to escape dots and special characters.`,
    flatToolCallFunctionNamePattern: String.raw`A JavaScript/ECMAScript regex pattern that matches span attribute keys for tool call function names. **IMPORTANT:** Use capture groups to extract the message index. Example: 'llm\.tool_calls\.(\d+)\.function\.name' - the (\d+) captures the message index. This index must match the index from the role pattern to correctly associate tool calls with their messages. Without a capture group, the system will attempt to extract the index from the matched portion, but using an explicit capture group is recommended for reliability. Remember to escape dots and special characters.`,
    flatToolCallIdPattern: String.raw`A JavaScript/ECMAScript regex pattern that matches span attribute keys for tool call IDs. Used to associate tool calls with their results. **IMPORTANT:** Use capture groups to extract the message index. Example: 'llm\.tool_calls\.(\d+)\.id' - the (\d+) captures the message index. This index must match the index from the role pattern to correctly associate tool call IDs with their messages. Without a capture group, the system will attempt to extract the index from the matched portion, but using an explicit capture group is recommended for reliability. Remember to escape dots and special characters.`,
    flatToolCallFunctionArgumentPattern: String.raw`A JavaScript/ECMAScript regex pattern that matches span attribute keys for tool call function arguments/parameters. **IMPORTANT:** Use capture groups to extract the message index. Example: 'llm\.tool_calls\.(\d+)\.function\.arguments' - the (\d+) captures the message index. This index must match the index from the role pattern to correctly associate tool call arguments with their messages. Without a capture group, the system will attempt to extract the index from the matched portion, but using an explicit capture group is recommended for reliability. Remember to escape dots and special characters.`
  },


  table: {
    typeColumnHeader: "The entity type (Model, Tool, Custom, etc.). Click to sort entities by type.",
    nameColumnHeader: "Entity name. Click to sort alphabetically.",
    descriptionColumnHeader: "Entity description. Click to sort alphabetically.",
    patternColumnHeader: "The matching pattern type (value or JavaScript/ECMAScript regex) used to identify this entity in traces.",
    createdDateColumnHeader: "When this entity was created. Click to sort by creation date.",
    editButton: "Edit this entity's configuration, matching rules, and highlights.",
    deleteButton: "Delete this entity. Note: This will remove entity matching from traces, but won't delete the actual trace data."
  },


  general: {
    stepper: {
      step1: "Define the entity type and basic information",
      step2: "Configure how spans are matched to this entity",
      step3: "Set up which attributes to highlight in trace views",
      step4: "Configure message extraction for conversation display"
    },
    nextButton: "Continue to the next step. Make sure all required fields are filled.",
    previousButton: "Go back to the previous step to make changes.",
    saveButton: "Create the entity. It will immediately start matching spans in your traces based on the configured rules.",
    cancelButton: "Close the dialog without saving. Any changes will be lost."
  },


  advanced: {
    openTelemetryAttributeKeys: "OpenTelemetry uses standardized attribute keys for AI/LLM observability. Common prefixes: 'gen_ai.*' (OpenTelemetry GenAI semantic conventions), 'llm.*' (alternative conventions). Check your instrumentation to find the exact keys used.",
    entityMatchingPriority: "Entities are matched in order. If a span matches multiple entities, the first matching entity wins. Reorder entities or use more specific patterns to control matching priority.",
    regexPatternExamples: (() => {
      const escaped = String.raw`message\.role`;
      return `Common JavaScript/ECMAScript regex patterns: '^gpt-4.*' (starts with gpt-4), '.*turbo.*' (contains turbo), 'gpt-4|claude' (gpt-4 OR claude). For attribute keys with dots, escape them: '${escaped}' not 'message.role'. Test your patterns to ensure they match correctly.`;
    })(),
    highlightsVsMatching: "Matching attributes identify which spans belong to this entity. Highlights determine which attributes are prominently displayed. They can be different - you might match on 'gen_ai.request.model' but highlight 'gen_ai.usage.input_tokens'.",
    messageMatchingImportance: "Message matching is crucial for Model entities. Without it, you won't see conversation threads in trace views. Ensure your LLM instrumentation includes message data in spans."
  },


  errors: {
    duplicateEntityNames: "Entity names should be unique. If you see an error, check if another entity with this name already exists.",
    invalidAttributeKeys: "Attribute keys must match exactly what appears in your traces. Check your OpenTelemetry instrumentation or use the trace viewer to inspect actual attribute keys.",
    regexValidation: (() => {
      const escaped = String.raw`message\.role`;
      return `Invalid JavaScript/ECMAScript regex patterns will prevent entity matching. Test your pattern with sample values before saving. Common issues: unescaped special characters (especially dots in attribute keys like 'message.role' should be '${escaped}'), unmatched brackets, invalid escape sequences.`;
    })(),
    requiredHighlights: "At least one highlight is required. Highlights help users quickly understand what's happening in traces. Add meaningful attributes like model names, token counts, or error codes."
  }
} as const;
export type EntityTooltips = typeof entityTooltips;