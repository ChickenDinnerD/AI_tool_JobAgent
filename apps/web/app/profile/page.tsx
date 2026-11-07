'use client';

import { useEffect, useState } from 'react';
import EmptyState from '@/components/empty-state';
import { apiFetch } from '@/lib/api';

type ProfileRecord = {
  id: string;
  name: string;
  location: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
  skills: Array<{ id: string; name: string; category: string | null; proficiency: string | null }>;
  interests: Array<{ id: string; name: string; description: string | null }>;
  careerPaths: Array<{ id: string; title: string; description: string | null; status: string }>;
};

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch<ProfileRecord | null>('/profile');
        setProfile(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="text-slate-300">Loading profile…</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">{error}</div>;
  }

  if (!profile) {
    return <EmptyState title="No profile data" message="The user profile has not been initialized yet." />;
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Identity</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Profile</h2>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-2xl font-semibold text-white">{profile.name}</h3>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-300">
          <span>{profile.location ?? 'Location not set'}</span>
          <span>•</span>
          <span>Updated {formatDate(profile.updatedAt)}</span>
        </div>
        <p className="mt-4 text-slate-300">{profile.summary ?? 'No summary available yet.'}</p>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h3 className="text-lg font-semibold text-white">Skills</h3>
          {profile.skills.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No skills added yet.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill.id} className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
                  {skill.name}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h3 className="text-lg font-semibold text-white">Interests</h3>
          {profile.interests.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No interests recorded yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {profile.interests.map((interest) => (
                <li key={interest.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <p className="font-medium text-white">{interest.name}</p>
                  <p className="mt-1 text-slate-400">{interest.description ?? 'No description yet.'}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-lg font-semibold text-white">Career paths</h3>
        {profile.careerPaths.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No career paths configured yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {profile.careerPaths.map((path) => (
              <li key={path.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{path.title}</p>
                  <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-violet-200">
                    {path.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{path.description ?? 'No description yet.'}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
