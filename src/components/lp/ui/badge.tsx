import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Badge variant options for LP trust signals and labels.
 * - default: Neutral gray — generic labels
 * - success: Green-tinted — "Kostenlos", "Verfügbar", positive indicators
 * - trust: Blue-tinted — "Unverbindlich", "Geprüft", credibility signals
 * - highlight: Amber/warm — attention-drawing badges like "Beliebter Standort"
 */
type LPBadgeVariant = "default" | "success" | "trust" | "highlight"

const badgeVariantClasses: Record<LPBadgeVariant, string> = {
  default:
    "bg-muted text-muted-foreground",
  success:
    "bg-success/10 text-success",
  trust:
    "bg-primary/10 text-primary",
  highlight:
    "bg-amber-100 text-amber-800",
}

export interface LPBadgeProps {
  children: React.ReactNode
  className?: string
  /**
   * Visual style variant.
   * @default "default"
   */
  variant?: LPBadgeVariant
  /**
   * Optional icon rendered before the label text.
   * Pass a React node (e.g., a Lucide icon).
   */
  icon?: React.ReactNode
}

/**
 * Trust badge and label component for LP pages.
 *
 * Used for social proof indicators, status labels, and attention-drawing
 * feature highlights. Compact pill shape with optional icon.
 *
 * Server component — no "use client".
 *
 * @example
 * // Trust signal
 * <LPBadge variant="trust">Unverbindlich</LPBadge>
 *
 * // Positive feature
 * <LPBadge variant="success">Kostenloser Service</LPBadge>
 *
 * // Featured location
 * <LPBadge variant="highlight">Beliebter Standort</LPBadge>
 *
 * // With icon
 * <LPBadge variant="trust" icon={<CheckIcon />}>Geprüfte Anbieter</LPBadge>
 */
export function LPBadge({
  children,
  className,
  variant = "default",
  icon,
}: LPBadgeProps) {
  return (
    <span
      data-slot="lp-badge"
      data-variant={variant}
      className={cn(
        // Base: compact pill shape
        "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full",
        // Variant color
        badgeVariantClasses[variant],
        className
      )}
    >
      {icon && (
        <span className="shrink-0 [&_svg]:size-3" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  )
}
