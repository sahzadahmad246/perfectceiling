"use client"

import { toast } from "sonner"

export async function downloadQuotationPdf(quotationId: string, fileName?: string): Promise<void> {
  try {
    const response = await fetch(`/api/quotations/${quotationId}/pdf`)
    if (!response.ok) throw new Error("Failed to generate PDF")

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.style.display = "none"
    a.href = url
    a.download = fileName || `quotation-${quotationId.slice(-8)}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("PDF downloaded successfully")
  } catch (error) {
    toast.error((error as Error).message || "Failed to download PDF")
    throw error
  }
}

export function useDownloadQuotationPdf() {
  let isDownloading = false
  const startDownload = async (quotationId: string, fileName?: string, onState?: (downloading: boolean) => void) => {
    try {
      isDownloading = true
      onState?.(true)
      await downloadQuotationPdf(quotationId, fileName)
    } finally {
      isDownloading = false
      onState?.(false)
    }
  }
  return { startDownload, isDownloading }
}


