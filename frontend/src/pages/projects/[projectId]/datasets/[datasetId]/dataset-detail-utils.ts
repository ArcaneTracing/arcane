export type NewRow = {id: string;values: string[];};

export function updateRowValueAtColumn(
row: NewRow,
rowId: string,
columnIndex: number,
value: string)
: NewRow {
  if (row.id !== rowId) return row;
  return {
    ...row,
    values: row.values.map((v, i) => i === columnIndex ? value : v)
  };
}