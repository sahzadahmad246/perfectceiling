// lib/sharing/performanceMiddleware.ts
import { NextRequest, NextResponse } from "next/server";
import { SharingPerformanceMonitor } from "./monitoring";

/**
 * Performance monitoring middleware for API routes
 */
export function withPerformanceMonitoring<C, R extends NextResponse = NextResponse>(
  handler: (req: NextRequest, context: C) => Promise<R>,
  endpointName: string
) {
  return async (req: NextRequest, context: C): Promise<R> => {
    const startTime = Date.now();
    
    try {
      const response = await handler(req, context);
      const duration = Date.now() - startTime;
      
      // Record performance metrics
      SharingPerformanceMonitor.recordEndpointPerformance(endpointName, duration);
      
      // Add performance headers for debugging
      response.headers.set('X-Response-Time', `${duration}ms`);
      response.headers.set('X-Endpoint', endpointName);
      
      // Log slow requests
      if (duration > 1000) { // Log requests taking more than 1 second
        console.warn(`Slow request detected: ${endpointName} took ${duration}ms`, {
          method: req.method,
          url: req.url,
          userAgent: req.headers.get('user-agent'),
          ip: req.headers.get('x-forwarded-for') || 'unknown',
        });
      }
      
      return response as R;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record failed request performance
      SharingPerformanceMonitor.recordEndpointPerformance(`${endpointName}_ERROR`, duration);
      
      console.error(`Error in ${endpointName} after ${duration}ms:`, error);
      throw error;
    }
  };
}

/**
 * Database query performance monitoring
 */
export class DatabasePerformanceMonitor {
  private static queryMetrics = new Map<string, Array<{ timestamp: number; duration: number }>>();

  static async monitorQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;
      
      this.recordQueryPerformance(queryName, duration);
      
      // Log slow queries
      if (duration > 500) { // Log queries taking more than 500ms
        console.warn(`Slow database query: ${queryName} took ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordQueryPerformance(`${queryName}_ERROR`, duration);
      throw error;
    }
  }

  private static recordQueryPerformance(queryName: string, duration: number): void {
    if (!this.queryMetrics.has(queryName)) {
      this.queryMetrics.set(queryName, []);
    }

    const metrics = this.queryMetrics.get(queryName)!;
    metrics.push({ timestamp: Date.now(), duration });

    // Keep only last 50 measurements per query
    if (metrics.length > 50) {
      metrics.shift();
    }
  }

  static getQueryStats(): Record<string, {
    averageTime: number;
    maxTime: number;
    queryCount: number;
  }> {
    const stats: Record<string, { averageTime: number; maxTime: number; queryCount: number }> = {};

    for (const [queryName, metrics] of this.queryMetrics.entries()) {
      if (metrics.length === 0) continue;

      const durations = metrics.map(m => m.duration);
      const averageTime = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxTime = Math.max(...durations);

      stats[queryName] = {
        averageTime: Math.round(averageTime),
        maxTime,
        queryCount: metrics.length,
      };
    }

    return stats;
  }
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage(): {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
} {
  const usage = process.memoryUsage();
  
  return {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
    rss: Math.round(usage.rss / 1024 / 1024), // MB
  };
}

/**
 * System health check
 */
export async function getSystemHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, {
    status: 'pass' | 'fail';
    responseTime?: number;
    error?: string;
  }>;
  timestamp: string;
}> {
  const checks: Record<string, { status: 'pass' | 'fail'; responseTime?: number; error?: string }> = {};
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // Database connectivity check
  try {
    const startTime = Date.now();
    const { connectToDatabase } = await import('@/lib/db');
    await connectToDatabase();
    const responseTime = Date.now() - startTime;
    
    checks.database = {
      status: responseTime < 1000 ? 'pass' : 'fail',
      responseTime,
    };
    
    if (responseTime >= 1000) {
      overallStatus = 'degraded';
    }
  } catch (error) {
    checks.database = {
      status: 'fail',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    overallStatus = 'unhealthy';
  }

  // Memory usage check
  const memoryUsage = getMemoryUsage();
  const memoryThreshold = 512; // MB
  
  checks.memory = {
    status: memoryUsage.heapUsed < memoryThreshold ? 'pass' : 'fail',
    responseTime: memoryUsage.heapUsed,
  };
  
  if (memoryUsage.heapUsed >= memoryThreshold) {
    if (overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }
  }

  // API performance check
  const performanceStats = SharingPerformanceMonitor.getAllStats();
  const hasSlowEndpoints = Object.values(performanceStats).some(
    stat => stat && stat.averageResponseTime > 1000
  );
  
  checks.performance = {
    status: hasSlowEndpoints ? 'fail' : 'pass',
  };
  
  if (hasSlowEndpoints && overallStatus === 'healthy') {
    overallStatus = 'degraded';
  }

  return {
    status: overallStatus,
    checks,
    timestamp: new Date().toISOString(),
  };
}