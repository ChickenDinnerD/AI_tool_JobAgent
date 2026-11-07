import cors from 'cors';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { z } from 'zod';

import { prisma } from '@jobagent/database';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      ok: true,
      data: {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.status(503).json({
      ok: false,
      error: {
        message: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown database error',
      },
    });
  }
});

app.get('/api/dashboard/stats', async (_req: Request, res: Response) => {
  try {
    const [totalJobs, activeSources, suitableJobs, newJobs, recentJobs] = await Promise.all([
      prisma.job.count(),
      prisma.source.count({ where: { status: 'ACTIVE' } }),
      prisma.jobMatch.count({ where: { status: 'MATCHED' } }),
      prisma.job.count({ where: { status: 'NEW' } }),
      prisma.job.findMany({
        take: 5,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        include: { source: true },
      }),
    ]);

    const databaseConnected = await prisma.$queryRaw<{ connected: boolean }[]>`SELECT true AS connected`
      .then(() => true)
      .catch(() => false);

    return res.status(200).json({
      ok: true,
      data: {
        totalJobs,
        activeSources,
        suitableJobs,
        newJobs,
        recentJobs: recentJobs.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          status: job.status,
          publishedAt: job.publishedAt ? job.publishedAt.toISOString() : null,
          sourceName: job.source?.name ?? null,
        })),
        systemStatus: databaseConnected ? 'healthy' : 'degraded',
        databaseConnected,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: {
        message: 'Unable to load dashboard stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

app.get('/api/jobs', async (req: Request, res: Response) => {
  const parsed = paginationSchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: {
        message: 'Invalid pagination parameters',
        details: parsed.error.flatten(),
      },
    });
  }

  try {
    const { page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.job.findMany({
        skip,
        take: limit,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        include: { source: true },
      }),
      prisma.job.count(),
    ]);

    return res.status(200).json({
      ok: true,
      data: {
        items: items.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          status: job.status,
          employmentType: job.employmentType,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          currency: job.currency,
          publishedAt: job.publishedAt ? job.publishedAt.toISOString() : null,
          url: job.url,
          source: job.source ? { id: job.source.id, name: job.source.name } : null,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: {
        message: 'Unable to list jobs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

app.get('/api/jobs/:id', async (req: Request, res: Response) => {
  const jobIdSchema = z.object({ id: z.string().min(1) });
  const parsed = jobIdSchema.safeParse(req.params);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: {
        message: 'Invalid job identifier',
        details: parsed.error.flatten(),
      },
    });
  }

  try {
    const job = await prisma.job.findUnique({
      where: { id: parsed.data.id },
      include: { source: true },
    });

    if (!job) {
      return res.status(404).json({
        ok: false,
        error: { message: 'Job not found' },
      });
    }

    return res.status(200).json({
      ok: true,
      data: {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        description: job.description,
        employmentType: job.employmentType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency,
        publishedAt: job.publishedAt ? job.publishedAt.toISOString() : null,
        status: job.status,
        source: job.source ? { id: job.source.id, name: job.source.name } : null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: {
        message: 'Unable to fetch job details',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

app.get('/api/sources', async (_req: Request, res: Response) => {
  try {
    const sources = await prisma.source.findMany({
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
    });

    return res.status(200).json({
      ok: true,
      data: sources.map((source) => ({
        id: source.id,
        name: source.name,
        url: source.url,
        category: source.category,
        country: source.country,
        collectionMethod: source.collectionMethod,
        status: source.status,
        frequency: source.frequency,
        reliability: source.reliability,
        lastSuccessfulRun: source.lastSuccessfulRun ? source.lastSuccessfulRun.toISOString() : null,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: {
        message: 'Unable to list sources',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

app.get('/api/profile', async (_req: Request, res: Response) => {
  try {
    const profile = await prisma.userProfile.findFirst({
      include: {
        skills: true,
        interests: true,
        careerPaths: true,
      },
    });

    return res.status(200).json({
      ok: true,
      data: profile
        ? {
            id: profile.id,
            name: profile.name,
            location: profile.location,
            summary: profile.summary,
            createdAt: profile.createdAt.toISOString(),
            updatedAt: profile.updatedAt.toISOString(),
            skills: profile.skills,
            interests: profile.interests,
            careerPaths: profile.careerPaths,
          }
        : null,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: {
        message: 'Unable to fetch profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    ok: false,
    error: { message: 'Endpoint not found' },
  });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({
    ok: false,
    error: {
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    },
  });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});

export default app;
