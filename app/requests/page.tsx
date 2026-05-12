'use client';

import { RequireAuth } from '@/components/require-auth';
import { TopNav } from '@/components/top-nav';
import { useAuth } from '@/lib/auth-context';

export default function RequestsPage() {
  return (
    <RequireAuth>
      <TopNav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Inner />
      </main>
    </RequireAuth>
  );
}

function Inner() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Maintenance Requests</h1>
      <p className="mt-4 text-gray-600">
        Welcome, {user.username}. Your role is <strong>{user.role}</strong>.
      </p>
      <p className="mt-2 text-gray-500 text-sm">
        Real list table comes in Step 7.
      </p>
    </div>
  );
}