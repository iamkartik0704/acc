/**
 * StatusBadge — coloured pill for content status values.
 * status: 'DRAFT' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED'
 */
const styles = {
  DRAFT:     'bg-amber-100 text-amber-800 border-amber-200',
  PUBLISHED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  REJECTED:  'bg-rose-100 text-rose-800 border-rose-200',
  ARCHIVED:  'bg-slate-100 text-slate-600 border-slate-200',
};

const labels = {
  DRAFT:     'Pending',
  PUBLISHED: 'Published',
  REJECTED:  'Rejected',
  ARCHIVED:  'Archived',
};

export default function StatusBadge({ status }) {
  const s = status?.toUpperCase() || 'DRAFT';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${styles[s] || styles.DRAFT}`}>
      {labels[s] || s}
    </span>
  );
}
