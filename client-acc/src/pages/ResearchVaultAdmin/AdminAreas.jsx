import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/researchVaultAdminApi';
import ConfirmDialog from './components/ConfirmDialog';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAreas({ onAreasChanged }) {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listAreas();
      setAreas(res.data?.data || []);
    } catch {
      toast.error('Could not load research areas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-generate slug
  const handleNameChange = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setForm(f => ({ ...f, name, slug: f.slug === autoSlug(f.name) ? slug : f.slug }));
  };
  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const slug = form.slug.trim() || autoSlug(form.name);
      await adminApi.createArea({ name: form.name.trim(), slug, description: form.description.trim() || undefined });
      toast.success('Research area added.');
      setForm({ name: '', slug: '', description: '' });
      await load();
      onAreasChanged?.();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not add research area.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-5">
      <h2 className="text-lg font-bold text-slate-900">Research Area Taxonomy</h2>

      {/* Add form */}
      <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Add new area</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Name *</label>
            <input
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="e.g. Machine Learning"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Slug (auto-generated)</label>
            <input
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="machine-learning"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500 block mb-1">Description (optional)</label>
            <input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of this research area"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>
        </div>
        <button type="submit" disabled={saving} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 transition-colors">
          <Plus size={15} /> {saving ? 'Adding…' : 'Add area'}
        </button>
      </form>

      {/* List */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-400">Loading…</p>
        ) : areas.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No research areas yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {areas.map(area => (
                <tr key={area.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">{area.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{area.slug}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{area.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
