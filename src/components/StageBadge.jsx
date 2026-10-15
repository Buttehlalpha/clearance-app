import { CheckCircle2, XCircle, Clock } from 'lucide-react'

const CONFIG = {
  approved: { icon: CheckCircle2, className: 'bg-success/10 text-success', label: 'Approved' },
  rejected: { icon: XCircle, className: 'bg-danger/10 text-danger', label: 'Rejected' },
  pending: { icon: Clock, className: 'bg-amber/10 text-amber-dark', label: 'Pending' },
}

export default function StageBadge({ decision }) {
  const cfg = CONFIG[decision] ?? CONFIG.pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.className}`}>
      <Icon size={13} strokeWidth={2} />
      {cfg.label}
    </span>
  )
}
