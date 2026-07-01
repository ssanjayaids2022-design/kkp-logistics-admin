// Minimal client-side CSV export — builds a CSV from rows and triggers a download.
type Column<T> = { header: string; value: (row: T) => string | number | undefined | null };

function escapeCell(v: string | number | undefined | null): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportToCsv<T>(filename: string, columns: Column<T>[], rows: T[]): void {
  const header = columns.map(c => escapeCell(c.header)).join(',');
  const body = rows.map(r => columns.map(c => escapeCell(c.value(r))).join(',')).join('\n');
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
