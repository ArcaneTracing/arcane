import { PromptVersionResponse, TemplateFormat } from '@/types';

export function extractMessageContent(content: unknown): string {
  if (content === undefined || content === null) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.
    map((part) => part && typeof part === 'object' && 'text' in part ? (part as {text: string;}).text : '').
    join('');
  }
  return '';
}

export function extractVariablesFromPromptVersion(version: PromptVersionResponse | null): string[] {
  if (!version || version.templateFormat === 'NONE') {
    return [];
  }

  const messages = version.template?.messages || [];
  const allContent = messages.map((msg: any) => msg.content || '').join('\n');
  const variables = new Set<string>();

  if (version.templateFormat === 'MUSTACHE') {

    const mustacheRegex = /\{\{\s*([a-zA-Z_]\w*)\s*\}\}/g;
    let match;
    while ((match = mustacheRegex.exec(allContent)) !== null) {
      variables.add(match[1]);
    }
  } else if (version.templateFormat === 'F_STRING') {


    const fStringRegex = /\{([a-zA-Z_]\w*)\}/g;
    let match;
    while ((match = fStringRegex.exec(allContent)) !== null) {
      variables.add(match[1]);
    }
  }

  return Array.from(variables).sort((a, b) => a.localeCompare(b));
}

export function extractVariablesFromMessages(
messages: Array<{content: string;}>,
templateFormat: TemplateFormat)
: string[] {
  if (templateFormat === 'NONE') {
    return [];
  }

  const allContent = messages.map((msg) => msg.content || '').join('\n');
  const variables = new Set<string>();

  if (templateFormat === 'MUSTACHE') {

    const mustacheRegex = /\{\{\s*([a-zA-Z_]\w*)\s*\}\}/g;
    let match;
    while ((match = mustacheRegex.exec(allContent)) !== null) {
      variables.add(match[1]);
    }
  } else if (templateFormat === 'F_STRING') {


    const fStringRegex = /\{([a-zA-Z_]\w*)\}/g;
    let match;
    while ((match = fStringRegex.exec(allContent)) !== null) {
      variables.add(match[1]);
    }
  }

  return Array.from(variables).sort((a, b) => a.localeCompare(b));
}