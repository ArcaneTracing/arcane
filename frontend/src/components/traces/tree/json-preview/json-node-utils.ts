export type JsonDataType = 'null' | 'array' | 'object' | 'string' | 'number' | 'boolean' | 'undefined'

export function getJsonDataType(data: unknown): JsonDataType {
  if (data === null) return 'null'
  if (Array.isArray(data)) return 'array'
  if (data instanceof Date) return 'object'
  return typeof data as JsonDataType
}

export function isJsonExpandable(data: unknown, dataType: JsonDataType): boolean {
  return (
    data !== null &&
    data !== undefined &&
    !(data instanceof Date) &&
    (dataType === 'object' || dataType === 'array')
  )
}

export function getItemCount(data: unknown): number {
  if (data === null || data === undefined) return 0
  return Object.keys(data).length
}

export function getBracketChar(dataType: JsonDataType, isOpen: boolean): string {
  if (dataType === 'array') {
    return isOpen ? '[' : ']'
  }
  return isOpen ? '{' : '}'
}

export function formatItemCount(itemCount: number, dataType: JsonDataType): string {
  const itemText = itemCount === 1 ? 'item' : 'items'
  const closeBracket = getBracketChar(dataType, false)
  return ` ${itemCount} ${itemText} ${closeBracket}`
}
