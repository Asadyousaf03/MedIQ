import Link from 'next/link';
import { Calendar, Clock, MessageSquareText, Sparkles } from 'lucide-react';
import { requireCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import AppNav from '@/components/AppNav';

export const dynamic = 'force-dynamic';

type PatientAppointment = {
  id: number;
  doctor_id: number;
  patient_id: string;
  patient_name: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  appointment_time: Date;
  reason: string;
  notes?: string;
  doctor_name?: string;
  doctor_specialty?: string;
};

async function getPatientAppointments(userId: number, patientName: string) {
  try {
    const result = await query(
      `SELECT
         a.id,
         a.doctor_id,
         a.patient_id,
         a.patient_name,
         a.status,
         a.appointment_time,
         a.reason,
         a.notes,
         d.name AS doctor_name,
         d.specialty AS doctor_specialty
       FROM appointments a
       LEFT JOIN doctors d ON d.id = a.doctor_id
       WHERE a.patient_id = $1 OR lower(coalesce(a.patient_name, '')) = lower($2)
       ORDER BY a.appointment_time DESC`,
      [String(userId), patientName],
    );

    return result.rows as PatientAppointment[];
  } catch (error) {
    console.error('Failed to fetch patient appointments:', error);
    return [];
  }
}

function formatDateTime(value: Date) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function PatientPortalPage() {
  const currentUser = await requireCurrentUser();

  const appointments = await getPatientAppointments(currentUser.id, currentUser.full_name);

  const upcoming = appointments
    .filter((appointment) => new Date(appointment.appointment_time).getTime() >= Date.now() && appointment.status !== 'cancelled')
    .sort((a, b) => new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime())[0];

  const completedCount = appointments.filter((appointment) => appointment.status === 'completed').length;
  const pendingCount = appointments.filter((appointment) => appointment.status === 'pending').length;

  return (
    <div className="min-h-screen">
      <AppNav currentUser={currentUser} />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="card-surface p-6">
          <p className="text-sm text-slate-500">Welcome back</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">{currentUser.full_name}</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-teal-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-teal-700">Appointments</p>
              <p className="mt-2 text-2xl font-bold text-teal-900">{appointments.length}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Completed Visits</p>
              <p className="mt-2 text-2xl font-bold text-emerald-900">{completedCount}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Pending Requests</p>
              <p className="mt-2 text-2xl font-bold text-amber-900">{pendingCount}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article className="card-surface p-6 lg:col-span-2" id="next-visit">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="text-lg font-semibold text-slate-900">Next Visit</h3>
            </div>

            {upcoming ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Doctor:</span> {upcoming.doctor_name ?? 'Assigned Provider'}
                  {' • '}
                  {upcoming.doctor_specialty ?? 'Specialist'}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-900">When:</span> {formatDateTime(upcoming.appointment_time)}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Reason:</span> {upcoming.reason}
                </p>
                {upcoming.notes ? (
                  <p className="rounded-lg bg-[var(--secondary)] p-3 text-sm text-slate-600">
                    <span className="font-medium text-slate-900">Pre-visit note:</span> {upcoming.notes}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-6 text-center">
                <p className="text-sm text-slate-500">No upcoming visit scheduled yet.</p>
                <Link href="/chat" className="btn-primary mt-4 inline-flex text-sm">
                  Find a doctor in chat
                </Link>
              </div>
            )}
          </article>

          <article className="card-surface p-6" id="quick-actions">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/chat" className="btn-primary justify-start">
                <MessageSquareText className="h-4 w-4" />
                Ask AI about your symptoms
              </Link>
              <Link href="/chat" className="btn-secondary justify-start">
                Upload a lab report for explanation
              </Link>
              <Link href="/chat" className="btn-secondary justify-start">
                Find a specialist and request booking
              </Link>
            </div>
          </article>
        </section>

        <section className="mt-6" id="appointment-history">
          <article className="card-surface p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="text-lg font-semibold text-slate-900">Appointment History</h3>
            </div>

            {appointments.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
                <p className="text-sm text-slate-500">You don&apos;t have any appointments yet.</p>
                <p className="mt-1 text-sm text-slate-500">Chat with MediBot to get matched with a doctor and book your first visit.</p>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Doctor</th>
                      <th className="pb-3">Reason</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="py-3 text-slate-700">{formatDateTime(appointment.appointment_time)}</td>
                        <td className="py-3 text-slate-700">{appointment.doctor_name ?? 'Assigned Provider'}</td>
                        <td className="py-3 text-slate-600">{appointment.reason}</td>
                        <td className="py-3">
                          <span className="badge-status" data-status={appointment.status}>{appointment.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
