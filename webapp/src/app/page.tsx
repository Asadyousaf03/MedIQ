import Link from 'next/link';
import { MessageSquare, ClipboardList, Stethoscope, ArrowRight } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import AppNav from '@/components/AppNav';

export default async function Home() {
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen">
      <AppNav currentUser={currentUser} />

      <main className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <span className="rounded-full border border-[var(--border)] bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
          AI Healthcare Assistant
        </span>

        <h1 className="font-display mt-8 text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
          MedIQ
        </h1>

        <p className="mt-6 max-w-2xl text-xl font-medium text-slate-700 sm:text-2xl">
          Understand your symptoms and get matched to the right doctor — in one conversation.
        </p>
        <p className="mt-4 max-w-xl text-base text-slate-500">
          MedIQ triages your symptoms, explains lab reports in plain language, and books your appointment automatically, so you spend less time searching and more time getting care.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {currentUser ? (
            <Link href="/chat" className="btn-primary text-base">
              Try the chat
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="btn-primary text-base">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/sign-up" className="btn-secondary text-base">
                Create an account
              </Link>
            </>
          )}
        </div>

        {currentUser ? (
          <div className="mt-16 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/chat" className="card-surface group flex items-start gap-4 p-5 transition hover:border-[var(--primary)]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[var(--primary)]">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">AI Chat</h3>
                <p className="mt-1 text-sm text-slate-500">Describe symptoms, upload lab reports, get guidance</p>
              </div>
            </Link>

            <Link href="/patient" className="card-surface group flex items-start gap-4 p-5 transition hover:border-[var(--primary)]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[var(--primary)]">
                <ClipboardList className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Patient Portal</h3>
                <p className="mt-1 text-sm text-slate-500">View your appointment history and next visit</p>
              </div>
            </Link>

            {currentUser.role === 'doctor' || currentUser.role === 'admin' ? (
              <Link href="/doctor" className="card-surface group flex items-start gap-4 p-5 transition hover:border-[var(--primary)]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[var(--primary)]">
                  <Stethoscope className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Doctor Portal</h3>
                  <p className="mt-1 text-sm text-slate-500">Review your appointment queue</p>
                </div>
              </Link>
            ) : null}
          </div>
        ) : null}
      </main>

      <footer className="border-t border-[var(--border)] bg-white/60 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          <p className="font-medium text-slate-600">Demo credentials</p>
          <p className="mt-1">
            Patient: <span className="font-mono text-slate-700">patient@mediq.local</span> / <span className="font-mono text-slate-700">patient123</span>
            {'  ·  '}
            Doctor: <span className="font-mono text-slate-700">doctor@mediq.local</span> / <span className="font-mono text-slate-700">doctor123</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
