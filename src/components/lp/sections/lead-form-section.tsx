"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormField, LPButton, Section } from "@/components/lp/ui";
import { getLPCities } from "@/lib/lp/cities";
import type { LPCity } from "@/lib/lp/types";

export interface LeadFormSectionProps {
  city: LPCity;
  searchParams: Record<string, string | undefined>;
  /** Render as a standalone section with heading, or as embedded form only */
  variant?: "section" | "embedded";
}

interface FormValues {
  name: string;
  email: string;
  phone: string;
  team_size: string;
  start_date: string;
  city: string;
  company: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const CITY_OPTIONS = getLPCities().map((c) => ({ value: c.slug, label: c.name }));

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Bitte geben Sie Ihren Namen ein";
  }

  if (!values.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Bitte geben Sie eine gültige E-Mail-Adresse ein";
  }

  if (!values.phone.trim()) {
    errors.phone = "Bitte geben Sie Ihre Telefonnummer ein";
  }

  if (!values.team_size || Number(values.team_size) < 1) {
    errors.team_size = "Bitte geben Sie die Teamgröße ein";
  }

  if (!values.start_date) {
    errors.start_date = "Bitte wählen Sie ein Einzugsdatum";
  }

  if (!values.city) {
    errors.city = "Bitte wählen Sie eine Stadt";
  }

  return errors;
}

/**
 * LP lead capture form section.
 *
 * Collects structured inquiry data (name, email, phone, team size, start date,
 * city + optional company and message) with German-language client-side validation.
 * Submits to /api/lp-leads with UTM tracking data, then redirects to /lp/{city}/danke.
 *
 * "use client" — required for form state, validation, blur/submit handling, and routing.
 *
 * Can be rendered as a full section with heading ("section" variant) or as an
 * embedded form only ("embedded" variant).
 */
export function LeadFormSection({
  city,
  searchParams,
  variant = "section",
}: LeadFormSectionProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
    phone: "",
    team_size: "",
    start_date: "",
    city: city.slug,
    company: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // Remove any elements/attributes injected by password manager extensions
  // (NordPass, LastPass, 1Password, etc.) that cause layout shifts
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    function cleanExtensionJunk(root: Element) {
      root
        .querySelectorAll(
          "[data-np-uid], [data-lastpass-icon-root], [class^='np-'], iframe:not([title])"
        )
        .forEach((el) => el.remove());
      for (const attr of Array.from(root.attributes)) {
        if (
          attr.name.startsWith("data-np") ||
          attr.name.startsWith("data-lp") ||
          attr.name.startsWith("data-dashlane")
        ) {
          root.removeAttribute(attr.name);
        }
      }
    }

    cleanExtensionJunk(form);

    const observer = new MutationObserver(() => cleanExtensionJunk(form));
    observer.observe(form, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "data-np-autofill-form-type",
        "data-np-watching",
        "data-np-checked",
      ],
    });
    return () => observer.disconnect();
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error as user types
    if (errors[name as keyof FormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleBlur(
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name } = e.target;
    const fieldErrors = validateForm(values);
    if (fieldErrors[name as keyof FormValues]) {
      setErrors((prev) => ({
        ...prev,
        [name]: fieldErrors[name as keyof FormValues],
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(false);

    const fieldErrors = validateForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      // Focus the first invalid field
      const firstErrorField = Object.keys(fieldErrors)[0];
      const el = formRef.current?.querySelector<HTMLElement>(
        `[name="${firstErrorField}"]`
      );
      el?.focus();
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/lp-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Core fields
          name: values.name,
          email: values.email,
          phone: values.phone,
          team_size: Number(values.team_size),
          start_date: values.start_date,
          city: values.city,
          company: values.company || null,
          message: values.message || null,
          // UTM tracking from searchParams
          utm_source: searchParams.utm_source || null,
          utm_medium: searchParams.utm_medium || null,
          utm_campaign: searchParams.utm_campaign || null,
          utm_term: searchParams.utm_term || null,
          utm_content: searchParams.utm_content || null,
          // Google Ads click IDs — read from searchParams (middleware also sets cookies as fallback)
          gclid: searchParams.gclid || null,
          gbraid: searchParams.gbraid || null,
          wbraid: searchParams.wbraid || null,
          // Page context
          landing_page: typeof window !== "undefined" ? window.location.href : null,
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
        }),
      });

      if (!res.ok) {
        setSubmitError(true);
        setSubmitting(false);
        return;
      }

      // Redirect to thank-you page — use values.city (could differ from city prop)
      router.push(`/lp/${values.city}/danke`);
    } catch {
      setSubmitError(true);
      setSubmitting(false);
    }
  }

  const formContent = (
    <div className="rounded-xl border border-border bg-white shadow-sm p-6 sm:p-8">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        autoComplete="off"
        noValidate
        className="flex flex-col gap-5"
      >
        {/* Row 1: Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Name"
            name="name"
            type="text"
            placeholder="Max Mustermann"
            required
            autoComplete="one-time-code"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
          />
          <FormField
            label="E-Mail"
            name="email"
            type="email"
            placeholder="max@firma.de"
            required
            autoComplete="one-time-code"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
          />
        </div>

        {/* Row 2: Phone + Team size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Telefon"
            name="phone"
            type="tel"
            placeholder="+49 123 456789"
            required
            autoComplete="one-time-code"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phone}
          />
          <FormField
            label="Teamgröße (Personen)"
            name="team_size"
            type="number"
            placeholder="z.B. 12"
            min={1}
            required
            value={values.team_size}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.team_size}
          />
        </div>

        {/* Row 3: Start date + City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Gewünschtes Einzugsdatum"
            name="start_date"
            type="date"
            required
            value={values.start_date}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.start_date}
          />
          <FormField
            label="Stadt"
            name="city"
            type="select"
            placeholder="Stadt wählen"
            required
            options={CITY_OPTIONS}
            value={values.city}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.city}
          />
        </div>

        {/* Optional: Company */}
        <FormField
          label="Firmenname"
          name="company"
          type="text"
          placeholder="Muster GmbH (optional)"
          value={values.company}
          onChange={handleChange}
        />

        {/* Optional: Message */}
        <FormField
          label="Nachricht"
          name="message"
          type="textarea"
          placeholder="Weitere Anforderungen oder Fragen... (optional)"
          value={values.message}
          onChange={handleChange}
        />

        {/* Submission error */}
        {submitError && (
          <p role="alert" className="text-sm text-error text-center">
            Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.
          </p>
        )}

        {/* Submit */}
        <LPButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? "Wird gesendet..." : "Kostenlose Beratung anfordern"}
        </LPButton>

        {/* Trust line */}
        <p className="text-xs text-muted-foreground text-center">
          Ihre Daten werden vertraulich behandelt.{" "}
          <Link href="/datenschutz" className="underline hover:text-foreground transition-colors">
            Datenschutz
          </Link>
        </p>
      </form>
    </div>
  );

  if (variant === "embedded") {
    return formContent;
  }

  return (
    <Section background="surface" id="anfrage">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Jetzt unverbindlich anfragen
          </h2>
          <p className="text-muted-foreground">
            Schildern Sie uns Ihren Bedarf — wir finden die passenden Büros in{" "}
            {city.name} für Sie.
          </p>
        </div>
        {formContent}
      </div>
    </Section>
  );
}
