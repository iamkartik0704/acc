import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart3, BookOpenCheck, BriefcaseBusiness, FlaskConical, Users, MessageSquare, Folders } from 'lucide-react';
import { adminApi } from '../../api/researchVaultAdminApi';
import toast from 'react-hot-toast';

import AdminAnalytics from './AdminAnalytics';
import AdminFacultyList from './AdminFacultyList';
import AdminExperienceQueue from './AdminExperienceQueue';
import AdminAreas from './AdminAreas';
import AdminResources from './AdminResources';
import AdminPositions from './AdminPositions';
import AdminDiscussions from './AdminDiscussions';

const TABS = [
  { id: 'analytics', label: 'Overview', icon: BarChart3 },
  { id: 'moderation', label: 'Experiences', icon: BookOpenCheck },
  { id: 'faculty', label: 'Faculty', icon: Users },
  { id: 'resources', label: 'Resources', icon: Folders },
  { id: 'positions', label: 'Open positions', icon: BriefcaseBusiness },
  { id: 'discussions', label: 'Discussions', icon: MessageSquare },
  { id: 'areas', label: 'Research areas', icon: FlaskConical },
];

export default function ResearchVaultAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get('section') || 'analytics';

  const [analytics, setAnalytics] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBaseData = useCallback(async () => {
    setLoading(true);
    try {
      const [stats, facs, areaList] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.listFaculty({ limit: 1000 }), // large limit for dropdowns
        adminApi.listAreas(),
      ]);
      setAnalytics(stats.data?.data || null);
      setFaculty(facs.data?.data || []);
      setAreas(areaList.data?.data || []);
    } catch {
      toast.error('Could not load vault reference data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBaseData();
  }, [loadBaseData]);

  const setSection = (id) => {
    setSearchParams({ section: id });
  };

  return (
    <div className="research-vault-theme mx-auto max-w-7xl space-y-6 pb-12 text-slate-900 px-4 sm:px-6 lg:px-8 mt-6">
      <header className="border-b border-slate-200 pb-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Research Vault</p>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-950">
          <FlaskConical size={28} className="text-emerald-700" /> Administration
        </h1>
        <p className="mt-2 text-sm text-slate-600">Review contributions and maintain the research directory.</p>
      </header>

      <nav className="vault-tabs flex items-center gap-2 overflow-x-auto px-1 pb-1 scrollbar-none" aria-label="Research administration sections">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSection(tab.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${
                section === tab.id
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="min-h-[400px]">
        {loading && section === 'analytics' ? (
          <p className="py-10 text-center text-sm text-slate-500">Loading dashboard...</p>
        ) : (
          <>
            {section === 'analytics' && <AdminAnalytics analytics={analytics} />}
            {section === 'moderation' && <AdminExperienceQueue />}
            {section === 'faculty' && <AdminFacultyList areas={areas} />}
            {section === 'resources' && <AdminResources areas={areas} />}
            {section === 'positions' && <AdminPositions faculty={faculty} />}
            {section === 'discussions' && <AdminDiscussions />}
            {section === 'areas' && <AdminAreas onAreasChanged={loadBaseData} />}
          </>
        )}
      </main>
    </div>
  );
}
