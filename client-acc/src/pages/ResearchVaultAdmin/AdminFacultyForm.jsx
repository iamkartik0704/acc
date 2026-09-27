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
    googleScholarLink: faculty?.googleScholarLink || '',
    linkedinLink: faculty?.linkedinLink || '',
    biography: faculty?.biography || '',
    profileInfo: faculty?.profileInfo || '',
    publications: faculty?.publications || '',
    openings: faculty?.openings || 0,
    closingDate: faculty?.closingDate ? new Date(faculty.closingDate).toISOString().split('T')[0] : '',
    requirement: faculty?.requirement || '',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-full">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shrink-0 rounded-t-2xl">
          <h2 className="text-base font-bold text-slate-900">{isEdit ? 'Edit Faculty Profile' : 'Add Faculty Profile'}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-6">
          <form id="faculty-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            {field('name', 'Full Name *', 'text', { required: true })}
            {field('slug', 'URL Slug *', 'text', { required: true })}
          {field('designation', 'Designation')}
          {field('department', 'Department')}
          {field('email', 'Email', 'email')}
          {field('phone', 'Phone')}
          {field('website', 'Website URL', 'url')}
          {field('googleScholarLink', 'Google Scholar URL', 'url')}
          {field('linkedinLink', 'LinkedIn URL', 'url')}
          {field('openings', 'Current Openings', 'number', { min: 0 })}
          {field('closingDate', 'Closing Date', 'date')}

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Biography (Short)</label>
            <textarea
              rows={2}
              value={form.biography}
              onChange={e => setForm(f => ({ ...f, biography: e.target.value }))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Profile Info (Detailed)</label>
            <textarea
              rows={3}
              value={form.profileInfo}
              onChange={e => setForm(f => ({ ...f, profileInfo: e.target.value }))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Requirements / Eligibility</label>
            <textarea
              rows={2}
              value={form.requirement}
              onChange={e => setForm(f => ({ ...f, requirement: e.target.value }))}
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
            <div className="flex flex-wrap gap-2 mt-1">
              {(!areas || areas.length === 0) && (
                <span className="text-sm text-slate-500 italic py-1">No research areas available.</span>
              )}
              {(areas || []).map(area => {
                const selected = form.researchAreaIds.includes(area.id);
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => toggle(area.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                      selected
                        ? 'bg-blue-700 text-white border-blue-800 shadow-sm'
                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                    }`}
                  >
                    {area.name}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0 rounded-b-2xl">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">
            Cancel
          </button>
          <button type="submit" form="faculty-form" disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 transition-colors">
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
