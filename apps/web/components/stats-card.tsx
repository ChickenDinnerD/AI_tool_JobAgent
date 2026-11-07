type StatsCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: 'cyan' | 'emerald' | 'amber' | 'violet';
};

const accentClasses: Record<NonNullable<StatsCardProps['accent']>, string> = {
  cyan: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
  emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  amber: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  violet: 'border-violet-500/40 bg-violet-500/10 text-violet-200',
};

export default function StatsCard({ title, value, subtitle, accent = 'cyan' }: StatsCardProps) {
  return (
    <div className={`rounded-2xl border p-5 ${accentClasses[accent]}`}>
      <p className="text-xs uppercase tracking-[0.14em] text-slate-300">{title}</p>
      <div className="mt-4 text-3xl font-semibold text-white">{value}</div>
      {subtitle ? <p className="mt-2 text-sm text-slate-300">{subtitle}</p> : null}
    </div>
  );
}
