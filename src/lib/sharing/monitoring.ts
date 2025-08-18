// lib/sharing/monitoring.ts
import { ShareAuditLog } from "@/models/ShareAuditLog";
import { QuotationAccess } from "@/models/QuotationAccess";
import type { PipelineStage } from "mongoose";
import { getRateLimitStats } from "./rateLimiter";

export interface SharingMetrics {
  totalSharedQuotations: number;
  totalAccessAttempts: number;
  successfulAccesses: number;
  failedVerifications: number;
  blockedIPs: number;
  averageAccessesPerQuotation: number;
  topAccessedQuotations: Array<{
    quotationId: string;
    accessCount: number;
    clientName?: string;
  }>;
  recentActivity: Array<{
    action: string;
    timestamp: Date;
    quotationId: string;
    ipAddress: string;
  }>;
}

export interface SecurityMetrics {
  suspiciousIPs: Array<{
    ipAddress: string;
    failedAttempts: number;
    lastAttempt: Date;
  }>;
  rateLimitStats: {
    totalEntries: number;
    blockedEntries: number;
    config: unknown;
  };
  unusualPatterns: Array<{
    pattern: string;
    count: number;
    description: string;
  }>;
}

/**
 * Gets comprehensive sharing metrics for monitoring dashboard
 */
