import type { RequestStatus } from '@/lib/types';

const STYLES: Record<RequestStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 ring-blue-200',
  COMPLETED: 'bg-green-100 text-green-800 ring-green-200',
  CANCELLED: 'bg-gray-100 text-gray-700 ring-gray-200',
};

const LABELS: Record<RequestStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}