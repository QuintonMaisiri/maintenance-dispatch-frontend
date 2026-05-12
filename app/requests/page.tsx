'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { MaintenanceRequest, Paginated } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { TopNav } from '@/components/top-nav';
import { StatusBadge } from '@/components/status-badge';

export default function RequestsPage() {
  return (
    <RequireAuth>
      <TopNav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <RequestsList />
      </main>
    </RequireAuth>
  );
}

function RequestsList() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<Paginated<MaintenanceRequest>>('/api/requests/');
      setRequests(data.results);
    } catch (err) {
      console.error(err);
      setError('Could not load requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!user) return null;

  const heading =
    user.role === 'MANAGER'
      ? 'All maintenance requests'
      : user.role === 'STAFF'
        ? 'Requests assigned to you'
        : 'Your maintenance requests';

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{heading}</h1>
        {user.role === 'RESIDENT' && (
          <Link
            href="/requests/new"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            New request
          </Link>
        )}
      </div>

      {loading && <p className="mt-8 text-gray-500">Loading…</p>}

      {error && (
        <p className="mt-8 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && requests.length === 0 && <EmptyState role={user.role} />}

      {!loading && !error && requests.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Title</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                {user.role === 'MANAGER' && (
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Created by</th>
                )}
                {user.role !== 'STAFF' && (
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Assigned to</th>
                )}
                <th className="px-4 py-2 text-left font-medium text-gray-500">Created</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{r.title}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  {user.role === 'MANAGER' && (
                    <td className="px-4 py-3 text-gray-700">{r.created_by.username}</td>
                  )}
                  {user.role !== 'STAFF' && (
                    <td className="px-4 py-3 text-gray-700">
                      {r.assigned_to ? r.assigned_to.username : <span className="text-gray-400">Unassigned</span>}
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/requests/${r.id}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyState({ role }: { role: string }) {
  const message =
    role === 'MANAGER'
      ? 'No maintenance requests have been submitted yet.'
      : role === 'STAFF'
        ? 'No requests have been assigned to you yet.'
        : 'You haven\'t submitted any maintenance requests yet.';

  return (
    <div className="mt-12 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}