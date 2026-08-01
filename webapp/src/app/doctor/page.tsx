import { Calendar, Users, Clock, Activity } from 'lucide-react';
import { query, Appointment } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import AppNav from '@/components/AppNav';

export const dynamic = 'force-dynamic';

async function getAppointments(doctorId: number) {
  try {
    const res = await query(
      `SELECT * FROM appointments 
       WHERE doctor_id = $1 
       ORDER BY appointment_time ASC`,
      [doctorId]
    );
    return res.rows as Appointment[];
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return [];
  }
}

async function getDoctorId(userId: number, fullName: string): Promise<number | null> {
  try {
    const result = await query('SELECT doctor_id FROM users WHERE id = $1', [userId]);
    const doctorId = result.rows[0]?.doctor_id;
    if (doctorId) {
      return doctorId;
    }
  } catch (error) {
    console.error('Failed to look up doctor_id on users table:', error);
  }

  try {
    const fallback = await query('SELECT id FROM doctors WHERE lower(name) = lower($1) LIMIT 1', [fullName]);
    if (fallback.rows.length > 0) {
      return fallback.rows[0].id;
    }
  } catch (error) {
    console.error('Failed to match doctor record by name:', error);
  }

  return null;
}

export default async function DoctorDashboard() {
  const currentUser = await requireRole(['doctor']);

  const doctorId = await getDoctorId(currentUser.id, currentUser.full_name);
  const appointments = doctorId ? await getAppointments(doctorId) : [];

  const pendingAppointments = appointments.filter((a) => a.status === 'pending');
  const todayAppointments = appointments.filter((a) => {
    const today = new Date();
    const apptDate = new Date(a.appointment_time);
    return (
      apptDate.getDate() === today.getDate() &&
      apptDate.getMonth() === today.getMonth() &&
      apptDate.getFullYear() === today.getFullYear()
    );
  });

  return (
    <div className="min-h-screen">
      <AppNav currentUser={currentUser} />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back, {currentUser.full_name}</p>

        {!doctorId ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            We couldn&apos;t match your account to a doctor profile. Ask an admin to link your account to a doctor record.
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card-surface p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[var(--primary)]">
                <Calendar className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Today&apos;s Appointments</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{todayAppointments.length}</p>
              </div>
            </div>
          </div>

          <div className="card-surface p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pending Requests</p>
                <p className={`mt-1 text-2xl font-semibold ${pendingAppointments.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {pendingAppointments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card-surface p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Activity className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Appointments</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{appointments.length}</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Appointment Queue</h2>
        <div className="mt-4 card-surface overflow-hidden">
          {appointments.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-slate-500">No appointments found.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {appointments.map((appointment) => (
                <li key={appointment.id} className="px-4 py-4 transition hover:bg-[var(--secondary)] sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-900">
                      {appointment.patient_name || 'Anonymous Patient'}
                    </div>
                    <span className="badge-status" data-status={appointment.status}>{appointment.status}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {new Date(appointment.appointment_time).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-slate-400" />
                      {appointment.reason}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
