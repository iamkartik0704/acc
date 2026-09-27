import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * AdminTable — generic paginated table.
 * Props:
 *   columns  [{ key, label, render? }]
 *   rows     array of objects
 *   page     number (1-indexed)
 *   total    number
 *   limit    number
 *   onPage   (page: number) => void
 *   loading  boolean
 *   emptyMessage string
 */
export default function AdminTable({ columns, rows, page, total, limit, onPage, loading, emptyMessage = 'No records found.' }) {
  const totalPages = Math.ceil((total || 0) / (limit || 20));

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-left">
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr><td colSpan={columns.length} className="py-10 text-center text-sm text-slate-400">Loading…</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="py-10 text-center text-sm text-slate-400">{emptyMessage}</td></tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id ?? i} className="hover:bg-slate-50 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-slate-700">
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-xs text-slate-500">
            Page {page} of {totalPages} · {total} total
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPage(page - 1)}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPage(page + 1)}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
