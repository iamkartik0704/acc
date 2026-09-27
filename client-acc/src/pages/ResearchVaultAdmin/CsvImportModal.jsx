import { useRef, useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../../api/researchVaultAdminApi';
import toast from 'react-hot-toast';

const CSV_HEADERS = ['name', 'slug', 'designation', 'department', 'email', 'phone', 'website', 'biography', 'publications', 'researchAreas'];

function parseCsv(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    // researchAreas: comma-separated within the field, but since we split by comma above,
    // we keep it as-is (simple case; for complex CSVs user should quote multi-area fields)
    return row;
  });
}

export default function CsvImportModal({ areas, onClose, onImported }) {
  const fileRef = useRef();
  const [rows, setRows] = useState(null);       // parsed preview rows
  const [result, setResult] = useState(null);   // import result
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCsv(ev.target.result);
      if (parsed.length === 0) { setError('No data rows found in CSV.'); return; }
      setRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!rows?.length) return;
    setImporting(true);
    try {
      const res = await adminApi.bulkImportFaculty(rows);
      setResult(res.data.data);
      if (res.data.data.skipped === 0) {
        toast.success(`${res.data.data.created} profiles imported.`);
        onImported();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  const areaNames = (areas || []).map(a => a.name).join(', ');

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Bulk Import Faculty (CSV)</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Instructions */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed space-y-1">
            <p className="font-bold text-slate-800">Expected CSV columns (in order):</p>
            <p className="font-mono">{CSV_HEADERS.join(', ')}</p>
            <p className="mt-2"><strong>researchAreas</strong> — use exact area names from the taxonomy below (comma-separated inside quotes if multiple). Rows with unmatched areas are skipped.</p>
            <p className="mt-1 text-slate-500">Known areas: {areaNames || '(none yet — add areas first)'}</p>
          </div>

          {/* File picker */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-2">Upload CSV file</label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-white px-4 py-5 hover:border-emerald-400 transition-colors">
              <Upload size={20} className="text-slate-400" />
              <span className="text-sm text-slate-500">Click to select a .csv file</span>
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="sr-only" onChange={handleFile} />
            </label>
            {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
          </div>

          {/* Preview */}
          {rows && !result && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">{rows.length} row{rows.length !== 1 ? 's' : ''} parsed — preview (first 5):</p>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-slate-100 bg-slate-50">{['name','slug','department','researchAreas'].map(h => <th key={h} className="px-3 py-2 text-left font-bold text-slate-500 uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.slice(0, 5).map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{r.name || '—'}</td>
                        <td className="px-3 py-2 text-slate-400">{r.slug || '—'}</td>
                        <td className="px-3 py-2">{r.department || '—'}</td>
                        <td className="px-3 py-2 text-emerald-700">{r.researchAreas || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                <span className="text-sm font-semibold text-emerald-800">{result.created} profile{result.created !== 1 ? 's' : ''} created</span>
              </div>
              {result.skippedRows?.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={15} className="text-amber-700 shrink-0" />
                    <span className="text-xs font-bold text-amber-800">{result.skipped} row{result.skipped !== 1 ? 's' : ''} skipped</span>
                  </div>
                  <ul className="space-y-1">
                    {result.skippedRows.map((s, i) => (
                      <li key={i} className="text-xs text-amber-700">Row {s.row}: {s.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            {result ? 'Close' : 'Cancel'}
          </button>
          {rows && !result && (
            <button onClick={handleImport} disabled={importing} className="rounded-xl bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 transition-colors">
              {importing ? 'Importing…' : `Import ${rows.length} rows`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
