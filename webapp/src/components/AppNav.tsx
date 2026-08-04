import Link from 'next/link';
import { Activity } from 'lucide-react';
import { getCurrentUser, type AuthUser } from '@/lib/auth';

type AppNavProps = {
  currentUser?: AuthUser | null;
};

export default async function AppNav({ currentUser }: AppNavProps = {}) {
  const user = currentUser !== undefined ? currentUser : await getCurrentUser();

  return (
    <nav className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-sm shadow-teal-900/10">
            <Activity className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-slate-900">MedIQ</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-[var(--secondary)] hover:text-slate-900 sm:inline-block"
          >
            Home
          </Link>

          {user ? (
            <>
              <Link
                href="/chat"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-[var(--secondary)] hover:text-slate-900 sm:inline-block"
              >
                Chat
              </Link>
              <Link
                href="/patient"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-[var(--secondary)] hover:text-slate-900 sm:inline-block"
              >
                Patient Portal
              </Link>
              {user.role === 'doctor' || user.role === 'admin' ? (
                <Link
                  href="/doctor"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-[var(--secondary)] hover:text-slate-900 sm:inline-block"
                >
                  Doctor Portal
                </Link>
              ) : null}
              <form action="/sign-out" method="post" className="ml-1">
                <button type="submit" className="btn-secondary !py-2 !px-3.5 text-sm">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/sign-in" className="btn-primary ml-1 !py-2 !px-4 text-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