export async function getSharingMetrics(timeRange: {
  startDate: Date;
  endDate: Date;
}): Promise<SharingMetrics> {
  const { startDate, endDate } = timeRange;

  try {
    // Get total shared quotations count
    const totalSharedQuotations = await ShareAuditLog.countDocuments({
      action: 'shared',
      timestamp: { $gte: startDate, $lte: endDate },
    });

    // Get access attempts
    const accessAttempts = await QuotationAccess.find({
      accessedAt: { $gte: startDate, $lte: endDate },
    });

    const totalAccessAttempts = accessAttempts.length;
    const successfulAccesses = accessAttempts.filter(attempt => attempt.successful).length;
    const failedVerifications = totalAccessAttempts - successfulAccesses;

    // Get rate limit stats
    const rateLimitStats = getRateLimitStats();
    const blockedIPs = rateLimitStats.blockedEntries;

    // Calculate average accesses per quotation
    const quotationAccessCounts = accessAttempts.reduce((acc, attempt) => {
      acc[attempt.quotationId] = (acc[attempt.quotationId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageAccessesPerQuotation = totalSharedQuotations > 0 
      ? totalAccessAttempts / totalSharedQuotations 
      : 0;

    // Get top accessed quotations
    const topAccessedQuotations = Object.entries(quotationAccessCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([quotationId, accessCount]) => ({
        quotationId,
        accessCount: accessCount as number,
      }));

    // Get recent activity
    const recentActivity = await ShareAuditLog.find({
      timestamp: { $gte: startDate, $lte: endDate },
    })
      .sort({ timestamp: -1 })
      .limit(50)
      .select('action timestamp quotationId ipAddress')
      .lean();

    return {
      totalSharedQuotations,
      totalAccessAttempts,
      successfulAccesses,
      failedVerifications,
      blockedIPs,
      averageAccessesPerQuotation: Math.round(averageAccessesPerQuotation * 100) / 100,
      topAccessedQuotations,
      recentActivity: recentActivity.map(activity => ({
        action: activity.action,
        timestamp: activity.timestamp,
        quotationId: activity.quotationId,
        ipAddress: activity.ipAddress,
      })),
    };
  } catch (error) {
    console.error('Error getting sharing metrics:', error);
    throw new Error('Failed to retrieve sharing metrics');
  }
}

/**
 * Gets security-focused metrics for monitoring suspicious activity
 */
export async function getSecurityMetrics(timeRange: {
  startDate: Date;
  endDate: Date;
}): Promise<SecurityMetrics> {
  const { startDate, endDate } = timeRange;

  try {
    // Get suspicious IPs (multiple failed attempts)
    const failedAttempts = await QuotationAccess.aggregate([
      {
        $match: {
          accessedAt: { $gte: startDate, $lte: endDate },
          successful: false,
        },
      },
      {
        $group: {
          _id: '$ipAddress',
          failedAttempts: { $sum: 1 },
          lastAttempt: { $max: '$accessedAt' },
        },
      },
      {
        $match: {
          failedAttempts: { $gte: 3 }, // 3 or more failed attempts
        },
      },
      {
        $sort: { failedAttempts: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    const suspiciousIPs = failedAttempts.map(item => ({
      ipAddress: item._id,
      failedAttempts: item.failedAttempts,
      lastAttempt: item.lastAttempt,
    }));

    // Get rate limit stats
    const rateLimitStats = getRateLimitStats();

    // Detect unusual patterns
    const unusualPatterns: Array<{
      pattern: string;
      count: number;
      description: string;
    }> = [];

    // Pattern 1: High verification failure rate
    const totalAttempts = await QuotationAccess.countDocuments({
      accessedAt: { $gte: startDate, $lte: endDate },
    });
    const failedCount = await QuotationAccess.countDocuments({
      accessedAt: { $gte: startDate, $lte: endDate },
      successful: false,
    });

    if (totalAttempts > 0) {
      const failureRate = (failedCount / totalAttempts) * 100;
      if (failureRate > 50) {
        unusualPatterns.push({
          pattern: 'HIGH_FAILURE_RATE',
          count: Math.round(failureRate),
          description: `${Math.round(failureRate)}% of verification attempts failed`,
        });
      }
    }

    // Pattern 2: Rapid successive attempts from same IP
    const rapidAttempts = await QuotationAccess.aggregate(([
      {
        $match: {
          accessedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$ipAddress',
          attempts: { $sum: 1 },
          timeSpan: {
            $subtract: [
              { $max: '$accessedAt' },
              { $min: '$accessedAt' },
            ],
          },
        },
      },
      {
        $match: {
          attempts: { $gte: 5 },
          timeSpan: { $lt: 300000 }, // Less than 5 minutes
        },
      },
    ]) as unknown as PipelineStage[]);

    if (rapidAttempts.length > 0) {
      unusualPatterns.push({
        pattern: 'RAPID_ATTEMPTS',
        count: rapidAttempts.length,
        description: `${rapidAttempts.length} IP(s) made 5+ attempts within 5 minutes`,
      });
    }

    // Pattern 3: Access attempts outside business hours
    const outsideHoursAttempts = await QuotationAccess.countDocuments({
      accessedAt: { $gte: startDate, $lte: endDate },
      $expr: {
        $or: [
          { $lt: [{ $hour: '$accessedAt' }, 8] }, // Before 8 AM
          { $gt: [{ $hour: '$accessedAt' }, 20] }, // After 8 PM
        ],
      },
    });

    if (outsideHoursAttempts > 0 && totalAttempts > 0) {
      const outsideHoursRate = (outsideHoursAttempts / totalAttempts) * 100;
      if (outsideHoursRate > 30) {
        unusualPatterns.push({
          pattern: 'OUTSIDE_HOURS_ACCESS',
          count: outsideHoursAttempts,
          description: `${outsideHoursAttempts} attempts outside business hours (8 AM - 8 PM)`,
        });
      }
    }

    return {
      suspiciousIPs,
      rateLimitStats,
      unusualPatterns,
    };
  } catch (error) {
    console.error('Error getting security metrics:', error);
    throw new Error('Failed to retrieve security metrics');
  }
}

/**
 * Creates an alert for suspicious activity
 */
export async function createSecurityAlert(
  type: 'SUSPICIOUS_IP' | 'HIGH_FAILURE_RATE' | 'RAPID_ATTEMPTS' | 'UNUSUAL_PATTERN',
  details: {
    ipAddress?: string;
    quotationId?: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    // Log security alert
    await ShareAuditLog.create({
      quotationId: details.quotationId || 'SYSTEM',
      action: 'verification_failed', // Reuse existing action for now
      ipAddress: details.ipAddress || 'SYSTEM',
      userAgent: 'SECURITY_MONITOR',
      metadata: {
        alertType: type,
        severity: details.severity,
        description: details.description,
        ...details.metadata,
      },
      timestamp: new Date(),
    });

    // In a production environment, you might want to:
    // - Send email/SMS alerts
    // - Post to Slack/Discord
    // - Trigger automated responses
    // - Update security dashboards

    console.warn(`Security Alert [${type}]: ${details.description}`, {
      severity: details.severity,
      ipAddress: details.ipAddress,
      quotationId: details.quotationId,
      metadata: details.metadata,
    });
  } catch (error) {
    console.error('Error creating security alert:', error);
  }
}

/**
 * Performance monitoring for sharing endpoints
 */
export class SharingPerformanceMonitor {
  private static metrics = new Map<string, Array<{ timestamp: number; duration: number }>>();

  static recordEndpointPerformance(endpoint: string, duration: number): void {
    const key = endpoint;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const endpointMetrics = this.metrics.get(key)!;
    endpointMetrics.push({ timestamp: Date.now(), duration });

    // Keep only last 100 measurements
    if (endpointMetrics.length > 100) {
      endpointMetrics.shift();
    }
  }

  static getEndpointStats(endpoint: string): {
    averageResponseTime: number;
    p95ResponseTime: number;
    requestCount: number;
  } | null {
    const endpointMetrics = this.metrics.get(endpoint);
    if (!endpointMetrics || endpointMetrics.length === 0) {
      return null;
    }

    const durations = endpointMetrics.map(m => m.duration).sort((a, b) => a - b);
    const averageResponseTime = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const p95Index = Math.floor(durations.length * 0.95);
    const p95ResponseTime = durations[p95Index] || durations[durations.length - 1];

    return {
      averageResponseTime: Math.round(averageResponseTime),
      p95ResponseTime: Math.round(p95ResponseTime),
      requestCount: endpointMetrics.length,
    };
  }

  static getAllStats(): Record<string, ReturnType<typeof SharingPerformanceMonitor.getEndpointStats>> {
    const stats: Record<string, ReturnType<typeof SharingPerformanceMonitor.getEndpointStats>> = {};
    
    for (const endpoint of this.metrics.keys()) {
      stats[endpoint] = this.getEndpointStats(endpoint);
    }

    return stats;
  }
}