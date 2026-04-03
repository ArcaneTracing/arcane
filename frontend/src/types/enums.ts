
export enum DatasourceType {
  TRACES = 'traces',
}

export enum DatasourceSource {
  TEMPO = 'tempo',
  JAEGER = 'jaeger',
  CLICKHOUSE = 'clickhouse',
  CUSTOM_API = 'custom_api',
}

export enum MatchPatternType {
  VALUE = 'value',
  REGEX = 'regex',
}

export enum EntityType {
  MODEL = 'model',
  TOOL = 'tool',
  EMBEDDING = 'embedding',
  RETRIEVER = 'retriever',
  GUARDRAIL = 'guardrail',
  EVALUATOR = 'evaluator',
  AGENT = 'agent',
  CUSTOM = 'custom',
}

export enum MessageType {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool',
}

export enum HighlightValueType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
}

export enum MessageMatchingType {
  CANONICAL = 'canonical',
  FLAT = 'flat',
}

export enum ScoringType {
  NUMERIC = 'NUMERIC',
  ORDINAL = 'ORDINAL',
  NOMINAL = 'NOMINAL',
  RAGAS = 'RAGAS',
}

export enum EvaluationType {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
}

export enum EvaluationScope {
  DATASET = 'DATASET',
  EXPERIMENT = 'EXPERIMENT',
}

export enum ScoreResultStatus {
  PENDING = 'PENDING',
  DONE = 'DONE',
}

export enum ExperimentResultStatus {
  PENDING = 'PENDING',
  DONE = 'DONE',
}

export enum ModelProvider {
  OPENAI = 'OPENAI',
  AZURE_OPENAI = 'AZURE_OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  GOOGLE = 'GOOGLE',
  DEEPSEEK = 'DEEPSEEK',
  XAI = 'XAI',
  OLLAMA = 'OLLAMA',
  AWS = 'AWS',
}

export enum TemplateType {
  CHAT = 'CHAT',
  STR = 'STR',
}

export enum TemplateFormat {
  MUSTACHE = 'MUSTACHE',
  F_STRING = 'F_STRING',
  NONE = 'NONE',
}

export enum AnnotationQueueType {
  TRACES = 'TRACES',
  CONVERSATIONS = 'CONVERSATIONS',
}

export enum AnnotationQuestionType {
  FREEFORM = 'freeform',
  BOOLEAN = 'boolean',
  MULTIPLE_CHOICE = 'multiple_choice',
  NUMERIC = 'numeric',
  SINGLE_CHOICE = 'single_choice',
}

export enum Lookback {
  MINUTE = '1m',
  FIVE_MINUTES = '5m',
  TEN_MINUTES = '10m',
  THIRTY_MINUTES = '30m',
  HOUR = '1h',
  THREE_HOURS = '3h',
  SIX_HOURS = '6h',
  TWELVE_HOURS = '12h',
  DAY = '24h',
  WEEK = '1w',
  MONTH = '30d',
  YEAR = '365d',
}