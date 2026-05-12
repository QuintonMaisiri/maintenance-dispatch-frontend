'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import type { MaintenanceRequest } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { TopNav } from '@/components/top-nav';
import { StatusBadge } from '@/components/status-badge';

export default function RequestDetailPage() {
  return (
    <RequireAuth>
      <TopNav />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Detail />
      </main>
    </RequireAuth>
  );
}

function Detail() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api<MaintenanceRequest>(`/api/requests/${id}/`);
      setRequest(data);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
        setError('This request does not exist or you do not have access to it.');
      } else {
        setError('Could not load this request.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-gray-500">Loading…</p>;

  if (error) {
    return (
      <div>
        <Link href="/requests" className="text-sm text-blue-600 hover:underline">
          ← Back to requests
        </Link>
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!request) return null;

  return (
    <div>
      <Link href="/requests" className="text-sm text-blue-600 hover:underline">
        ← Back to requests
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{request.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Request #{request.id} · submitted{' '}
            {new Date(request.created_at).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-medium text-gray-700">Description</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-900">
          {request.description}
        </p>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoCard label="Submitted by">
          <span className="text-sm font-medium text-gray-900">
            {request.created_by.username}
          </span>
          <span className="block text-xs text-gray-500">
            {request.created_by.email || '—'}
          </span>
        </InfoCard>

        <InfoCard label="Assigned to">
          {request.assigned_to ? (
            <>
              <span className="text-sm font-medium text-gray-900">
                {request.assigned_to.username}
              </span>
              <span className="block text-xs text-gray-500">
                {request.assigned_to.email || '—'}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-400">Unassigned</span>
          )}
        </InfoCard>
      </section>

      <p className="mt-4 text-xs text-gray-400">
        Last updated {new Date(request.updated_at).toLocaleString()}
      </p>
    </div>
  );
}

function InfoCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}