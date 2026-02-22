import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Background options for LP sections.
 * - white: Default white background
 * - surface: Slate surface (#F8FAFC) for alternating sections
 * - dark: Dark foreground background for high-contrast contrast sections
 */
type SectionBackground = "white" | "surface" | "dark"

export interface SectionProps {
  children: React.ReactNode
  className?: string
  /**
   * Section background variant.
   * Alternating backgrounds are composed by the parent LP variant, not auto-assigned here.
   * @default "white"
   */
  background?: SectionBackground
  /**
   * HTML id for anchor navigation (e.g., smooth-scroll CTAs).
   */
  id?: string
  /**
   * When true, constrains the inner max-width to max-w-3xl for text-heavy
   * sections like FAQ or policy content.
   * @default false
   */
  narrow?: boolean
}

const backgroundClasses: Record<SectionBackground, string> = {
  white: "bg-background",
  surface: "bg-surface",
  dark: "bg-foreground text-white",
}

/**
 * Section wrapper for LP pages.
 *
 * Provides consistent horizontal and vertical padding, max-width container,
 * and background variants. Mobile-first: reduced padding on small screens.
 *
 * Server component — no "use client".
 *
 * @example
 * <Section background="surface" id="so-gehts">
 *   <h2>So funktioniert's</h2>
 * </Section>
 *
 * <Section narrow>
 *   <FAQ items={faqItems} />
 * </Section>
 */
export function Section({
  children,
  className,
  background = "white",
  id,
  narrow = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        // Background
        backgroundClasses[background],
        // Vertical padding: compact on mobile, generous on desktop
        "py-12 sm:py-16 lg:py-20",
        // Horizontal padding
        "px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto w-full",
          // Narrow mode for text-heavy sections (FAQ, terms, etc.)
          narrow ? "max-w-3xl" : "max-w-7xl"
        )}
      >
        {children}
      </div>
    </section>
  )
}
