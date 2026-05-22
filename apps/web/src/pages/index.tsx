import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [status, setStatus] = useState('offline');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
        if (res.ok) {
          setStatus('online');
        }
      } catch (error) {
        setStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">ServiceOS</h1>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span className="text-sm text-slate-300">{status}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Operations Dashboard</h2>
          <p className="text-slate-300">AI-Native Service Execution Platform</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Workflow Card */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-slate-400 text-sm font-medium">Active Workflows</div>
            <div className="mt-2 text-3xl font-bold">0</div>
            <div className="mt-1 text-xs text-slate-500">0% of capacity</div>
          </div>

          {/* Agent Card */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-slate-400 text-sm font-medium">Active Agents</div>
            <div className="mt-2 text-3xl font-bold">0</div>
            <div className="mt-1 text-xs text-slate-500">Ready</div>
          </div>

          {/* Approval Card */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-slate-400 text-sm font-medium">Pending Approvals</div>
            <div className="mt-2 text-3xl font-bold">0</div>
            <div className="mt-1 text-xs text-slate-500">Awaiting action</div>
          </div>

          {/* Compliance Card */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-slate-400 text-sm font-medium">Compliance Status</div>
            <div className="mt-2 text-3xl font-bold">100%</div>
            <div className="mt-1 text-xs text-slate-500">Fully compliant</div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <NavLink href="/workflows" label="Workflows" />
            <NavLink href="/agents" label="Agents" />
            <NavLink href="/documents" label="Documents" />
            <NavLink href="/compliance" label="Compliance" />
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="font-semibold">System Status</h3>
          <div className="mt-4 text-sm text-slate-300">
            <p>API Status: <span className="text-green-400">Operational</span></p>
            <p className="mt-2">Database: <span className="text-green-400">Connected</span></p>
            <p className="mt-2">Cache: <span className="text-green-400">Connected</span></p>
          </div>
        </div>
      </div>
    </main>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-center text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
    >
      {label}
    </a>
  );
}
