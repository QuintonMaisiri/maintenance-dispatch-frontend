'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const ROLE_LABEL: Record<string, string> = {
  MANAGER: 'Property Manager',
  STAFF: 'Maintenance Staff',
  RESIDENT: 'Resident',
};

export function TopNav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null; // anonymous pages render their own header

  async function handleLogout() {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/requests" className="text-lg font-semibold">
          Maintenance Dispatch
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <div className="font-medium">{user.username}</div>
            <div className="text-gray-500">{ROLE_LABEL[user.role] ?? user.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}