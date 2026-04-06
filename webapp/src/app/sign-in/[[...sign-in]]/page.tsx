import Link from 'next/link';

type SignInPageProps = {
  searchParams?: Promise<{
    error?: string;
  }> | {
    error?: string;
  };
};

export default async function Page({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const errorMessage = resolvedSearchParams.error ? decodeURIComponent(resolvedSearchParams.error) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col justify-center">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">MedIQ</p>
          <h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-slate-300">Use one of the local demo accounts or your patient account.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
          {errorMessage ? (
            <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {errorMessage}
            </div>
          ) : null}

          <form action="/api/auth/sign-in" method="post" className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-blue-400" placeholder="doctor@mediq.local" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-blue-400" placeholder="Enter your password" />
            </div>
            <button type="submit" className="w-full rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400">Sign in</button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-300">
            Need an account? <Link href="/sign-up" className="font-medium text-blue-300 hover:text-blue-200">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
