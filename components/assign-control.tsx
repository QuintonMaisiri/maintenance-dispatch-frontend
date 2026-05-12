'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { MaintenanceRequest, User } from '@/lib/types';

interface Props {
  request: MaintenanceRequest;
  onUpdated: (updated: MaintenanceRequest) => void;
}

export function AssignControl({ request, onUpdated }: Props) {
  const [staff, setStaff] = useState<User[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [selectedId, setSelectedId] = useState<string>(
    request.assigned_to ? String(request.assigned_to.id) : '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api<User[]>('/api/auth/staff/');
        setStaff(data);
      } catch (err) {
        console.error(err);
        setError('Could not load staff list.');
      } finally {
        setLoadingStaff(false);
      }
    })();
  }, []);

  useEffect(() => {
    setSelectedId(request.assigned_to ? String(request.assigned_to.id) : '');
  }, [request.assigned_to]);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const updated = await api<MaintenanceRequest>(
        `/api/requests/${request.id}/`,
        {
          method: 'PATCH',
          body: {
            assigned_to_id: selectedId === '' ? null : Number(selectedId),
          },
        },
      );
      onUpdated(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        setError('Could not update the assignment.');
      } else {
        setError('Something went wrong. Please try again.');
      }
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const currentId = request.assigned_to ? String(request.assigned_to.id) : '';
  const dirty = selectedId !== currentId;

  return (
    <div>
      <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">
        Assign to
      </label>
      <div className="mt-1 flex gap-2">
        <select
          id="assignee"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={loadingStaff || saving}
          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50"
        >
          <option value="">Unassigned</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.username}
              {s.first_name || s.last_name
                ? ` — ${[s.first_name, s.last_name].filter(Boolean).join(' ')}`
                : ''}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving || loadingStaff}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}