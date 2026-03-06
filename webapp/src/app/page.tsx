import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Activity, Shield, Stethoscope, MessageSquare } from 'lucide-react';

export default async function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>

      <div className="max-w-md w-full space-y-8 text-center mt-10">
        <div>
          <Activity className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to MedIQ Space
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please choose your portal destination below
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <SignedOut>
            <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="mb-4 text-gray-500">Sign in to access your dashboard</p>
              <Link
                href="/sign-in"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign In
              </Link>
            </div>
          </SignedOut>

          <SignedIn>
            <Link href="/chat" className="flex items-center p-4 bg-white hover:bg-blue-50 transition rounded-xl shadow border border-gray-200 cursor-pointer text-left w-full group">
              <MessageSquare className="h-6 w-6 text-blue-500 mr-4 group-hover:scale-110 transition" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Patient Chat</h3>
                <p className="text-sm text-gray-500">Talk to the AI Medical Assistant</p>
              </div>
            </Link>

            <Link href="/doctor" className="flex items-center p-4 bg-white hover:bg-green-50 transition rounded-xl shadow border border-gray-200 cursor-pointer text-left w-full group">
              <Stethoscope className="h-6 w-6 text-green-500 mr-4 group-hover:scale-110 transition" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Provider Portal</h3>
                <p className="text-sm text-gray-500">View appointments & queue</p>
              </div>
            </Link>

            <Link href="/admin" className="flex items-center p-4 bg-slate-800 hover:bg-slate-700 transition rounded-xl shadow border border-slate-700 cursor-pointer text-left w-full group">
              <Shield className="h-6 w-6 text-indigo-400 mr-4 group-hover:scale-110 transition" />
              <div>
                <h3 className="text-lg font-medium text-white">Admin Dashboard</h3>
                <p className="text-sm text-indigo-300">System settings and users</p>
              </div>
            </Link>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}


