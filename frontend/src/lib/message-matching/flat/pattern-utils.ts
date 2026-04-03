export function matchesPattern(key: string, pattern: string | undefined): boolean {
  if (!pattern || !key) return false
  try {
    const regex = new RegExp(pattern)
    return regex.test(key)
  } catch (error) {
    console.error('Error matching pattern', error)
    return false
  }
}

export function matchesPatternWithResult(key: string, pattern: string | undefined): { matched: boolean; match: RegExpExecArray | null } {
  if (!pattern || !key) return { matched: false, match: null }
  try {
    const regex = new RegExp(pattern)
    const match = regex.exec(key)
    return { matched: !!match, match }
  } catch (error) {
    console.error('Error matching pattern with result', error)
    return { matched: false, match: null }
  }
}

export function extractIndexFromMatch(key: string, pattern: string): string | null {
  try {
    const regex = new RegExp(pattern)
    const match = regex.exec(key)
    if (!match) {
      return null
    }

    if (match[1] !== undefined) {
      return match[1]
    }

    const numberMatch = /\.(\d+)\./.exec(match[0])
    if (numberMatch?.[1]) {
      return numberMatch[1]
    }

    const fallbackMatch = /\.(\d+)\./.exec(key)
    if (fallbackMatch?.[1]) {
      return fallbackMatch[1]
    }

    return null
  } catch (error) {
    console.error('Error extracting index from match', error)
    return null
  }
}
