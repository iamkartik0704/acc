import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { adminApi } from '../../api/researchVaultAdminApi';
import toast from 'react-hot-toast';

export default function AdminFacultyForm({ faculty, areas, onClose, onSaved }) {
  const isEdit = !!faculty;
  const [form, setForm] = useState({
    name: faculty?.name || '',
    slug: faculty?.slug || '',
    designation: faculty?.designation || '',
    department: faculty?.department || '',
    email: faculty?.email || '',
    phone: faculty?.phone || '',
    website: faculty?.website || '',
    biography: faculty?.biography || '',
    publications: faculty?.publications || '',
    researchAreaIds: faculty?.researchAreas?.map(ra => ra.researchArea.id) || [],
  });
  const [saving, setSaving] = useState(false);

  // Auto-generate slug from name when creating
  useEffect(() => {
    if (!isEdit && form.name && !form.slug) {
      setForm(f => ({ ...f, slug: f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
    }
  }, [form.name]);

  const toggle = (id) => setForm(f => ({
    ...f,
    researchAreaIds: f.researchAreaIds.includes(id)
      ? f.researchAreaIds.filter(x => x !== id)
      : [...f.researchAreaIds, id]
  }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return toast.error('Name and slug are required.');
    setSaving(true);
    try {
      if (isEdit) {
        await adminApi.updateFaculty(faculty.id, form);
        toast.success('Faculty profile updated.');
      } else {
        await adminApi.createFaculty(form);
        toast.success('Faculty profile created.');
      }
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not save faculty profile.');
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, type = 'text', extra = {}) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
        {...extra}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">{isEdit ? 'Edit Faculty Profile' : 'Add Faculty Profile'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="grid gap-4 p-6 sm:grid-cols-2">
          {field('name', 'Full Name *', 'text', { required: true })}
          {field('slug', 'URL Slug *', 'text', { required: true })}
          {field('designation', 'Designation')}
          {field('department', 'Department')}
          {field('email', 'Email', 'email')}
          {field('phone', 'Phone')}
          {field('website', 'Website URL', 'url')}

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Biography</label>
            <textarea
              rows={3}
              value={form.biography}
              onChange={e => setForm(f => ({ ...f, biography: e.target.value }))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Publications</label>
            <textarea
              rows={3}
              value={form.publications}
              onChange={e => setForm(f => ({ ...f, publications: e.target.value }))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Research Areas</label>
            <div className="flex flex-wrap gap-2">
              {(areas || []).map(area => {
                const selected = form.researchAreaIds.includes(area.id);
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => toggle(area.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                      selected
                        ? 'border-emerald-600 bg-emerald-700 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-400'
                    }`}
                  >
                    {area.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 sm:col-span-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-xl bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 transition-colors">
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
