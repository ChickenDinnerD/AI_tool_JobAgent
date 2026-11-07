'use client';

import { useEffect, useState } from 'react';
import EmptyState from '@/components/empty-state';
import StatsCard from '@/components/stats-card';
import { apiFetch } from '@/lib/api';

type DashboardStats = {
  totalJobs: number;
  activeSources: number;
  suitableJobs: number;
  newJobs: number;
  recentJobs: Array<{
    id: string;
    title: string;
    company: string;
    location: string | null;
    status: string;
    publishedAt: string | null;
    sourceName: string | null;
  }>;
  systemStatus: 'healthy' | 'degraded' | 'offline';
  databaseConnected: boolean;
};

const formatDate = (value: string | null) => {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await apiFetch<DashboardStats>('/dashboard/stats');
        setStats(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <div className="text-slate-300">Loading dashboard…</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">{error}</div>;
  }

  if (!stats) {
    return <EmptyState title="No dashboard data yet" message="The project has not loaded stats from the database yet." />;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Overview</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Dashboard</h2>
        </div>
        <div className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">
          System: <span className="font-medium text-emerald-300">{stats.systemStatus}</span>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="New jobs" value={stats.newJobs} subtitle="Recent additions" accent="cyan" />
        <StatsCard title="Active sources" value={stats.activeSources} subtitle="Monitoring" accent="emerald" />
        <StatsCard title="Suitable jobs" value={stats.suitableJobs} subtitle="High match potential" accent="violet" />
        <StatsCard title="Database" value={stats.databaseConnected ? 'Connected' : 'Offline'} subtitle={stats.databaseConnected ? 'PostgreSQL healthy' : 'Check database'} accent={stats.databaseConnected ? 'emerald' : 'amber'} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent jobs</h3>
            <span className="text-sm text-slate-400">{stats.totalJobs} total</span>
          </div>

          {stats.recentJobs.length === 0 ? (
            <EmptyState title="No jobs yet" message="As soon as the first jobs are indexed, they will appear here." />
          ) : (
            <div className="space-y-3">
              {stats.recentJobs.map((job) => (
                <div key={job.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-medium text-white">{job.title}</p>
                      <p className="mt-1 text-sm text-slate-300">{job.company}</p>
                    </div>
                    <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-300">
                      {job.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span>{job.location ?? 'Remote'}</span>
                    <span>{job.sourceName ?? 'Source pending'}</span>
                    <span>{formatDate(job.publishedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h3 className="text-lg font-semibold text-white">System health</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-center justify-between">
                <span>Database</span>
                <span className={stats.databaseConnected ? 'text-emerald-300' : 'text-amber-300'}>
                  {stats.databaseConnected ? 'Connected' : 'Disconnected'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Sources</span>
                <span>{stats.activeSources}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Matches</span>
                <span>{stats.suitableJobs}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
