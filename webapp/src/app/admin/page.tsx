import Link from 'next/link';
import { Shield, BrainCircuit, Activity } from 'lucide-react';
import { requireRole } from '@/lib/auth';

export default async function AdminDashboard() {
  await requireRole(['admin']);

  const knowledgeBaseStatus = [
    { name: 'Diabetes Management Guidelines', version: 'v2.3', status: 'Synced', lastSync: '2h ago' },
    { name: 'Emergency First Aid Playbook', version: 'v1.9', status: 'Syncing', lastSync: 'In progress' },
    { name: 'Mental Health Triage Protocol', version: 'v1.4', status: 'Synced', lastSync: 'Yesterday' },
  ];

  const roleQueue = [
    { user: 'patient@mediq.local', requestedRole: 'patient', state: 'Approved' },
    { user: 'newdoctor@mediq.local', requestedRole: 'doctor', state: 'Pending review' },
    { user: 'ops@mediq.local', requestedRole: 'admin', state: 'Requires verification' },
  ];

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
              <form action="/sign-out" method="post">
                <button type="submit" className="text-sm font-medium text-indigo-300 hover:text-indigo-200">
                  Sign out
                </button>
              </form>
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
            <a href="#knowledge-base" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition">Configure Knowledge Base</a>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div className="flex items-center mb-4">
              <Activity className="h-6 w-6 text-indigo-400 mr-3" />
              <h2 className="text-xl font-semibold">Access Portals</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">Manage Doctor provisioning, approve new signups, and monitor roles.</p>
            <a href="#user-roles" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition">Manage Users & Roles</a>
          </div>
        </div>

        <section id="knowledge-base" className="mt-8 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="text-xl font-semibold text-white">Knowledge Base Sync Status</h2>
          <p className="mt-2 text-sm text-slate-400">Operational placeholder data for admin workflows until live indexing telemetry is connected.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="pb-2">Dataset</th>
                  <th className="pb-2">Version</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-slate-200">
                {knowledgeBaseStatus.map((item) => (
                  <tr key={item.name}>
                    <td className="py-3">{item.name}</td>
                    <td className="py-3">{item.version}</td>
                    <td className="py-3">{item.status}</td>
                    <td className="py-3">{item.lastSync}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="user-roles" className="mt-8 rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="text-xl font-semibold text-white">User & Role Queue</h2>
          <p className="mt-2 text-sm text-slate-400">Role onboarding pipeline with dummy records for a complete admin flow.</p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {roleQueue.map((item) => (
              <div key={item.user} className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                <p className="text-sm font-medium text-white">{item.user}</p>
                <p className="mt-1 text-xs text-slate-400">Requested: {item.requestedRole}</p>
                <p className="mt-3 inline-block rounded-full bg-indigo-500/20 px-2 py-1 text-xs font-medium text-indigo-300">{item.state}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
