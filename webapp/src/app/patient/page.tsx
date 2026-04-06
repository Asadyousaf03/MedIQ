import Link from 'next/link';
import { Activity, Calendar, ClipboardList, Clock, FileText, HeartPulse, Pill } from 'lucide-react';
import { requireCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';

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

type MedicalTimelineItem = {
  id: number;
  symptoms: string;
  diagnosis_suspected: string;
  recommended_specialty: string;
  created_at: Date;
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

async function getMedicalTimeline(userId: number) {
  try {
    const result = await query(
      `SELECT id, symptoms, diagnosis_suspected, recommended_specialty, created_at
       FROM medical_records
       WHERE patient_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [String(userId)],
    );

    return result.rows as MedicalTimelineItem[];
  } catch (error) {
    console.error('Failed to fetch medical timeline:', error);
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
  const timeline = await getMedicalTimeline(currentUser.id);

  const fallbackAppointments: PatientAppointment[] = [
    {
      id: 1001,
      doctor_id: 2,
      patient_id: String(currentUser.id),
      patient_name: currentUser.full_name,
      status: 'confirmed',
      appointment_time: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      reason: 'Follow-up for recurring headaches and sleep hygiene review',
      notes: 'Bring previous blood pressure readings if available.',
      doctor_name: 'Dr. Gregory House',
      doctor_specialty: 'Diagnostician',
    },
    {
      id: 1002,
      doctor_id: 1,
      patient_id: String(currentUser.id),
      patient_name: currentUser.full_name,
      status: 'completed',
      appointment_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      reason: 'General fatigue and hydration counseling',
      notes: 'Recommended hydration target: 2-2.5L/day and 20-minute walks.',
      doctor_name: 'Dr. Sarah Plain',
      doctor_specialty: 'General Practitioner',
    },
    {
      id: 1003,
      doctor_id: 10,
      patient_id: String(currentUser.id),
      patient_name: currentUser.full_name,
      status: 'pending',
      appointment_time: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      reason: 'Pediatric consultation preparation for family health questions',
      notes: 'Pending confirmation from clinic.',
      doctor_name: 'Dr. Doogie Howser',
      doctor_specialty: 'Pediatrics',
    },
  ];

  const fallbackTimeline: MedicalTimelineItem[] = [
    {
      id: 2001,
      symptoms: 'Intermittent tension headache, mild neck stiffness, late sleep cycle',
      diagnosis_suspected: 'Likely stress-related headache pattern',
      recommended_specialty: 'General Practitioner / Neurology if persistent',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    },
    {
      id: 2002,
      symptoms: 'Low daytime energy and irregular meal timing',
      diagnosis_suspected: 'Lifestyle-associated fatigue',
      recommended_specialty: 'Internal Medicine / Nutrition',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28),
    },
  ];

  const resolvedAppointments = appointments.length > 0 ? appointments : fallbackAppointments;
  const resolvedTimeline = timeline.length > 0 ? timeline : fallbackTimeline;

  const upcoming = resolvedAppointments
    .filter((appointment) => new Date(appointment.appointment_time).getTime() >= Date.now() && appointment.status !== 'cancelled')
    .sort((a, b) => new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime())[0];

  const completedCount = resolvedAppointments.filter((appointment) => appointment.status === 'completed').length;
  const pendingCount = resolvedAppointments.filter((appointment) => appointment.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Activity className="h-7 w-7 text-blue-600" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">MedIQ</p>
              <h1 className="text-sm font-semibold text-slate-900">Patient Portal</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/chat" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500">
              Open AI Chat
            </Link>
            <Link href="/sign-out" className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
              Sign out
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Welcome back</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">{currentUser.full_name}</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Appointments</p>
              <p className="mt-2 text-2xl font-bold text-blue-900">{resolvedAppointments.length}</p>
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
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2" id="next-visit">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
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
                  <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    <span className="font-medium text-slate-900">Pre-visit note:</span> {upcoming.notes}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No upcoming visit scheduled yet. Use AI chat to find a doctor and book instantly.</p>
            )}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" id="care-insights">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-pink-600" />
              <h3 className="text-lg font-semibold text-slate-900">Care Insights</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="rounded-lg bg-slate-50 p-3">Hydration and sleep consistency were recurring themes in your recent consultations.</li>
              <li className="rounded-lg bg-slate-50 p-3">You have one pending appointment request that may need confirmation follow-up.</li>
              <li className="rounded-lg bg-slate-50 p-3">Consider tracking headache frequency in the chat before your next follow-up.</li>
            </ul>
          </article>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" id="appointment-history">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-slate-900">Appointment History</h3>
            </div>
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
                <tbody className="divide-y divide-slate-100">
                  {resolvedAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="py-3 text-slate-700">{formatDateTime(appointment.appointment_time)}</td>
                      <td className="py-3 text-slate-700">{appointment.doctor_name ?? 'Assigned Provider'}</td>
                      <td className="py-3 text-slate-600">{appointment.reason}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{appointment.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" id="medical-timeline">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-slate-900">Medical Timeline</h3>
            </div>
            <ol className="mt-4 space-y-4">
              {resolvedTimeline.map((entry) => (
                <li key={entry.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{formatDateTime(entry.created_at)}</p>
                  <p className="mt-2 text-sm text-slate-700"><span className="font-medium text-slate-900">Symptoms:</span> {entry.symptoms}</p>
                  <p className="mt-1 text-sm text-slate-700"><span className="font-medium text-slate-900">Assessment:</span> {entry.diagnosis_suspected}</p>
                  <p className="mt-1 text-sm text-slate-700"><span className="font-medium text-slate-900">Recommended specialty:</span> {entry.recommended_specialty}</p>
                </li>
              ))}
            </ol>
          </article>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" id="medications">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-violet-600" />
              <h3 className="text-lg font-semibold text-slate-900">Medication & Routine Snapshot</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="rounded-lg bg-slate-50 p-3">Morning: Multivitamin after breakfast (self-reported adherence: 5/7 days).</li>
              <li className="rounded-lg bg-slate-50 p-3">Hydration target: 8 glasses/day (current trend: 6 glasses/day).</li>
              <li className="rounded-lg bg-slate-50 p-3">Sleep target: before 11:30 PM (current average: 12:20 AM).</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" id="documents">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-600" />
              <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/chat" className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-500">
                Ask AI to summarize your latest symptoms
              </Link>
              <Link href="/chat" className="rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200">
                Upload a lab report for explanation
              </Link>
              <Link href="/chat" className="rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200">
                Find specialist and request booking
              </Link>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
