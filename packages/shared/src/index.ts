export const apiVersion = 'v1';

export type DashboardStats = {
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
