import { Lookback } from '@/types/enums';

export const lookbackLabels: Record<Lookback, string> = {
  [Lookback.MINUTE]: 'Last Minute',
  [Lookback.FIVE_MINUTES]: 'Last 5 Minutes',
  [Lookback.TEN_MINUTES]: 'Last 10 Minutes',
  [Lookback.THIRTY_MINUTES]: 'Last 30 Minutes',
  [Lookback.HOUR]: 'Last Hour',
  [Lookback.THREE_HOURS]: 'Last 3 Hours',
  [Lookback.SIX_HOURS]: 'Last 6 Hours',
  [Lookback.TWELVE_HOURS]: 'Last 12 Hours',
  [Lookback.DAY]: 'Last 24 Hours',
  [Lookback.WEEK]: 'Last Week',
  [Lookback.MONTH]: 'Last Month',
  [Lookback.YEAR]: 'Last Year',
};

export const lookbackOptions = Object.values(Lookback).map(value => ({
  label: lookbackLabels[value],
  value,
}));
