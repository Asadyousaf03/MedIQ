import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  MessageSquare,
  ClipboardList,
  Stethoscope,
  FileText,
  CalendarCheck,
  Sparkles,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import AppNav from '@/components/AppNav';

export default async function Home() {
  const currentUser = await getCurrentUser();
  const primaryCtaHref = currentUser ? '/chat' : '/sign-in';
  const primaryCtaLabel = currentUser ? 'Open AI chat' : 'Try the demo';

  return (
    <div className="min-h-screen">
      <AppNav currentUser={currentUser} />

      {/* Hero — one composition */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="landing-orb landing-orb-a" />
          <div className="landing-orb landing-orb-b" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--background)] to-transparent" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-20">
          <div className="landing-fade-up lg:col-span-5">
            <p className="font-display text-6xl font-semibold tracking-tight text-slate-900 sm:text-7xl lg:text-8xl">
              MedIQ
            </p>
            <h1 className="mt-6 max-w-md text-2xl font-medium leading-snug text-slate-700 sm:text-3xl">
              Care guidance that starts with a conversation.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-500">
              Describe how you feel, understand lab language in plain English, and get matched to the right doctor — then book from the same chat.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={primaryCtaHref} className="btn-primary text-base">
                {primaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!currentUser ? (
                <Link href="/sign-up" className="btn-secondary text-base">
                  Create account
                </Link>
              ) : (
                <Link href="/patient" className="btn-secondary text-base">
                  Patient portal
                </Link>
              )}
            </div>
            <p className="mt-6 text-xs text-slate-400">
              Guidance only — not a diagnosis or emergency service.
            </p>
          </div>

          <div className="landing-fade-up landing-fade-up-delay relative lg:col-span-7">
            <div className="landing-hero-plane relative overflow-hidden rounded-[1.5rem] border border-teal-200/60 bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-800 shadow-[0_40px_80px_-40px_rgba(15,118,110,0.55)]">
              <div className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(45,212,191,0.35), transparent 35%)',
                }}
              />
              <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">MedIQ Chat</p>
                    <p className="text-xs text-teal-100/80">AI healthcare assistant</p>
                  </div>
                </div>
                <span className="landing-pulse-dot inline-flex items-center gap-2 text-xs text-teal-50">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Online
                </span>
              </div>

              <div className="relative space-y-4 px-5 py-6 sm:px-7 sm:py-8">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-white/95 px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-sm">
                  I’ve had a persistent cough and low fever for three days. Should I see someone?
                </div>
                <div className="max-w-[90%] rounded-2xl rounded-tl-md border border-white/10 bg-white/10 px-4 py-3 text-sm leading-relaxed text-teal-50 backdrop-blur-sm">
                  That pattern can point to a respiratory issue that needs a clinical look. I can walk through a quick triage, then match you with a general practitioner or pulmonologist and help book a visit.
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-teal-50">
                    Symptom triage
                  </span>
                  <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-teal-50">
                    Doctor match
                  </span>
                  <span className="rounded-lg border border-emerald-300/30 bg-emerald-400/15 px-3 py-1.5 text-xs font-medium text-emerald-100">
                    Book appointment
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[var(--border)] bg-white/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">How it works</p>
          <h2 className="font-display mt-3 max-w-xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            From first symptom to booked visit.
          </h2>
          <p className="mt-3 max-w-xl text-base text-slate-500">
            One calm path designed for patients who need clarity before they walk into a clinic.
          </p>

          <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            <li className="landing-step">
              <span className="font-display text-4xl font-semibold text-teal-200">01</span>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">Describe what you feel</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Chat naturally about symptoms, duration, and concerns — or attach a lab report for plain-language explanation.
              </p>
            </li>
            <li className="landing-step">
              <span className="font-display text-4xl font-semibold text-teal-200">02</span>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">Get grounded guidance</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                MedIQ adapts to the specialty in play — respiratory, mental health, pediatrics, and more — without pretending to diagnose.
              </p>
            </li>
            <li className="landing-step">
              <span className="font-display text-4xl font-semibold text-teal-200">03</span>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">Meet the right doctor</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                See matched providers from the directory and book an appointment that shows up in your patient portal.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Built for care journeys</p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need between “I feel off” and “I’m booked.”
          </h2>

          <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon={<MessageSquare className="h-5 w-5" />}
              title="Conversational triage"
              body="Ask focused questions, stay calm under stress, and surface red flags that need urgent care."
            />
            <Feature
              icon={<FileText className="h-5 w-5" />}
              title="Lab report clarity"
              body="Upload a PDF report and get an explanation you can actually discuss with your clinician."
            />
            <Feature
              icon={<Stethoscope className="h-5 w-5" />}
              title="Doctor matching"
              body="Search seeded specialists by need and specialty, then continue straight into booking."
            />
            <Feature
              icon={<CalendarCheck className="h-5 w-5" />}
              title="Appointment booking"
              body="Confirm from chat and see the visit appear in your real appointment history."
            />
            <Feature
              icon={<ClipboardList className="h-5 w-5" />}
              title="Patient & provider portals"
              body="Patients track visits; doctors see the pending queue — connected to the same database."
            />
            <Feature
              icon={<Sparkles className="h-5 w-5" />}
              title="Memory across the session"
              body="MedIQ keeps conversation context so you don’t re-explain the same symptoms every message."
            />
          </div>
        </div>
      </section>

      {/* Signed-in portals */}
      {currentUser ? (
        <section className="border-t border-[var(--border)] bg-white/60 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-semibold text-slate-900">Continue where you left off</h2>
            <p className="mt-2 text-sm text-slate-500">Signed in as {currentUser.full_name}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/chat" className="card-surface flex items-start gap-4 p-5 transition hover:border-[var(--primary)]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[var(--primary)]">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">AI Chat</h3>
                  <p className="mt-1 text-sm text-slate-500">Start or continue a care conversation</p>
                </div>
              </Link>
              <Link href="/patient" className="card-surface flex items-start gap-4 p-5 transition hover:border-[var(--primary)]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[var(--primary)]">
                  <ClipboardList className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">Patient Portal</h3>
                  <p className="mt-1 text-sm text-slate-500">Appointments and next visit</p>
                </div>
              </Link>
              {currentUser.role === 'doctor' || currentUser.role === 'admin' ? (
                <Link href="/doctor" className="card-surface flex items-start gap-4 p-5 transition hover:border-[var(--primary)]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[var(--primary)]">
                    <Stethoscope className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900">Doctor Portal</h3>
                    <p className="mt-1 text-sm text-slate-500">Review your appointment queue</p>
                  </div>
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Final CTA */}
      <section className="border-t border-[var(--border)] py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Ready when you are.
          </h2>
          <p className="mt-4 text-base text-slate-500">
            Use the demo accounts below, open chat, and walk the full patient-to-doctor loop in minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={primaryCtaHref} className="btn-primary text-base">
              {primaryCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 rounded-2xl border border-[var(--border)] bg-white/70 px-5 py-4 text-left text-sm text-slate-600 sm:text-center">
            <p className="font-medium text-slate-800">Demo credentials</p>
            <p className="mt-2 font-mono text-xs sm:text-sm">
              patient@mediq.local / patient123
              <span className="mx-2 text-slate-300">·</span>
              doctor@mediq.local / doctor123
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] bg-white/70 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p className="font-display text-base font-semibold text-slate-800">MedIQ</p>
          <p>AI healthcare guidance for portfolio demo use.</p>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[var(--primary)]">
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{body}</p>
    </div>
  );
}
