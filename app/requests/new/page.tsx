'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import type { MaintenanceRequest } from '@/lib/types';
import { RequireAuth } from '@/components/require-auth';
import { RequireRole } from '@/components/require-role';
import { TopNav } from '@/components/top-nav';
import { FormField } from '@/components/form-field';

export default function NewRequestPage() {
  return (
    <RequireAuth>
      <RequireRole roles={['RESIDENT']}>
        <TopNav />
        <main className="mx-auto max-w-2xl px-6 py-8">
          <NewRequestForm />
        </main>
      </RequireRole>
    </RequireAuth>
  );
}

interface FieldErrors {
  title?: string;
  description?: string;
  general?: string;
}

function NewRequestForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const created = await api<MaintenanceRequest>('/api/requests/', {
        method: 'POST',
        body: { title, description },
      });
      router.replace(`/requests/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && typeof err.data === 'object' && err.data !== null) {
        const fieldErrors: FieldErrors = {};
        for (const [field, msgs] of Object.entries(err.data as Record<string, string[]>)) {
          if (Array.isArray(msgs)) fieldErrors[field as keyof FieldErrors] = msgs[0];
        }
        setErrors(fieldErrors);
      } else {
        setErrors({ general: 'Could not submit your request. Please try again.' });
        console.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link href="/requests" className="text-sm text-blue-600 hover:underline">
        ← Back to requests
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-gray-900">
        Submit a maintenance request
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        A property manager will review your request and assign it to maintenance staff.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <FormField
          label="Title"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          disabled={submitting}
          placeholder="e.g. Leaky kitchen tap"
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
            placeholder="Please describe the issue in detail."
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
              errors.description
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          )}
        </div>

        {errors.general && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors.general}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/requests"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !title.trim() || !description.trim()}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit request'}
          </button>
        </div>
      </form>
    </div>
  );
}