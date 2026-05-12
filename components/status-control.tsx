'use client';

import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { MaintenanceRequest, RequestStatus } from '@/lib/types';

const OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

interface Props {
  request: MaintenanceRequest;
  onUpdated: (updated: MaintenanceRequest) => void;
}

export function StatusControl({ request, onUpdated }: Props) {
  const [selected, setSelected] = useState<RequestStatus>(request.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const updated = await api<MaintenanceRequest>(
        `/api/requests/${request.id}/`,
        {
          method: 'PATCH',
          body: { status: selected },
        },
      );
      onUpdated(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        setError('Could not update status.');
      } else {
        setError('Something went wrong. Please try again.');
      }
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const dirty = selected !== request.status;

  return (
    <div>
      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
        Update status
      </label>
      <div className="mt-1 flex gap-2">
        <select
          id="status"
          value={selected}
          onChange={(e) => setSelected(e.target.value as RequestStatus)}
          disabled={saving}
          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}