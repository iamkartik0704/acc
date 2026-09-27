import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/researchVaultAdminApi';
import ConfirmDialog from './components/ConfirmDialog';
import StatusBadge from './components/StatusBadge';
import { X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { label: 'Pending', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Rejected', value: 'REJECTED' },
];

function RejectDialog({ entry, onClose, onRejected }) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error('Please provide a reason.');
    setSaving(true);
    try {
      await adminApi.rejectExperience(entry.id, reason.trim());
      toast.success('Experience rejected.');
      onRejected();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not reject experience.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Reject submission</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X size={16}/></button>
        </div>
        <p className="text-sm text-slate-600 mb-1 font-semibold">{entry.title}</p>
        <p className="text-xs text-slate-400 mb-4">by {entry.uploadedBy?.displayName || 'Student'}</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Reason for rejection</label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Let the student know why their submission was rejected…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 resize-none"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
              {saving ? 'Rejecting…' : 'Reject submission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminExperienceQueue() {
  const [status, setStatus] = useState('DRAFT');
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [viewComments, setViewComments] = useState(null); // id of experience to show comments

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getModerationQueue({ status });
      setQueue(res.data?.data || []);
    } catch {
      toast.error('Could not load experience queue.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const publish = async (entry) => {
    try {
      await adminApi.publishExperience(entry.id);
      toast.success('Experience published.');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not publish.');
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await adminApi.deleteExperienceComment(commentId);
      toast.success('Comment deleted.');
      load();
    } catch {
      toast.error('Could not delete comment.');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Experience Moderation</h2>
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                status === tab.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-400">Loading…</p>
      ) : queue.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-10 text-center text-sm text-slate-400">
          {status === 'DRAFT' ? 'No pending submissions — queue is clear.' : `No ${status.toLowerCase()} experiences.`}
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map(entry => (
            <article key={entry.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={entry.status} />
                    <p className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleDateString()}</p>
                  </div>
                  <h3 className="font-bold text-slate-900">{entry.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">by {entry.uploadedBy?.displayName || 'Student'} · {entry.uploadedBy?.rollNo || ''}</p>
                  <p className="mt-3 text-sm text-slate-700 leading-relaxed line-clamp-3">{entry.description}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    {entry.labName && <span>Lab: {entry.labName}</span>}
                    {entry.guideName && <span>Guide: {entry.guideName}</span>}
                    {entry.duration && <span>Duration: {entry.duration}</span>}
                  </div>
                  {entry.rejectionReason && (
                    <div className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2">
                      <p className="text-xs font-semibold text-rose-700">Rejection reason:</p>
                      <p className="text-xs text-rose-600 mt-0.5">{entry.rejectionReason}</p>
                    </div>
                  )}

                  {/* Comments section toggle */}
                  {(entry.comments?.length > 0 || entry._count?.comments > 0) && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setViewComments(viewComments === entry.id ? null : entry.id)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        {viewComments === entry.id ? 'Hide comments' : `View ${entry.comments?.length || entry._count?.comments} comments`}
                      </button>

                      {viewComments === entry.id && entry.comments && (
                        <div className="mt-3 space-y-2">
                          {entry.comments.map(c => (
                            <div key={c.id} className="rounded-lg bg-slate-50 p-3 flex justify-between gap-3 group">
                              <div>
                                <p className="text-xs font-bold text-slate-700">{c.uploadedBy?.displayName || 'Student'} <span className="font-normal text-slate-400">· {new Date(c.createdAt).toLocaleDateString()}</span></p>
                                <p className="text-sm text-slate-600 mt-1">{c.content}</p>
                              </div>
                              <button
                                onClick={() => deleteComment(c.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 transition-all"
                                title="Delete comment"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
                {status === 'DRAFT' && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => publish(entry)}
                      className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => setRejectTarget(entry)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-rose-300 hover:text-rose-700 transition-colors"
                    >
                      Reject…
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {rejectTarget && (
        <RejectDialog
          entry={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onRejected={() => { setRejectTarget(null); load(); }}
        />
      )}
    </section>
  );
}
