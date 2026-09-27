import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/researchVaultAdminApi';
import AdminTable from './components/AdminTable';
import ConfirmDialog from './components/ConfirmDialog';
import { Trash2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDiscussions() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const LIMIT = 20;

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const res = await adminApi.listDiscussions({ page: p, limit: LIMIT });
      setRows(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch { toast.error('Could not load discussions.'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [page]);

  const handleDelete = async () => {
    try {
      await adminApi.deleteDiscussion(confirm.id);
      toast.success('Discussion removed.');
      setConfirm(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not remove discussion.');
      setConfirm(null);
    }
  };

  const columns = [
    { key: 'title', label: 'Question', render: r => (
      <div>
        <p className="font-semibold text-slate-900 line-clamp-1">{r.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">by {r.uploadedBy?.displayName || 'Student'} · {new Date(r.createdAt).toLocaleDateString()}</p>
      </div>
    )},
    { key: 'replies', label: 'Replies', render: r => (
      <span className="flex items-center gap-1 text-slate-500"><MessageSquare size={12}/> {r._count?.replies ?? 0}</span>
    )},
    { key: 'status', label: 'Status', render: r => (
      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${r.isResolved ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
        {r.isResolved ? 'Resolved' : 'Open'}
      </span>
    )},
    { key: 'actions', label: '', render: r => (
      <button onClick={() => setConfirm({ id: r.id, title: r.title })} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors">
        <Trash2 size={13} />
      </button>
    )},
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Discussion Moderation</h2>
      <AdminTable columns={columns} rows={rows} page={page} total={total} limit={LIMIT} onPage={p => { setPage(p); load(p); }} loading={loading} emptyMessage="No discussions yet." />
      <ConfirmDialog
        open={!!confirm}
        title="Remove discussion?"
        message={`"${confirm?.title?.slice(0,60)}${confirm?.title?.length > 60 ? '…' : ''}" and all its replies will be permanently deleted.`}
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </section>
  );
}
