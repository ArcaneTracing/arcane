type SyncDatesParams = {
  searchStart: string | undefined
  searchEnd: string | undefined
  currentStartDate: Date | undefined
  currentEndDate: Date | undefined
  setStartDate: (date: Date) => void
  setEndDate: (date: Date) => void
}

export function syncDatesFromUrl({
  searchStart,
  searchEnd,
  currentStartDate,
  currentEndDate,
  setStartDate,
  setEndDate,
}: SyncDatesParams): void {
  if (searchStart && searchStart !== currentStartDate?.toISOString()) {
    setStartDate(new Date(searchStart))
  }
  if (searchEnd && searchEnd !== currentEndDate?.toISOString()) {
    setEndDate(new Date(searchEnd))
  }
}

type SyncStringParamParams = {
  searchValue: string | undefined
  currentValue: string
  setValue: (value: string) => void
}

export function syncStringParamFromUrl({
  searchValue,
  currentValue,
  setValue,
}: SyncStringParamParams): boolean {
  if (searchValue && searchValue !== currentValue) {
    setValue(searchValue)
    return true
  }
  return false
}

type SyncLookbackParams = {
  searchLookback: string | undefined
  currentLookback: string
  setLookback: (value: string) => void
  setIsUpdatingFromUrl: (value: boolean) => void
}

export function syncLookbackFromUrl({
  searchLookback,
  currentLookback,
  setLookback,
  setIsUpdatingFromUrl,
}: SyncLookbackParams): void {
  if (searchLookback && searchLookback !== currentLookback) {
    setIsUpdatingFromUrl(true)
    setLookback(searchLookback)
    requestAnimationFrame(() => {
      setIsUpdatingFromUrl(false)
    })
  }
}
