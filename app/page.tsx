'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? '/requests' : '/login');
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-gray-500">
      Loading…
    </div>
  );
}