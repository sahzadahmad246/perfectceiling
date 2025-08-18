// app/api/quotations/[id]/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Quotation } from "@/models/Quotation";
// Use puppeteer in dev, puppeteer-core + @sparticuz/chromium in serverless/prod

// Define interfaces for type safety
interface WorkItem {
  description: string;
  area?: string;
  unit?: string;
  rate?: number;
  total: number;
}

interface WorkDetails {
  items: WorkItem[];
  total: number;
  discount: number;
  grandTotal: number;
  notes?: string;
}

interface ClientInfo {
  name: string;
  phone: string;
  address: string;
}

interface QuotationData {
  _id: {
    toString(): string;
  };
  clientInfo: ClientInfo;
  workDetails: WorkDetails;
  status: string;
  createdAt: string;
}

interface BusinessInfo {
  name: string;
  primaryPhone: string;
  secondaryPhone?: string;
  terms?: string[];
  logoUrl?: string;
}

// GET /api/quotations/[id]/pdf - Generate PDF for quotation
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await connectToDatabase();
    
    // Find the quotation
    const quotation = await Quotation.findById(id).lean() as QuotationData | null;
    if (!quotation) {
      return NextResponse.json({ 
        error: "Quotation not found"
      }, { status: 404 });
    }

    // Get business information
    const businessResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/business`);
    const rawBusiness = await businessResponse.json() as Record<string, unknown>;
    const businessInfo: BusinessInfo = {
      name: String(rawBusiness.name || 'Perfect Ceiling'),
      primaryPhone: String(rawBusiness.primaryPhone || rawBusiness.phone || ''),
      secondaryPhone: rawBusiness.secondaryPhone ? String(rawBusiness.secondaryPhone) : undefined,
      terms: Array.isArray(rawBusiness.terms)
        ? (rawBusiness.terms as string[])
        : Array.isArray((rawBusiness as Record<string, unknown>).termsAndConditions as unknown[])
          ? (((rawBusiness as Record<string, unknown>).termsAndConditions as string[]))
          : [],
      logoUrl: rawBusiness.logoUrl ? String(rawBusiness.logoUrl) : undefined,
    };

    // Generate PDF HTML
    const pdfHtml = generateQuotationPDF(quotation, businessInfo);
    
    // Generate PDF using Puppeteer/Chromium
    const isServerless = !!process.env.VERCEL
    let browser: import('puppeteer-core').Browser | import('puppeteer').Browser
    if (isServerless) {
      const { default: chromium } = await import('@sparticuz/chromium')
      const puppeteer = await import('puppeteer-core')
      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      })
    } else {
      const puppeteer = await import('puppeteer')
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
    }
    
    const page = await browser.newPage();
    await page.setContent(pdfHtml, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    
    await browser.close();
    
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation-${quotation._id.toString().slice(-8)}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({
      error: "Failed to generate PDF"
    }, { status: 500 });
  }
}

function generateQuotationPDF(quotation: QuotationData, businessInfo: BusinessInfo): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quotation - ${businessInfo.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { font-family: 'Arial', sans-serif; line-height: 1.5; color: #333; background: #fff; }
        
        .container { max-width: 820px; margin: 12px auto; background:#fff; }
        
        .header { display:flex; align-items:center; gap:16px; padding:16px 20px; border-bottom:2px solid #667eea; }
        .brand-logo { width:48px; height:48px; object-fit:contain; border-radius:6px; }
        .brand-title { font-size:22px; font-weight:700; color:#222; }
        .brand-contact { font-size:12px; color:#555; margin-top:2px; }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .meta-bar { display:flex; justify-content:space-between; padding:10px 20px; background:#fafafa; border-bottom:1px solid #eee; font-size:12px; color:#555; }
        
        .quotation-details { padding: 18px 20px; }
        
        .section { margin-bottom: 18px; }
        
        .section h3 { color:#667eea; border-bottom:1px solid #e6e6ff; padding-bottom:8px; margin-bottom:12px; font-size:16px; }
        
        .customer-info { background:#fafafa; padding:12px; border-radius:6px; border-left:3px solid #667eea; }
        
        .items-table { width:100%; border-collapse:collapse; margin-top:8px; }
        
        .items-table th, .items-table td { padding:8px 10px; text-align:left; border-bottom:1px solid #ddd; }
        
        .items-table th {
            background: #667eea;
            color: white;
            font-weight: 600;
        }
        
        .items-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .items-table tr:hover {
            background: #e9ecef;
        }
        
        .total-section { background:#fafafa; padding:14px; border-radius:6px; margin-top:12px; }
        
        .total-row { display:flex; justify-content:space-between; margin-bottom:6px; padding:4px 0; }
        
        .total-row.grand-total { border-top:2px solid #667eea; padding-top:10px; margin-top:10px; font-size:1.05em; font-weight:bold; color:#667eea; }
        
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.9em;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        
        .status-accepted {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .status-rejected {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .terms { background:#fafafa; padding:12px; border-radius:6px; border-left:3px solid #28a745; }
        
        .terms h4 {
            color: #28a745;
            margin-bottom: 15px;
        }
        
        .terms ul {
            list-style: none;
            padding-left: 0;
        }
        
        .terms li {
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        
        .terms li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #28a745;
            font-weight: bold;
        }
        
        .footer { text-align:center; padding:14px; margin-top:16px; color:#777; font-size:12px; }
        
        @media print {
            body {
                background: white;
            }
            
            .container {
                box-shadow: none;
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
          ${businessInfo.logoUrl ? `<img class="brand-logo" src="${businessInfo.logoUrl}" alt="${businessInfo.name} logo" />` : ''}
          <div>
            <div class="brand-title">${businessInfo.name}</div>
            <div class="brand-contact">${businessInfo.primaryPhone}${businessInfo.secondaryPhone ? ` | ${businessInfo.secondaryPhone}` : ''}</div>
          </div>
        </div>
        <div class="meta-bar"><div>Quotation #${quotation._id.toString().slice(-8)}</div><div>Date: ${formatDate(quotation.createdAt)}</div><div>Status: ${quotation.status}</div></div>
        
        <!-- Quotation Details -->
        <div class="quotation-details">
            <!-- Quotation Info condensed into header/meta-bar -->
            
            <!-- Customer Information -->
            <div class="section">
                <h3>Customer Details</h3>
                <div class="customer-info">
                    <div style="margin-bottom: 10px;">
                        <strong>Name:</strong> ${quotation.clientInfo.name}
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong>Phone:</strong> ${quotation.clientInfo.phone}
                    </div>
                    <div>
                        <strong>Address:</strong> ${quotation.clientInfo.address}
                    </div>
                </div>
            </div>
            
            <!-- Work Items -->
            <div class="section">
                <h3>Work Details</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Area</th>
                            <th>Unit</th>
                            <th>Rate</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quotation.workDetails.items.map((item: WorkItem) => `
                            <tr>
                                <td>${item.description}</td>
                                <td>${item.area || '-'}</td>
                                <td>${item.unit || '-'}</td>
                                <td>${item.rate ? formatCurrency(item.rate) : '-'}</td>
                                <td>${formatCurrency(item.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <!-- Total Section -->
                <div class="total-section">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(quotation.workDetails.total)}</span>
                    </div>
                    ${quotation.workDetails.discount > 0 ? `
                        <div class="total-row">
                            <span>Discount:</span>
                            <span>-${formatCurrency(quotation.workDetails.discount)}</span>
                        </div>
                    ` : ''}
                    <div class="total-row grand-total">
                        <span>Grand Total:</span>
                        <span>${formatCurrency(quotation.workDetails.grandTotal)}</span>
                    </div>
                </div>
                
                ${quotation.workDetails.notes ? `
                    <div style="margin-top: 20px;">
                        <h4 style="color: #667eea; margin-bottom: 10px;">Additional Notes:</h4>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
                            ${quotation.workDetails.notes}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <!-- Terms and Conditions -->
            ${businessInfo.terms && businessInfo.terms.length > 0 ? `
                <div class="section">
                    <h3>Terms & Conditions</h3>
                    <div class="terms">
                        <ul>
                            ${businessInfo.terms.map((term: string) => `<li>${term}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            ` : ''}
        </div>
        
        <!-- Footer -->
        <div class="footer"><p><strong>${businessInfo.name}</strong></p><p>Thank you for choosing us. We look forward to working with you!</p></div>
    </div>
    
    <script>
        // Auto-print functionality for PDF generation
        window.onload = function() {
            if (window.location.search.includes('print=true')) {
                window.print();
            }
        }
    </script>
</body>
</html>`;
}