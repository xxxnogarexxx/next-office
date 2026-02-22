import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Conversion-optimized button system for LP pages.
 *
 * Built independently from the main site's shadcn Button —
 * LP buttons are specialized for funneling attention to inquiry forms,
 * with conversion-focused variants (prominent CTAs, appropriate touch targets).
 *
 * German aria-labels are used where applicable.
 */
export const lpButtonVariants = cva(
  // Base styles: consistent across all LP button variants
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
  {
    variants: {
      variant: {
        /**
         * Primary CTA — main conversion button.
         * Use for: "Jetzt anfragen", "Kostenlos beraten lassen", primary form submits.
         */
        primary:
          "bg-accent-blue text-white hover:bg-accent-blue-hover shadow-sm hover:shadow-md active:shadow-none",

        /**
         * Secondary action — supporting paths.
         * Use for: "Mehr erfahren", secondary navigation within LP.
         */
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",

        /**
         * Ghost / tertiary — low-emphasis action.
         * Use for: navigation-like actions, "Zurück", dismissals.
         */
        ghost:
          "bg-transparent text-foreground hover:bg-secondary hover:text-foreground",

        /**
         * CTA — high-emphasis conversion button.
         * Same palette as primary but larger padding + shadow + idle pulse animation.
         * Use for: sticky CTAs, hero primary actions.
         */
        cta:
          "bg-accent-blue text-white hover:bg-accent-blue-hover shadow-md hover:shadow-lg active:shadow-sm animate-cta-idle",
      },

      size: {
        /** Small — in-line or compact contexts */
        sm: "h-8 min-h-[44px] px-3 text-sm md:min-h-0",
        /** Default — most use cases */
        default: "h-10 min-h-[44px] px-5 text-sm md:min-h-0",
        /** Large — section CTAs, card footers */
        lg: "h-12 min-h-[44px] px-8 text-base",
        /** XL — hero primary CTA */
        xl: "h-14 min-h-[44px] px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface LPButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof lpButtonVariants> {
  /**
   * When true, renders as a Slot (passes all props to the child element).
   * Useful for rendering as an <a> or Next.js <Link>.
   */
  asChild?: boolean
}

/**
 * Conversion-optimized button for LP pages.
 *
 * @example
 * // Primary CTA
 * <LPButton variant="primary" size="xl">Jetzt anfragen</LPButton>
 *
 * // Sticky CTA with high emphasis
 * <LPButton variant="cta" size="lg">Kostenlos beraten lassen</LPButton>
 *
 * // Render as Next.js Link
 * <LPButton asChild variant="secondary"><Link href="/datenschutz">Datenschutz</Link></LPButton>
 */
export function LPButton({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  ...props
}: LPButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="lp-button"
      data-variant={variant}
      data-size={size}
      className={cn(lpButtonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
