
export function calculateDatesFromLookback(lookbackValue: string): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();
  let startDate = new Date(now);

  const match = /^(\d+)([mhdw])$/.exec(lookbackValue);
  if (!match) {
    return { startDate: now, endDate: now };
  }

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'm':
      startDate.setMinutes(now.getMinutes() - amount);
      break;
    case 'h':
      startDate.setHours(now.getHours() - amount);
      break;
    case 'd':
      startDate.setDate(now.getDate() - amount);
      break;
    case 'w':
      startDate.setDate(now.getDate() - amount * 7);
      break;
    default:
      break;
  }

  return { startDate, endDate: now };
}