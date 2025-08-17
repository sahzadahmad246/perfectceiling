import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getSharingMetrics, getSecurityMetrics } from "@/lib/sharing/monitoring";
import { SharingPerformanceMonitor } from "@/lib/sharing/monitoring";
import { DatabasePerformanceMonitor, getSystemHealth } from "@/lib/sharing/performanceMiddleware";
import { quotationCache } from "@/lib/sharing/cache";

// define types for metrics
type TimeRangeMetric = {
  start: string;
  end: string;
  duration: string;
};

type SharingMetric = Awaited<ReturnType<typeof getSharingMetrics>> | { error: string };
type SecurityMetric = Awaited<ReturnType<typeof getSecurityMetrics>> | { error: string };
type PerformanceMetric = {
  api: ReturnType<typeof SharingPerformanceMonitor.getAllStats>;
  database: ReturnType<typeof DatabasePerformanceMonitor.getQueryStats>;
  cache: ReturnType<typeof quotationCache.getStats>;
};
type SystemHealthMetric = Awaited<ReturnType<typeof getSystemHealth>>;

type Metrics = {
  timeRange: TimeRangeMetric;
  sharing?: SharingMetric;
  security?: SecurityMetric;
  performance?: PerformanceMetric;
  health?: SystemHealthMetric;
};

// GET /api/admin/sharing/metrics - Get sharing analytics and metrics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication and authorization
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const includePerformance = searchParams.get('includePerformance') === 'true';
    const includeSecurity = searchParams.get('includeSecurity') === 'true';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 1);
    }

    const metrics: Metrics = {
      timeRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        duration: timeRange,
      },
    };

    // Get sharing metrics
    try {
      metrics.sharing = await getSharingMetrics({ startDate, endDate });
    } catch (error) {
      console.error('Error getting sharing metrics:', error);
      metrics.sharing = {
        error: 'Failed to retrieve sharing metrics',
      };
    }

    // Get security metrics if requested
    if (includeSecurity) {
      try {
        metrics.security = await getSecurityMetrics({ startDate, endDate });
      } catch (error) {
        console.error('Error getting security metrics:', error);
        metrics.security = {
          error: 'Failed to retrieve security metrics',
        };
      }
    }

    // Get performance metrics if requested
    if (includePerformance) {
      metrics.performance = {
        api: SharingPerformanceMonitor.getAllStats(),
        database: DatabasePerformanceMonitor.getQueryStats(),
        cache: quotationCache.getStats(),
      };
    }

    // Always include system health
    metrics.health = await getSystemHealth();

    return NextResponse.json(metrics);

  } catch (error) {
    console.error('Error getting sharing metrics:', error);
    return NextResponse.json({
      error: "Internal server error",
      code: "SERVER_ERROR"
    }, { status: 500 });
  }
}
