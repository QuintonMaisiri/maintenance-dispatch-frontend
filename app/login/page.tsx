'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { FormField } from '@/components/form-field';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If a logged-in user lands here (e.g. by typing /login), send them away.
  useEffect(() => {
    if (!loading && user) router.replace('/requests');
  }, [loading, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      router.replace('/requests');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Invalid username or password.');
      } else {
        setError('Something went wrong. Please try again.');
        console.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">
          Sign in to Maintenance Dispatch
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormField
            label="Username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={submitting}
          />
          <FormField
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          New resident?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}