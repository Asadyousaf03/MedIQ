import Link from 'next/link';
import { Activity } from 'lucide-react';

type SignUpPageProps = {
  searchParams?: Promise<{
    error?: string;
  }> | {
    error?: string;
  };
};

export default async function Page({ searchParams }: SignUpPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const errorMessage = resolvedSearchParams.error ? decodeURIComponent(resolvedSearchParams.error) : null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
              <Activity className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold text-slate-900">MedIQ</span>
          </Link>
          <h1 className="mt-5 text-2xl font-semibold text-slate-900">Create account</h1>
          <p className="mt-2 text-sm text-slate-500">Patient accounts are created locally and stay in your PostgreSQL database.</p>
        </div>

        <div className="card-surface p-8">
          {errorMessage ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form action="/api/auth/sign-up" method="post" className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="fullName">Full name</label>
              <input id="fullName" name="fullName" type="text" required className="input-field" placeholder="Ayesha Khan" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className="input-field" placeholder="patient@example.com" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required minLength={8} className="input-field" placeholder="At least 8 characters" />
            </div>
            <p className="text-xs text-slate-500">This app creates patient accounts locally. Doctor and admin accounts are seeded separately.</p>
            <button type="submit" className="btn-primary w-full">Create account</button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link href="/sign-in" className="font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
