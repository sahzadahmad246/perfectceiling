// app/api/quotations/shared/[token]/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Quotation } from "@/models/Quotation";
import { ShareAuditLog } from "@/models/ShareAuditLog";
import { QuotationAccess } from "@/models/QuotationAccess";
import { isValidTokenFormat } from "@/lib/sharing/tokenService";
import { verifyPhoneDigits, validatePhoneDigitsInput } from "@/lib/sharing/phoneVerification";
import { checkRateLimit, recordFailedAttempt, recordSuccessfulAttempt } from "@/lib/sharing/rateLimiter";
import type { VerificationRequest, VerificationResponse, ErrorResponse } from "@/types/quotation";

// Helper function to get client IP address
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const remoteAddr = req.headers.get('x-vercel-forwarded-for');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (remoteAddr) {
    return remoteAddr;
  }
  return 'unknown';
}

// Helper function to log audit events
async function logAuditEvent(
  quotationId: string,
  action: "accessed" | "verification_failed",
  ipAddress: string,
  userAgent: string,
  metadata?: Record<string, unknown>
) {
  try {
    await ShareAuditLog.create({
      quotationId,
      action,
      ipAddress,
      userAgent,
      metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

// Helper function to log access attempts
async function logAccessAttempt(
  quotationId: string,
  ipAddress: string,
  userAgent: string,
  successful: boolean,
  verificationAttempts: number = 1
) {
  try {
    await QuotationAccess.create({
      quotationId,
      ipAddress,
      userAgent,
      accessedAt: new Date(),
      verificationAttempts,
      successful,
    });
  } catch (error) {
    console.error('Failed to log access attempt:', error);
  }
}

// POST /api/quotations/shared/[token]/verify - Verify phone digits and return quotation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Validate token format
    if (!isValidTokenFormat(token)) {
      const errorResponse: ErrorResponse = {
        error: "Invalid share link",
        code: "INVALID_TOKEN",
        details: "This link is not valid or has been corrupted"
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
        remainingAttempts: 0
      };
      return NextResponse.json(errorResponse, { status: 429 });
    }

    // Parse request body
    let body: VerificationRequest;
    try {
      body = await req.json();
    } catch  {
      const errorResponse: ErrorResponse = {
        error: "Invalid request format",
        code: "SERVER_ERROR",
        details: "Request body must be valid JSON"
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate phone digits input
    const validation = validatePhoneDigitsInput(body.phoneDigits);
    if (!validation.isValid) {
      const rateLimitUpdate = recordFailedAttempt(clientIP, token);
      
      const errorResponse: VerificationResponse = {
        success: false,
        error: validation.error,
        remainingAttempts: rateLimitUpdate.remainingAttempts
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    await connectToDatabase();

    // Find quotation by share token
    const quotation = await Quotation.findOne({
      'sharing.shareToken': token,
      'sharing.isShared': true
    });

    if (!quotation) {
      const errorResponse: ErrorResponse = {
        error: "Quotation not found",
        code: "NOT_FOUND",
        details: "This link is no longer valid or has been revoked"
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Verify phone digits
    const isPhoneValid = verifyPhoneDigits(validation.sanitized!, quotation.clientInfo.phone);

    if (!isPhoneValid) {
      // Record failed attempt
      const rateLimitUpdate = recordFailedAttempt(clientIP, token);
      
      // Log failed verification
      await logAuditEvent(
        quotation._id.toString(),
        'verification_failed',
        clientIP,
        userAgent,
        {
          providedDigits: validation.sanitized,
          remainingAttempts: rateLimitUpdate.remainingAttempts
        }
      );

      await logAccessAttempt(
        quotation._id.toString(),
        clientIP,
        userAgent,
        false,
        1
      );

      const errorResponse: VerificationResponse = {
        success: false,
        error: "Phone number doesn't match our records",
        remainingAttempts: rateLimitUpdate.remainingAttempts
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Verification successful - record success and reset rate limiting
    recordSuccessfulAttempt(clientIP, token);

    // Update quotation access statistics
    if (!quotation.sharing) {
      quotation.sharing = {
        isShared: true,
        shareToken: token,
        sharedAt: new Date(),
        sharedBy: null,
        accessCount: 0,
        lastAccessedAt: null,
      };
    }
    quotation.sharing.accessCount += 1;
    quotation.sharing.lastAccessedAt = new Date();
    await quotation.save();

    // Log successful access
    await logAuditEvent(
      quotation._id.toString(),
      'accessed',
      clientIP,
      userAgent,
      {
        clientName: quotation.clientInfo.name,
        accessCount: quotation.sharing?.accessCount || 1
      }
    );

    await logAccessAttempt(
      quotation._id.toString(),
      clientIP,
      userAgent,
      true,
      1
    );

    // Return quotation data (customer-friendly format)
    const response: VerificationResponse = {
      success: true,
      quotation: {
        id: quotation._id.toString(),
        clientInfo: {
          name: quotation.clientInfo.name,
          phone: quotation.clientInfo.phone,
          address: quotation.clientInfo.address,
        },
        workDetails: {
          items: quotation.workDetails.items,
          total: quotation.workDetails.total,
          discount: quotation.workDetails.discount,
          grandTotal: quotation.workDetails.grandTotal,
          notes: quotation.workDetails.notes || '',
        },
        status: quotation.status,
        createdAt: quotation.createdAt.toISOString(),
        updatedAt: quotation.updatedAt.toISOString(),
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error verifying phone digits:', error);
    const errorResponse: ErrorResponse = {
      error: "Internal server error",
      code: "SERVER_ERROR"
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}