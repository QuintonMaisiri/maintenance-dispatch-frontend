'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { FormField } from '@/components/form-field';

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  general?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, register } = useAuth();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!loading && user) router.replace('/requests');
  }, [loading, user, router]);

  function update<K extends keyof typeof form>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      await register(form);
      router.replace('/requests');
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && typeof err.data === 'object' && err.data !== null) {
        // DRF returns { field: ["error 1", "error 2"], ... }
        const fieldErrors: FieldErrors = {};
        for (const [field, msgs] of Object.entries(err.data as Record<string, string[]>)) {
          if (Array.isArray(msgs)) fieldErrors[field as keyof FieldErrors] = msgs[0];
        }
        setErrors(fieldErrors);
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' });
        console.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">
          Create a resident account
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Managers and maintenance staff are created by your property administrator.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormField
            label="Username"
            autoComplete="username"
            required
            value={form.username}
            onChange={(e) => update('username', e.target.value)}
            error={errors.username}
            disabled={submitting}
          />
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            error={errors.email}
            disabled={submitting}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="First name"
              autoComplete="given-name"
              value={form.first_name}
              onChange={(e) => update('first_name', e.target.value)}
              error={errors.first_name}
              disabled={submitting}
            />
            <FormField
              label="Last name"
              autoComplete="family-name"
              value={form.last_name}
              onChange={(e) => update('last_name', e.target.value)}
              error={errors.last_name}
              disabled={submitting}
            />
          </div>
          <FormField
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            error={errors.password}
            hint="At least 8 characters, not entirely numeric."
            disabled={submitting}
          />

          {errors.general && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.general}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}