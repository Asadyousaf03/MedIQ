import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Activity, Users, Calendar, Settings, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { query, Appointment } from '@/lib/db';

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

async function getDoctorId(clerkId: string): Promise<number | null> {
    // For now, return the first doctor ID for demo purposes if not found, 
    // or map Clerk ID to doctor table. 
    // In a real app, you'd match the Clerk userId to a 'clerk_id' column in doctors table.
    // Here we'll just pick ID 1 (Dr. Sarah Plain) for testing.
    return 1; 
}

export default async function DoctorDashboard() {
  const session = await auth();
  
  // Basic check for authenticated state
  if (!session.userId) {
    redirect('/sign-in');
  }

  const doctorId = await getDoctorId(session.userId);
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
              <UserButton />
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
                  <span className="font-medium text-blue-600 hover:text-blue-500">View schedule</span>
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
                  <span className="font-medium text-blue-600 hover:text-blue-500">View waiting room</span>
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
                 <span className="font-medium text-gray-500">Manage availability</span>
                </div>
              </div>
            </div>
          </div>

          <h2 className="mt-8 text-xl font-bold text-gray-900">Recent Appointments</h2>
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
        </div>
      </main>
    </div>
  );
}
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Update availability</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
