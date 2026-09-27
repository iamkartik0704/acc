import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/researchVaultAdminApi';
import AdminTable from './components/AdminTable';
import ConfirmDialog from './components/ConfirmDialog';
import { Plus, Pencil, Trash2, Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const RESOURCE_TYPES = ['GUIDE', 'SOP_WRITING', 'COLD_EMAILING', 'PHD_APPLICATIONS', 'GRANT_WRITING', 'OTHER'];

function ResourceForm({ resource, areas, onClose, onSaved }) {
  const isEdit = !!resource;
  const [form, setForm] = useState({
    title: resource?.title || '',
    resourceType: resource?.resourceType || 'GUIDE',
    url: resource?.url || '',
    filePath: resource?.filePath || '',
    description: resource?.description || '',
    researchAreaIds: resource?.researchAreas?.map(ra => ra.researchArea.id) || [],
  });
  const [saving, setSaving] = useState(false);

  const toggle = (id) => setForm(f => ({
    ...f,
    researchAreaIds: f.researchAreaIds.includes(id) ? f.researchAreaIds.filter(x => x !== id) : [...f.researchAreaIds, id]
  }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required.');
    setSaving(true);
    try {
      if (isEdit) await adminApi.updateResource(resource.id, form);
      else await adminApi.createResource(form);
      toast.success(isEdit ? 'Resource updated.' : 'Resource created.');
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not save resource.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">{isEdit ? 'Edit Resource' : 'Add Resource'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"><Plus size={16} className="rotate-45" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div><label className="label-xs">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required className="input-sm" /></div>
          <div><label className="label-xs">Type</label>
            <select value={form.resourceType} onChange={e => setForm(f => ({...f, resourceType: e.target.value}))} className="input-sm">
              {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select></div>
          <div><label className="label-xs">External URL</label>
            <input type="url" value={form.url} onChange={e => setForm(f => ({...f, url: e.target.value}))} className="input-sm" /></div>
          <div><label className="label-xs">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="input-sm resize-none" /></div>
          <div>
            <label className="label-xs">Research Areas</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {(areas || []).map(a => {
                const sel = form.researchAreaIds.includes(a.id);
                return <button key={a.id} type="button" onClick={() => toggle(a.id)} className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${sel ? 'border-emerald-600 bg-emerald-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-400'}`}>{a.name}</button>;
              })}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminResources({ areas }) {
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
      const res = await adminApi.listResources({ page: p, limit: LIMIT });
      setRows(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch { toast.error('Could not load resources.'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [page]);

  const handleDelete = async () => {
    try {
      await adminApi.deleteResource(confirm.id);
      toast.success('Resource removed.');
      setConfirm(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not remove resource.');
      setConfirm(null);
    }
  };

  const columns = [
    { key: 'title', label: 'Title', render: r => <span className="font-semibold text-slate-900">{r.title}</span> },
    { key: 'resourceType', label: 'Type', render: r => <span className="text-xs text-slate-500">{r.resourceType?.replace(/_/g,' ')}</span> },
    { key: 'views', label: 'Views', render: r => (
      <span className="flex items-center gap-1 text-slate-500"><Eye size={12}/> {r.viewCount}</span>
    )},
    { key: 'downloads', label: 'Downloads', render: r => (
      <span className="flex items-center gap-1 text-slate-500"><Download size={12}/> {r.downloadCount}</span>
    )},
    { key: 'actions', label: '', render: r => (
      <div className="flex gap-2">
        <button onClick={() => { setEditing(r); setFormOpen(true); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
          <Pencil size={13} />
        </button>
        <button onClick={() => setConfirm({ id: r.id, title: r.title })} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    )},
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Curated Resources</h2>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors">
          <Plus size={15} /> Add resource
        </button>
      </div>
      <AdminTable columns={columns} rows={rows} page={page} total={total} limit={LIMIT} onPage={p => { setPage(p); load(p); }} loading={loading} emptyMessage="No resources yet." />
      {formOpen && <ResourceForm resource={editing} areas={areas} onClose={() => { setFormOpen(false); setEditing(null); }} onSaved={() => { setFormOpen(false); setEditing(null); load(); }} />}
      <ConfirmDialog open={!!confirm} title="Remove resource?" message={`"${confirm?.title}" will be permanently removed.`} confirmLabel="Remove" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
    </section>
  );
}
