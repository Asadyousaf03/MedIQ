import Link from 'next/link';
import { Activity, Users, Calendar, Settings, Clock } from 'lucide-react';
import { query, Appointment } from '@/lib/db';
import { requireRole } from '@/lib/auth';

// Force dynamic rendering to ensure fresh data
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

async function getDoctorId(): Promise<number | null> {
    // Demo mapping: one local doctor account maps to doctor record 1.
    // Extend this later by adding a doctor_id column to the users table.
    return 1;
}

export default async function DoctorDashboard() {
  const currentUser = await requireRole(['doctor']);

  const doctorId = await getDoctorId();
  const appointments = doctorId ? await getAppointments(doctorId) : [];
  
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const todayAppointments = appointments.filter(a => {
      const today = new Date();
      const apptDate = new Date(a.appointment_time);
      return apptDate.getDate() === today.getDate() && 
             apptDate.getMonth() === today.getMonth() && 
             apptDate.getFullYear() === today.getFullYear();
  });


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Activity className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">MedIQ Provider Portal</span>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/sign-out" className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Sign out</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">Doctor Dashboard</h1>
          
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Quick Actions / Stats Cards */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Appointments</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{todayAppointments.length}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#schedule" className="font-medium text-blue-600 hover:text-blue-500">View schedule</a>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Requests</dt>
                      <dd className="flex items-baseline">
                        <div className={`text-2xl font-semibold ${pendingAppointments.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>{pendingAppointments.length}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#waiting-room" className="font-medium text-blue-600 hover:text-blue-500">View waiting room</a>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Settings className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Profile Settings</dt>
                    </dl>
                  </div>
                </div>
              </div>
               <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                 <a href="#availability" className="font-medium text-gray-600 hover:text-gray-700">Manage availability</a>
                </div>
              </div>
            </div>
          </div>

          <h2 id="schedule" className="mt-8 text-xl font-bold text-gray-900">Recent Appointments</h2>
          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {appointments.length === 0 ? (
                 <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">No appointments found.</li>
              ) : (
                appointments.map((appointment) => (
                  <li key={appointment.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="text-sm leading-5 font-medium text-blue-600 truncate">
                          {appointment.patient_name || 'Anonymous Patient'}
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <div className="mr-6 flex items-center text-sm leading-5 text-gray-500">
                            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {new Date(appointment.appointment_time).toLocaleString()}
                          </div>
                          <div className="mt-2 flex items-center text-sm leading-5 text-gray-500 sm:mt-0">
                            <Activity className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {appointment.reason}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm leading-5 text-gray-500 sm:mt-0">
                             {/* Actions can go here in V2 */}
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          <section id="waiting-room" className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Waiting Room Overview</h3>
            <p className="mt-2 text-sm text-gray-600">Patients with pending requests are highlighted here so your team can prioritize callbacks and confirmations.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-yellow-50 p-4">
                <p className="text-xs uppercase tracking-wide text-yellow-700">Pending confirmations</p>
                <p className="mt-1 text-2xl font-bold text-yellow-900">{pendingAppointments.length}</p>
              </div>
              <div className="rounded-md bg-emerald-50 p-4">
                <p className="text-xs uppercase tracking-wide text-emerald-700">Confirmed today</p>
                <p className="mt-1 text-2xl font-bold text-emerald-900">
                  {todayAppointments.filter((appointment) => appointment.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </section>

          <section id="availability" className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Availability Template</h3>
            <p className="mt-2 text-sm text-gray-600">Dummy schedule shown until personalized provider settings are connected.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="pb-2">Day</th>
                    <th className="pb-2">Morning</th>
                    <th className="pb-2">Afternoon</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  <tr>
                    <td className="py-2">Monday</td>
                    <td className="py-2">09:00 - 12:00</td>
                    <td className="py-2">14:00 - 17:00</td>
                    <td className="py-2"><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">Open</span></td>
                  </tr>
                  <tr>
                    <td className="py-2">Wednesday</td>
                    <td className="py-2">10:00 - 12:30</td>
                    <td className="py-2">15:00 - 18:00</td>
                    <td className="py-2"><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">Open</span></td>
                  </tr>
                  <tr>
                    <td className="py-2">Friday</td>
                    <td className="py-2">09:30 - 11:30</td>
                    <td className="py-2">--</td>
                    <td className="py-2"><span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">Limited</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
