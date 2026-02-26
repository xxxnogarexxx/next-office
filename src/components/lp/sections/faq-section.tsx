"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { Section } from "@/components/lp/ui/section"
import { faqItems } from "@/lib/lp/content-data"

/**
 * FAQSection — Häufige Fragen (accordion)
 *
 * Renders all FAQ items from content-data.ts as an accessible accordion.
 * Only one item is open at a time. Includes FAQPage JSON-LD structured
 * data for Google rich snippet eligibility.
 *
 * "use client" — uses useState for accordion toggle state.
 */

interface FAQSectionProps {
  className?: string
}

export function FAQSection({ className }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  // FAQPage structured data for SEO (Google FAQ rich snippets)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  return (
    <Section background="white" narrow id="faq" className={className}>
      {/* FAQPage structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Section heading */}
      <div className="text-center mb-10 lg:mb-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
          Fragen & Antworten
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
          Häufige Fragen
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          Alles, was Sie vor Ihrer Anfrage wissen möchten.
        </p>
      </div>

      {/* FAQ accordion */}
      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index

          return (
            <div key={index} className="bg-background">
              {/* Question button */}
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
                onClick={() => toggle(index)}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left hover:bg-surface transition-colors duration-150"
              >
                <span className="font-semibold text-foreground text-sm sm:text-base leading-snug">
                  {item.question}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={[
                    "mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                    isOpen ? "rotate-180" : "rotate-0",
                  ].join(" ")}
                />
              </button>

              {/* Answer panel */}
              <div
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                hidden={!isOpen}
              >
                <p className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom note */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Noch eine Frage?{" "}
        <a
          href="#anfrage"
          className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
        >
          Stellen Sie uns direkt eine Anfrage
        </a>
        {" "}— wir antworten persönlich.
      </p>
    </Section>
  )
}
