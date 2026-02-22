/**
 * LP UI Component Library
 *
 * Barrel export for all shared LP UI primitives.
 * Import from this path for clean usage in variant pages:
 *
 * @example
 * import { LPButton, Section, LPCard, LPCardHeader, LPCardContent, LPBadge, FormField } from "@/components/lp/ui"
 */

export { LPButton, lpButtonVariants } from "./lp-button"
export type { LPButtonProps } from "./lp-button"

export { Section } from "./section"
export type { SectionProps } from "./section"

export { LPCard, LPCardHeader, LPCardContent } from "./lp-card"
export type { LPCardProps, LPCardHeaderProps, LPCardContentProps } from "./lp-card"

export { LPBadge } from "./badge"
export type { LPBadgeProps } from "./badge"

export { FormField } from "./form-field"
export type { FormFieldProps, SelectOption } from "./form-field"
