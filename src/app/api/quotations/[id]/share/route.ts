// app/api/quotations/[id]/share/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/db";
import { Quotation } from "@/models/Quotation";
import { ShareAuditLog } from "@/models/ShareAuditLog";
import { generateShareToken } from "@/lib/sharing/tokenService";
import type { ShareUrlResponse, ShareStatusResponse } from "@/types/quotation";

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
  action: "shared" | "revoked",
  userId: string,
  ipAddress: string,
  userAgent: string,
  metadata?: Record<string, unknownS>
) {
  try {
    await ShareAuditLog.create({
      quotationId,
      action,
      userId,
      ipAddress,
      userAgent,
      metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

// POST /api/quotations/[id]/share - Generate or retrieve share URL
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Check authentication and authorization
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    
    // Find the quotation
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return NextResponse.json({ 
        error: "Quotation not found",
        code: "NOT_FOUND"
      }, { status: 404 });
    }

    // Validate that quotation has a phone number
    if (!quotation.clientInfo.phone || quotation.clientInfo.phone.trim() === '') {
      return NextResponse.json({
        error: "Cannot share quotation without customer phone number",
        code: "INVALID_QUOTATION",
        details: "Phone number is required for secure sharing"
      }, { status: 400 });
    }

    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Check if already shared
    if (quotation.sharing?.isShared && quotation.sharing?.shareToken) {
      // Return existing share URL
      const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/quotations/shared/${quotation.sharing.shareToken}`;
      
      const response: ShareUrlResponse = {
        success: true,
        shareUrl,
        token: quotation.sharing.shareToken,
      };

      return NextResponse.json(response);
    }

    // Generate new share token
    const shareToken = generateShareToken();
    
    // Update quotation with sharing information
    if (!quotation.sharing) {
      quotation.sharing = {
        isShared: false,
        shareToken: null,
        sharedAt: null,
        sharedBy: null,
        accessCount: 0,
        lastAccessedAt: null,
      };
    }
    
    quotation.sharing.isShared = true;
    quotation.sharing.shareToken = shareToken;
    quotation.sharing.sharedAt = new Date();
    quotation.sharing.sharedBy = session.user.id;
    quotation.sharing.accessCount = 0;
    quotation.sharing.lastAccessedAt = null;

    await quotation.save();

    // Log audit event
    await logAuditEvent(
      id,
      'shared',
      session.user.id,
      clientIP,
      userAgent,
      {
        quotationClientName: quotation.clientInfo.name,
        quotationAmount: quotation.workDetails.grandTotal,
      }
    );

    // Generate share URL
    const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/quotations/shared/${shareToken}`;

    const response: ShareUrlResponse = {
      success: true,
      shareUrl,
      token: shareToken,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating share URL:', error);
    return NextResponse.json({
      error: "Internal server error",
      code: "SERVER_ERROR"
    }, { status: 500 });
  }
}

// DELETE /api/quotations/[id]/share - Revoke share access
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Check authentication and authorization
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    
    // Find the quotation
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return NextResponse.json({ 
        error: "Quotation not found",
        code: "NOT_FOUND"
      }, { status: 404 });
    }

    // Check if currently shared
    if (!quotation.sharing?.isShared) {
      return NextResponse.json({
        error: "Quotation is not currently shared",
        code: "NOT_SHARED"
      }, { status: 400 });
    }

    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Revoke sharing
    if (!quotation.sharing) {
      quotation.sharing = {
        isShared: false,
        shareToken: null,
        sharedAt: null,
        sharedBy: null,
        accessCount: 0,
        lastAccessedAt: null,
      };
    } else {
      quotation.sharing.isShared = false;
      quotation.sharing.shareToken = null;
      quotation.sharing.sharedAt = null;
      quotation.sharing.sharedBy = null;
      quotation.sharing.accessCount = 0;
      quotation.sharing.lastAccessedAt = null;
    }

    await quotation.save();

    // Log audit event
    await logAuditEvent(
      id,
      'revoked',
      session.user.id,
      clientIP,
      userAgent,
      {
        quotationClientName: quotation.clientInfo.name,
      }
    );

    return NextResponse.json({ 
      success: true,
      message: "Share access revoked successfully"
    });

  } catch (error) {
    console.error('Error revoking share access:', error);
    return NextResponse.json({
      error: "Internal server error",
      code: "SERVER_ERROR"
    }, { status: 500 });
  }
}

// GET /api/quotations/[id]/share - Get share status
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    // Check authentication and authorization
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    
    // Find the quotation
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return NextResponse.json({ 
        error: "Quotation not found",
        code: "NOT_FOUND"
      }, { status: 404 });
    }

    const response: ShareStatusResponse = {
      isShared: quotation.sharing?.isShared || false,
      accessCount: quotation.sharing?.accessCount || 0,
    };

    if (quotation.sharing?.isShared) {
      response.shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/quotations/shared/${quotation.sharing.shareToken}`;
      response.sharedAt = quotation.sharing.sharedAt?.toISOString() || undefined;
      response.sharedBy = quotation.sharing.sharedBy || undefined;
      response.lastAccessedAt = quotation.sharing.lastAccessedAt?.toISOString() || undefined;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error getting share status:', error);
    return NextResponse.json({
      error: "Internal server error",
      code: "SERVER_ERROR"
    }, { status: 500 });
  }
}