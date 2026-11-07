'use client';

import { useEffect, useState } from 'react';
import EmptyState from '@/components/empty-state';
import { apiFetch } from '@/lib/api';

type SourceRecord = {
  id: string;
  name: string;
  url: string;
  category: string;
  country: string | null;
  collectionMethod: string | null;
  status: string;
  frequency: string | null;
  reliability: number | null;
  lastSuccessfulRun: string | null;
};

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<SourceRecord[]>('/sources');
        setSources(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load sources');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="text-slate-300">Loading sources…</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">{error}</div>;
  }

  if (sources.length === 0) {
    return <EmptyState title="No source registry entries" message="The source registry is empty until new sources are added to the system." />;
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Registry</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Sources</h2>
      </header>

      <div className="grid gap-4">
        {sources.map((source) => (
          <div key={source.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-medium text-white">{source.name}</h3>
                <p className="mt-1 text-sm text-slate-300">{source.category}</p>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-emerald-200">
                {source.status}
              </span>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
              <div>
                <span className="text-slate-500">URL</span>
                <p className="break-all">{source.url}</p>
              </div>
              <div>
                <span className="text-slate-500">Country</span>
                <p>{source.country ?? 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-500">Reliability</span>
                <p>{source.reliability ?? 'N/A'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
