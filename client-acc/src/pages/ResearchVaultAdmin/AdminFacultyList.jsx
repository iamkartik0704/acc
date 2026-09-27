import { useEffect, useState } from 'react';
import { adminApi } from '../../api/researchVaultAdminApi';
import AdminTable from './components/AdminTable';
import ConfirmDialog from './components/ConfirmDialog';
import AdminFacultyForm from './AdminFacultyForm';
import CsvImportModal from './CsvImportModal';
import { Plus, Upload, Archive } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminFacultyList({ areas }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // faculty record being edited
  const [csvOpen, setCsvOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // { id, name }

  const LIMIT = 20;

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await adminApi.listFaculty({ page: p, limit: LIMIT });
      const d = res.data;
      setRows(d.data || []);
      setTotal(d.total || 0);
    } catch {
      toast.error('Could not load faculty.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const handleArchive = async () => {
    try {
      await adminApi.archiveFaculty(confirm.id);
      toast.success(`${confirm.name} archived.`);
      setConfirm(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not archive faculty.');
      setConfirm(null);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: r => <span className="font-semibold text-slate-900">{r.name}</span> },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'areas', label: 'Research Areas', render: r => (
      <div className="flex flex-wrap gap-1">
        {(r.researchAreas || []).slice(0, 3).map(ra => (
          <span key={ra.researchArea.id} className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
            {ra.researchArea.name}
          </span>
        ))}
        {r.researchAreas?.length > 3 && <span className="text-xs text-slate-400">+{r.researchAreas.length - 3}</span>}
      </div>
    )},
    { key: 'views', label: 'Views', render: r => <span className="text-slate-500">{r.profileViewCount}</span> },
    { key: 'actions', label: '', render: r => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setEditing(r); setFormOpen(true); }}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => setConfirm({ id: r.id, name: r.name })}
          title="Archive faculty"
          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
        >
          <Archive size={14} />
        </button>
      </div>
    )},
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Faculty Directory</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCsvOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Upload size={15} /> Bulk import CSV
          </button>
          <button
            onClick={() => { setEditing(null); setFormOpen(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors"
          >
            <Plus size={15} /> Add faculty
          </button>
        </div>
      </div>

      <AdminTable
        columns={columns}
        rows={rows}
        page={page}
        total={total}
        limit={LIMIT}
        onPage={p => { setPage(p); load(p); }}
        loading={loading}
        emptyMessage="No faculty profiles yet."
      />

      {formOpen && (
        <AdminFacultyForm
          faculty={editing}
          areas={areas}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSaved={() => { setFormOpen(false); setEditing(null); load(); }}
        />
      )}

      {csvOpen && (
        <CsvImportModal
          areas={areas}
          onClose={() => setCsvOpen(false)}
          onImported={() => { setCsvOpen(false); load(); }}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Archive faculty profile?"
        message={`"${confirm?.name}" will be hidden from students. This can be undone by editing the record.`}
        confirmLabel="Archive"
        onConfirm={handleArchive}
        onCancel={() => setConfirm(null)}
      />
    </section>
  );
}
