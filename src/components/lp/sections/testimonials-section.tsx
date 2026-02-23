import { Section, LPCard, LPCardContent, LPBadge } from "@/components/lp/ui"
import { testimonials } from "@/lib/lp/social-proof-data"

/**
 * TestimonialsSectionProps
 */
export interface TestimonialsSectionProps {
  className?: string
}

/**
 * Three-column testimonial section displaying client quotes, attribution, and company context.
 *
 * Addresses the "why should I trust you?" objection with emotional, first-person
 * social proof from distinct company types and cities. Combines a large decorative
 * quotation mark, quote text, attribution, company type badge, and city tag.
 *
 * Server component — no "use client".
 *
 * @example
 * <TestimonialsSection />
 */
export function TestimonialsSection({ className }: TestimonialsSectionProps) {
  return (
    <Section background="white" className={className}>
      {/* Section heading */}
      <div className="mb-10 text-center sm:mb-12">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
          Kundenstimmen
        </p>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Das sagen unsere Kunden
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Über 500 Teams haben mit NextOffice ihr passendes Büro gefunden —
          in Berlin, Hamburg, München und Frankfurt.
        </p>
      </div>

      {/* Testimonial grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <LPCard
            key={testimonial.name}
            variant="bordered"
            className="flex flex-col"
          >
            <LPCardContent className="flex flex-1 flex-col gap-4 p-6">
              {/* Decorative opening quote */}
              <span
                className="block text-5xl font-serif leading-none text-primary/20 select-none"
                aria-hidden="true"
              >
                &ldquo;
              </span>

              {/* Quote text */}
              <blockquote className="-mt-3 flex-1 text-base italic leading-relaxed text-foreground">
                {testimonial.quote}
              </blockquote>

              {/* Attribution */}
              <footer className="mt-2 flex flex-col gap-2">
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Company type badge */}
                  <LPBadge variant="default">{testimonial.companyType}</LPBadge>

                  {/* City tag */}
                  <span className="text-xs text-muted-foreground">
                    Büro in {testimonial.city}
                  </span>
                </div>
              </footer>
            </LPCardContent>
          </LPCard>
        ))}
      </div>
    </Section>
  )
}
