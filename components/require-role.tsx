'use client';

import { type ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import type { Role } from '@/lib/types';

export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: ReactNode;
}) {
  const { user } = useAuth();

  if (!user) return null; // RequireAuth above us will handle the redirect

  if (!roles.includes(user.role)) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          You don&apos;t have access to this page
        </h2>
        <p className="mt-2 text-gray-600">
          Your role ({user.role}) doesn&apos;t have permission to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}