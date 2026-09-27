import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/researchVaultAdminApi';
import AdminTable from './components/AdminTable';
import ConfirmDialog from './components/ConfirmDialog';
import { Plus, Pencil, Trash2, Eye, Download, X, Globe, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const RESOURCE_TYPES = ['GUIDE', 'SOP_WRITING', 'COLD_EMAILING', 'PHD_APPLICATIONS', 'GRANT_WRITING', 'LOR', 'OTHER'];

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

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

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

  const inputClasses = "w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all";
  const labelClasses = "mb-1 block text-xs font-semibold text-slate-700 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-full">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shrink-0 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit Resource' : 'Add Resource'}</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6">
          <form id="resource-form" onSubmit={submit} className="space-y-5">
            <div>
              <label className={labelClasses}>Title <span className="text-rose-500">*</span></label>
              <input 
                value={form.title} 
                onChange={e => setForm(f => ({...f, title: e.target.value}))} 
                required 
                placeholder="Enter resource title..."
                className={inputClasses} 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>Type</label>
                <div className="relative">
                  <select 
                    value={form.resourceType} 
                    onChange={e => setForm(f => ({...f, resourceType: e.target.value}))} 
                    className={`${inputClasses} appearance-none pr-8 cursor-pointer`}
                  >
                    {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClasses}>External URL</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Globe size={14} />
                  </div>
                  <input 
                    type="url" 
                    value={form.url} 
                    onChange={e => setForm(f => ({...f, url: e.target.value}))} 
                    placeholder="https://example.com"
                    className={`${inputClasses} pl-9`} 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClasses}>Description</label>
              <textarea 
                rows={3} 
                value={form.description} 
                onChange={e => setForm(f => ({...f, description: e.target.value}))} 
                placeholder="Briefly describe this resource..."
                className={`${inputClasses} resize-none`} 
              />
            </div>

            <div>
              <label className={labelClasses}>Research Areas</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(!areas || areas.length === 0) && (
                  <span className="text-sm text-slate-500 italic py-1">No research areas available.</span>
                )}
                {(areas || []).map(a => {
                  const sel = form.researchAreaIds.includes(a.id);
                  return (
                    <button 
                      key={a.id} 
                      type="button" 
                      onClick={() => toggle(a.id)} 
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                        sel 
                        ? 'bg-blue-700 text-white border-blue-800 shadow-sm' 
                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                      }`}
                    >
                      {a.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={saving}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="resource-form"
            disabled={saving} 
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70 transition-all"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : isEdit ? 'Save changes' : 'Create resource'}
          </button>
        </div>
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
