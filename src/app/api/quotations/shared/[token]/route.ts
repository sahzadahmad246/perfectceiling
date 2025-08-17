import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Quotation, IQuotation } from "@/models/Quotation";
import { isValidTokenFormat } from "@/lib/sharing/tokenService";
import { checkRateLimit } from "@/lib/sharing/rateLimiter";
import {
  withPerformanceMonitoring,
  DatabasePerformanceMonitor,
} from "@/lib/sharing/performanceMiddleware";
import { quotationCache } from "@/lib/sharing/cache";
import type { ErrorResponse } from "@/types/quotation";

// Helper function to get client IP address
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");
  const remoteAddr = req.headers.get("x-vercel-forwarded-for");

  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIP) return realIP;
  if (remoteAddr) return remoteAddr;
  return "unknown";
}

// GET /api/quotations/shared/[token] - Validate token and return verification form data
async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const clientIP = getClientIP(req);

    // Validate token format
    if (!isValidTokenFormat(token)) {
      const errorResponse: ErrorResponse = {
        error: "Invalid share link",
        code: "INVALID_TOKEN",
        details: "This link is not valid or has been corrupted",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check rate limiting
    const rateLimitStatus = checkRateLimit(clientIP, token);
    if (rateLimitStatus.isBlocked) {
      const errorResponse: ErrorResponse = {
        error: "Too many attempts",
        code: "RATE_LIMITED",
        details: "Please try again later",
        remainingAttempts: 0,
      };
      return NextResponse.json(errorResponse, { status: 429 });
    }

    await connectToDatabase();

    // Try to get from cache first
    const cachedQuotation = quotationCache.get(token);
    let quotation;

    if (cachedQuotation) {
      quotation = cachedQuotation;
    } else {
      // Find quotation by share token with performance monitoring
      const dbQuotation = (await DatabasePerformanceMonitor.monitorQuery(
        "findQuotationByToken",
        () =>
          Quotation.findOne({
            "sharing.shareToken": token,
            "sharing.isShared": true,
          }).lean()
      )) as IQuotation | null;

      if (dbQuotation) {
        quotation = {
          id: dbQuotation._id.toString(),
          clientInfo: dbQuotation.clientInfo,
          workDetails: {
            items: dbQuotation.workDetails.items.map((item) => ({
              description: item.description,
              area: item.area ?? 0, // default 0 if undefined
              unit: item.unit ?? "sqft", // default "sqft" if undefined
              rate: item.rate ?? 0, // default 0 if undefined
              total: item.total,
            })),
            total: dbQuotation.workDetails.total,
            discount: dbQuotation.workDetails.discount,
            grandTotal: dbQuotation.workDetails.grandTotal,
            notes: dbQuotation.workDetails.notes ?? "", // default empty string
          },
          status: dbQuotation.status,
          createdAt: dbQuotation.createdAt.toISOString(),
          updatedAt: dbQuotation.updatedAt.toISOString(),
        };
        quotationCache.set(token, quotation); // now type matches QuotationListItem
      }
    }

    if (!quotation) {
      const errorResponse: ErrorResponse = {
        error: "Quotation not found",
        code: "NOT_FOUND",
        details: "This link is no longer valid or has been revoked",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Return verification form data (without sensitive quotation details)
    return NextResponse.json({
      success: true,
      requiresVerification: true,
      clientName: quotation.clientInfo.name,
      remainingAttempts: rateLimitStatus.remainingAttempts,
    });
  } catch (error) {
    console.error("Error validating share token:", error);
    const errorResponse: ErrorResponse = {
      error: "Internal server error",
      code: "SERVER_ERROR",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Export with performance monitoring
export const GET = withPerformanceMonitoring(
  getHandler,
  "shared_quotation_validate"
);
