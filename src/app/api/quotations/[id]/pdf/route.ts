// app/api/quotations/[id]/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Quotation } from "@/models/Quotation";
import puppeteer from 'puppeteer';

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
  phone: string;
  email: string;
  website: string;
  address: string;
  gst?: string;
  termsAndConditions?: string[];
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
    const businessResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/business`);
    const businessInfo = await businessResponse.json() as BusinessInfo;

    // Generate PDF HTML
    const pdfHtml = generateQuotationPDF(quotation, businessInfo);
    
    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
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
    
    // Convert Buffer to ArrayBuffer for NextResponse
    const arrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    );
    
    return new NextResponse(arrayBuffer, {
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
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }
        
        .container {
            max-width: 800px;
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .business-info {
            background: #f8f9fa;
            padding: 20px 30px;
            border-bottom: 3px solid #667eea;
        }
        
        .business-info h2 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .info-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .info-item strong {
            min-width: 80px;
            color: #555;
        }
        
        .quotation-details {
            padding: 30px;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section h3 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 1.2em;
        }
        
        .customer-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        
        .items-table th,
        .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
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
        
        .total-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
        }
        
        .total-row.grand-total {
            border-top: 2px solid #667eea;
            padding-top: 15px;
            margin-top: 15px;
            font-size: 1.2em;
            font-weight: bold;
            color: #667eea;
        }
        
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
        
        .terms {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #28a745;
        }
        
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
        
        .footer {
            background: #343a40;
            color: white;
            text-align: center;
            padding: 20px;
            margin-top: 30px;
        }
        
        .footer p {
            margin-bottom: 5px;
        }
        
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
        <!-- Header -->
        <div class="header">
            <h1>${businessInfo.name}</h1>
            <p>Professional Quotation</p>
        </div>
        
        <!-- Business Information -->
        <div class="business-info">
            <h2>Contact Information</h2>
            <div class="info-grid">
                <div>
                    <div class="info-item">
                        <strong>Phone:</strong> ${businessInfo.phone}
                    </div>
                    <div class="info-item">
                        <strong>Email:</strong> ${businessInfo.email}
                    </div>
                    ${businessInfo.gst ? `<div class="info-item"><strong>GST:</strong> ${businessInfo.gst}</div>` : ''}
                </div>
                <div>
                    <div class="info-item">
                        <strong>Website:</strong> ${businessInfo.website}
                    </div>
                    <div class="info-item">
                        <strong>Address:</strong> ${businessInfo.address}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Quotation Details -->
        <div class="quotation-details">
            <!-- Quotation Info -->
            <div class="section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h2 style="color: #667eea; margin-bottom: 5px;">Quotation #${quotation._id.toString().slice(-8)}</h2>
                        <p style="color: #666;">Date: ${formatDate(quotation.createdAt)}</p>
                    </div>
                    <div>
                        <span class="status-badge status-${quotation.status}">${quotation.status}</span>
                    </div>
                </div>
            </div>
            
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
            ${businessInfo.termsAndConditions && businessInfo.termsAndConditions.length > 0 ? `
                <div class="section">
                    <h3>Terms & Conditions</h3>
                    <div class="terms">
                        <ul>
                            ${businessInfo.termsAndConditions.map((term: string) => `<li>${term}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            ` : ''}
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>${businessInfo.name}</strong></p>
            <p>${businessInfo.phone} | ${businessInfo.email}</p>
            <p style="margin-top: 10px; font-size: 0.9em; opacity: 0.8;">
                Thank you for choosing ${businessInfo.name}. We look forward to working with you!
            </p>
        </div>
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