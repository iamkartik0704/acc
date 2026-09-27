import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/researchVaultAdminApi';
import AdminTable from './components/AdminTable';
import ConfirmDialog from './components/ConfirmDialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const POSITION_TYPES = ['RA', 'SUMMER', 'THESIS', 'OTHER'];

function PositionForm({ position, faculty, onClose, onSaved }) {
  const isEdit = !!position;
  const [form, setForm] = useState({
    title: position?.title || '',
    positionType: position?.positionType || 'RA',
    facultyId: position?.facultyId ? String(position.facultyId) : '',
    deadline: position?.deadline ? new Date(position.deadline).toISOString().split('T')[0] : '',
    applicationUrl: position?.applicationUrl || '',
    eligibility: position?.eligibility || '',
    description: position?.description || '',
    isActive: position?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required.');
    setSaving(true);
    const payload = {
      ...form,
      facultyId: form.facultyId ? Number(form.facultyId) : null,
      deadline: form.deadline || null,
    };
    try {
      if (isEdit) await adminApi.updatePosition(position.id, payload);
      else await adminApi.createPosition(payload);
      toast.success(isEdit ? 'Position updated.' : 'Position created.');
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not save position.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">{isEdit ? 'Edit Position' : 'Add Open Position'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"><Plus size={16} className="rotate-45" /></button>
        </div>
        <form onSubmit={submit} className="p-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Position Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Type</label>
            <select value={form.positionType} onChange={e => setForm(f => ({...f, positionType: e.target.value}))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all">
              {POSITION_TYPES.map(t => <option key={t} value={t}>{t === 'RA' ? 'Research Assistantship' : t.charAt(0) + t.slice(1).toLowerCase().replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Linked Faculty (optional)</label>
            <select value={form.facultyId} onChange={e => setForm(f => ({...f, facultyId: e.target.value}))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all">
              <option value="">No linked faculty</option>
              {(faculty || []).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Application Deadline</label>
            <input type="date" value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Application URL</label>
            <input type="url" value={form.applicationUrl} onChange={e => setForm(f => ({...f, applicationUrl: e.target.value}))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Description & Eligibility</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 resize-none transition-all" />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({...f, isActive: e.target.checked}))}
              className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500" />
            <label htmlFor="isActive" className="text-sm text-slate-700 font-semibold">Active (visible to students)</label>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPositions({ faculty }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const LIMIT = 20;

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const res = await adminApi.listPositions({ page: p, limit: LIMIT });
      setRows(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch { toast.error('Could not load positions.'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [page]);

  const handleDelete = async () => {
    try {
      await adminApi.deletePosition(confirm.id);
      toast.success('Position removed.');
      setConfirm(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not remove position.');
      setConfirm(null);
    }
  };

  const columns = [
    { key: 'title', label: 'Title', render: r => <span className="font-semibold text-slate-900">{r.title}</span> },
    { key: 'type', label: 'Type', render: r => <span className="text-xs text-slate-500">{r.positionType}</span> },
    { key: 'faculty', label: 'Faculty', render: r => r.faculty?.name || <span className="text-slate-400">—</span> },
    { key: 'deadline', label: 'Deadline', render: r => r.deadline ? new Date(r.deadline).toLocaleDateString() : <span className="text-slate-400">—</span> },
    { key: 'status', label: 'Status', render: r => (
      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${r.isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
        {r.isActive ? 'Active' : 'Closed'}
      </span>
    )},
    { key: 'actions', label: '', render: r => (
      <div className="flex gap-2">
        <button onClick={() => { setEditing(r); setFormOpen(true); }} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 transition-colors"><Pencil size={13}/></button>
        <button onClick={() => setConfirm({ id: r.id, title: r.title })} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"><Trash2 size={13}/></button>
      </div>
    )},
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Open Positions</h2>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors">
          <Plus size={15} /> Add position
        </button>
      </div>
      <AdminTable columns={columns} rows={rows} page={page} total={total} limit={LIMIT} onPage={p => { setPage(p); load(p); }} loading={loading} emptyMessage="No positions yet." />
      {formOpen && <PositionForm position={editing} faculty={faculty} onClose={() => { setFormOpen(false); setEditing(null); }} onSaved={() => { setFormOpen(false); setEditing(null); load(); }} />}
      <ConfirmDialog open={!!confirm} title="Remove position?" message={`"${confirm?.title}" will be permanently removed.`} confirmLabel="Remove" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
    </section>
  );
}
