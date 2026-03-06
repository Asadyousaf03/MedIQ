import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Shield, BrainCircuit, Activity } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session.userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <nav className="bg-slate-800 border-b border-slate-700 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-indigo-400" />
              <span className="text-xl font-bold tracking-wider">MedIQ Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-400">System Status: <span className="text-green-400">Online</span></span>
              <UserButton appearance={{ elements: { userButtonAvatarBox: "border-2 border-indigo-400" } }}/>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8">System Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center mb-4">
              <BrainCircuit className="h-6 w-6 text-indigo-400 mr-3" />
              <h2 className="text-xl font-semibold">AI Models & Agents</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">Manage knowledge bases, agent prompt guidelines, and sync state.</p>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition">Configure Knowledge Base</button>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center mb-4">
              <Activity className="h-6 w-6 text-indigo-400 mr-3" />
              <h2 className="text-xl font-semibold">Access Portals</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">Manage Doctor provisioning, approve new signups, and monitor roles.</p>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition">Manage Users & Roles</button>
          </div>
        </div>
      </main>
    </div>
  );
}
