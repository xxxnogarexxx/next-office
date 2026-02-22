import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card variant options for LP pages.
 * - default: White background, subtle border, hover shadow
 * - elevated: White background, visible shadow, larger hover shadow
 * - bordered: White background, prominent border (border-2), no shadow
 * - flat: Surface/transparent background, no border, no shadow (for inline blocks)
 */
type LPCardVariant = "default" | "elevated" | "bordered" | "flat"

const cardVariantClasses: Record<LPCardVariant, string> = {
  default:
    "bg-white border border-border shadow-sm hover:shadow-md",
  elevated:
    "bg-white shadow-md hover:shadow-xl",
  bordered:
    "bg-white border-2 border-border",
  flat:
    "bg-surface",
}

export interface LPCardProps {
  children: React.ReactNode
  className?: string
  /**
   * Visual style variant.
   * @default "default"
   */
  variant?: LPCardVariant
}

/**
 * Card container for LP content blocks, testimonials, and feature highlights.
 *
 * Uses compound component pattern with LPCardHeader and LPCardContent.
 *
 * Server component — no "use client".
 *
 * @example
 * <LPCard variant="elevated">
 *   <LPCardHeader>
 *     <h3>Büros in Berlin</h3>
 *   </LPCardHeader>
 *   <LPCardContent>
 *     <p>300+ Büros verfügbar</p>
 *   </LPCardContent>
 * </LPCard>
 */
export function LPCard({ children, className, variant = "default" }: LPCardProps) {
  return (
    <div
      data-slot="lp-card"
      data-variant={variant}
      className={cn(
        // Base styles
        "rounded-xl overflow-hidden transition-shadow duration-200",
        // Variant-specific styles
        cardVariantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  )
}

export interface LPCardHeaderProps {
  children: React.ReactNode
  className?: string
}

/**
 * Optional header area within an LPCard.
 * Typically contains a title, eyebrow label, or key metric.
 */
export function LPCardHeader({ children, className }: LPCardHeaderProps) {
  return (
    <div
      data-slot="lp-card-header"
      className={cn("p-4 sm:p-6 pb-0", className)}
    >
      {children}
    </div>
  )
}

export interface LPCardContentProps {
  children: React.ReactNode
  className?: string
}

/**
 * Body content area within an LPCard.
 * Provides consistent padding for card body copy.
 */
export function LPCardContent({ children, className }: LPCardContentProps) {
  return (
    <div
      data-slot="lp-card-content"
      className={cn("p-4 sm:p-6", className)}
    >
      {children}
    </div>
  )
}
