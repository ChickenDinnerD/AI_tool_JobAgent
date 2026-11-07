'use client';

import { useEffect, useState } from 'react';
import EmptyState from '@/components/empty-state';
import { apiFetch } from '@/lib/api';

type JobRecord = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  status: string;
  employmentType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  publishedAt: string | null;
  url: string;
  source: { id: string; name: string } | null;
};

type JobsResponse = {
  items: JobRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<JobsResponse>('/jobs');
        setJobs(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load jobs');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="text-slate-300">Loading jobs…</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">{error}</div>;
  }

  if (!jobs || jobs.items.length === 0) {
    return <EmptyState title="No job records" message="The database does not yet contain job entries." />;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Pipeline</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Jobs</h2>
        </div>
        <div className="text-sm text-slate-400">{jobs.pagination.total} total</div>
      </header>

      <div className="space-y-4">
        {jobs.items.map((job) => (
          <div key={job.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-xl font-medium text-white">{job.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{job.company}</p>
              </div>
              <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-300">
                {job.status}
              </span>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
              <div>
                <span className="text-slate-500">Location</span>
                <p>{job.location ?? 'Remote'}</p>
              </div>
              <div>
                <span className="text-slate-500">Source</span>
                <p>{job.source?.name ?? 'Unassigned'}</p>
              </div>
              <div>
                <span className="text-slate-500">Published</span>
                <p>{formatDate(job.publishedAt)}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>{job.employmentType ?? 'Full-time'}</span>
              <span>•</span>
              <span>
                {job.salaryMin && job.salaryMax
                  ? `${job.currency ?? 'USD'} ${job.salaryMin} - ${job.salaryMax}`
                  : 'Compensation not set'}
              </span>
            </div>

            <div className="mt-4">
              <a href={job.url} target="_blank" rel="noreferrer" className="text-sm text-cyan-300 hover:text-cyan-200">
                View source ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
