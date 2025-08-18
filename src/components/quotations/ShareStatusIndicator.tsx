"use client"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Share, Eye, Clock } from "lucide-react"
import type { QuotationWithSharing } from "@/types/quotation"

interface ShareStatusIndicatorProps {
  quotation: QuotationWithSharing
  showDetails?: boolean
  className?: string
}

export function ShareStatusIndicator({
  quotation,
  showDetails = false,
  className = ""
}: ShareStatusIndicatorProps) {
  const { sharing } = quotation

  if (!sharing?.isShared) {
    return null
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatAccessCount = (count: number) => {
    if (count === 0) return "No views"
    if (count === 1) return "1 view"
    return `${count} views`
  }

  if (showDetails) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center space-x-2">
          <Badge
            className="bg-green-400/20 text-green-100 border-green-300/30 border font-medium rounded-full px-3 py-1 backdrop-blur-xl"
            style={{ filter: "url(#glass-crystal)" }}
          >
            <Share className="h-3 w-3 mr-1" />
            Shared
          </Badge>
          <span className="text-white/70 text-sm">
            {formatAccessCount(sharing.accessCount)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/60">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Shared: {formatDate(sharing.sharedAt)}</span>
          </div>
          {sharing.lastAccessedAt && (
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>Last viewed: {formatDate(sharing.lastAccessedAt)}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={`bg-green-400/20 text-green-100 border-green-300/30 border font-medium rounded-full px-3 py-1 backdrop-blur-xl cursor-help ${className}`}
            style={{ filter: "url(#glass-crystal)" }}
          >
            <Share className="h-3 w-3 mr-1" />
            Shared
          </Badge>
        </TooltipTrigger>
        <TooltipContent
          className="bg-white/10 border-white/20 backdrop-blur-xl rounded-xl text-white"
          style={{ filter: "url(#glass-frosted)" }}
        >
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <Eye className="h-3 w-3" />
              <span>{formatAccessCount(sharing.accessCount)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3" />
              <span>Shared {formatDate(sharing.sharedAt)}</span>
            </div>
            {sharing.lastAccessedAt && (
              <div className="flex items-center space-x-2">
                <Eye className="h-3 w-3" />
                <span>Last viewed {formatDate(sharing.lastAccessedAt)}</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}