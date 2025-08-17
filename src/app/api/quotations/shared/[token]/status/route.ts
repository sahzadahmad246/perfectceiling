// app/api/quotations/shared/[token]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Quotation } from "@/models/Quotation";
import { ShareAuditLog } from "@/models/ShareAuditLog";
import { isValidTokenFormat } from "@/lib/sharing/tokenService";
import { checkRateLimit } from "@/lib/sharing/rateLimiter";
import type { ErrorResponse } from "@/types/quotation";

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

// POST /api/quotations/shared/[token]/status - Update quotation status by customer
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
    let body: { status: "accepted" | "rejected"; customerNote?: string };
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

    if (!body.status || !["accepted", "rejected"].includes(body.status)) {
      const errorResponse: ErrorResponse = {
        error: "Invalid status",
        code: "SERVER_ERROR",
        details: "Status must be 'accepted' or 'rejected'"
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

    // Check if quotation is still pending
    if (quotation.status !== "pending") {
      const errorResponse: ErrorResponse = {
        error: "Quotation already processed",
        code: "INVALID_QUOTATION",
        details: `This quotation has already been ${quotation.status}`
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Update quotation status
    quotation.status = body.status;
    if (body.customerNote) {
      quotation.customerNote = body.customerNote;
      if (body.status === 'rejected') {
        quotation.rejectionReason = body.customerNote.replace('Quotation rejected: ', '');
      }
    }
    await quotation.save();

    // Log the status change
    await ShareAuditLog.create({
      quotationId: quotation._id.toString(),
      action: 'accessed',
      ipAddress: clientIP,
      userAgent,
      metadata: {
        statusChange: body.status,
        customerNote: body.customerNote,
        previousStatus: 'pending'
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Quotation ${body.status} successfully`,
      status: body.status
    });

  } catch (error) {
    console.error('Error updating quotation status:', error);
    const errorResponse: ErrorResponse = {
      error: "Internal server error",
      code: "SERVER_ERROR"
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}