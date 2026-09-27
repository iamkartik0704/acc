import { Users, BookOpen, Clock, MessageSquare, AlertCircle, Eye, Tag } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
function StatCard({ label, value, icon: Icon, color = 'emerald' }) {
  const colors = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber:   'border-amber-200   bg-amber-50   text-amber-700',
    blue:    'border-blue-200    bg-blue-50    text-blue-700',
    rose:    'border-rose-200    bg-rose-50    text-rose-700',
    slate:   'border-slate-200   bg-slate-50   text-slate-700',
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <div className={`rounded-lg border p-2 ${colors[color]}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value ?? 0}</p>
    </div>
  );
}

export default function AdminAnalytics({ analytics }) {
  if (!analytics) return <p className="py-10 text-center text-sm text-slate-400">No analytics data available.</p>;

  return (
    <section className="space-y-8">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Active Faculty"            value={analytics.facultyCount}           icon={Users}         color="emerald" />
        <StatCard label="Published Experiences"     value={analytics.experienceCount}        icon={BookOpen}      color="blue"    />
        <StatCard label="Awaiting Review"           value={analytics.pendingExperiences}     icon={Clock}         color="amber"   />
        <StatCard label="Discussions"               value={analytics.discussionCount}        icon={MessageSquare} color="slate"   />
        <StatCard label="Unanswered Questions"      value={analytics.unansweredDiscussions}  icon={AlertCircle}   color="rose"    />
      </div>

      {/* Top faculty */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Most Viewed Faculty</h2>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {(analytics.topFaculty || []).length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No faculty data yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Department</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1"><Eye size={12}/> Views</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.topFaculty.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{f.name}</td>
                    <td className="px-4 py-3 text-slate-500">{f.department || '—'}</td>
                    <td className="px-4 py-3 text-slate-700 font-bold">{f.profileViewCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Top resources */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Most Viewed Resources</h2>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {(analytics.topResources || []).length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No resource data yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Views</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Downloads</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.topResources.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{r.title}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.resourceType?.replace(/_/g,' ')}</td>
                    <td className="px-4 py-3 text-slate-700 font-bold">{r.viewCount}</td>
                    <td className="px-4 py-3 text-slate-700 font-bold">{r.downloadCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Activity by area */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Activity by Research Area</h2>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {(analytics.researchAreas || []).length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No research areas defined yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Area</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Faculty</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Experiences</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Discussions</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Resources</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.researchAreas.map(area => (
                  <tr key={area.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <span className="flex items-center gap-1.5"><Tag size={12} className="text-emerald-600"/>{area.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{area._count.facultyProfiles}</td>
                    <td className="px-4 py-3 text-slate-700">{area._count.experiences}</td>
                    <td className="px-4 py-3 text-slate-700">{area._count.discussions}</td>
                    <td className="px-4 py-3 text-slate-700">{area._count.resources}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
