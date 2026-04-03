import type { ConversationConfigurationResponse } from '@/types/conversation-configuration';

function matchesSearchQuery(
item: ConversationConfigurationResponse,
query: string)
: boolean {
  const searchLower = query.toLowerCase();
  return (
    item.name?.toLowerCase().includes(searchLower) ||
    item.description?.toLowerCase().includes(searchLower) ||
    item.stitchingAttributesName?.some((attr) => attr.toLowerCase().includes(searchLower)));

}

function parseDateAsLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isWithinDateRange(
configDate: Date,
startDate?: string,
endDate?: string)
: boolean {
  const configDateOnly = new Date(
    configDate.getFullYear(),
    configDate.getMonth(),
    configDate.getDate()
  );

  if (startDate && endDate) {
    const start = parseDateAsLocal(startDate);
    const end = parseDateAsLocal(endDate);
    return configDateOnly >= start && configDateOnly <= end;
  }
  if (startDate) return configDateOnly >= parseDateAsLocal(startDate);
  if (endDate) return configDateOnly <= parseDateAsLocal(endDate);
  return true;
}
export function filterConversationConfigurations(
item: ConversationConfigurationResponse,
query: string,
startDate?: string,
endDate?: string)
: boolean {
  if (query && !matchesSearchQuery(item, query)) return false;
  if ((startDate || endDate) && !isWithinDateRange(new Date(item.createdAt), startDate, endDate)) return false;
  return true;
}