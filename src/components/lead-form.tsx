"use client";

import { useState, useEffect, useRef } from "react";
import { useTracking } from "@/components/tracking-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cities } from "@/lib/listings";
import { Send, CheckCircle } from "lucide-react";

interface LeadFormProps {
  listingId?: string;
  listingName?: string;
  citySlug?: string;
  variant?: "sidebar" | "inline" | "contact";
}

export function LeadForm({
  listingId,
  listingName,
  citySlug,
  variant = "inline",
}: LeadFormProps) {
  const tracking = useTracking();
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const showCityField = !citySlug && !listingId;

  const formRef = useRef<HTMLFormElement>(null);

  // Render form only on client to prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  // Remove any elements/attributes injected by password manager extensions
  // (NordPass, LastPass, 1Password, etc.) that cause layout shifts
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    function cleanExtensionJunk(root: Element) {
      // Remove injected child elements that aren't ours
      root.querySelectorAll("[data-np-uid], [data-lastpass-icon-root], [class^='np-'], iframe:not([title])").forEach(
        (el) => el.remove()
      );
      // Remove extension attributes from the form
      for (const attr of Array.from(root.attributes)) {
        if (attr.name.startsWith("data-np") || attr.name.startsWith("data-lp") || attr.name.startsWith("data-dashlane")) {
          root.removeAttribute(attr.name);
        }
      }
    }

    cleanExtensionJunk(form);

    const observer = new MutationObserver(() => {
      cleanExtensionJunk(form);
    });

    observer.observe(form, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-np-autofill-form-type", "data-np-watching", "data-np-checked"] });
    return () => observer.disconnect();
  }, [mounted]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("lead_fullname"),
        email: form.get("lead_mail"),
        phone: form.get("lead_tel") || null,
        team_size: form.get("teamSize") ? Number(form.get("teamSize")) : null,
        start_date: form.get("startDate") || null,
        city: form.get("city") || citySlug || null,
        message: form.get("message") || null,
        listing_id: listingId || null,
        listing_name: listingName || null,
        // Google Ads tracking
        gclid: tracking.gclid,
        gbraid: tracking.gbraid,
        wbraid: tracking.wbraid,
        landing_page: tracking.landing_page,
        referrer: tracking.referrer,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(true);
      return;
    }

    setSubmitted(true);
  }

  if (!mounted) {
    return (
      <div
        className={`flex flex-col gap-4 ${
          variant === "contact"
            ? ""
            : variant === "sidebar"
              ? "rounded-lg border bg-white p-6"
              : "mx-auto max-w-md rounded-lg border bg-white p-6"
        }`}
        style={{ minHeight: 380 }}
      />
    );
  }

  if (submitted) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 rounded-lg border bg-white p-8 text-center ${
          variant === "inline" ? "mx-auto max-w-md" : ""
        }`}
      >
        <CheckCircle className="h-10 w-10 text-success" />
        <h3 className="text-lg font-semibold">Anfrage gesendet!</h3>
        <p className="text-sm text-body">
          Wir melden uns innerhalb von 24 Stunden bei Ihnen.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      autoComplete="off"
      className={`flex flex-col gap-4 transform-gpu ${
        variant === "contact"
          ? ""
          : variant === "sidebar"
            ? "rounded-lg border bg-white p-6"
            : "mx-auto max-w-md rounded-lg border bg-white p-6"
      }`}
    >
      {variant === "sidebar" && (
        <div className="mb-2">
          <h3 className="text-lg font-semibold">Jetzt anfragen</h3>
          {listingName && (
            <p className="text-sm text-body">{listingName}</p>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lead_fullname">Name *</Label>
          <Input id="lead_fullname" name="lead_fullname" placeholder="Max Mustermann" autoComplete="one-time-code" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lead_mail">E-Mail *</Label>
          <Input
            id="lead_mail"
            name="lead_mail"
            type="text"
            inputMode="email"
            placeholder="max@firma.de"
            autoComplete="one-time-code"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lead_tel">Telefon</Label>
          <Input
            id="lead_tel"
            name="lead_tel"
            type="text"
            inputMode="tel"
            placeholder="+49 123 456789"
            autoComplete="one-time-code"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="teamSize">Teamgröße *</Label>
          <Input
            id="teamSize"
            name="teamSize"
            type="number"
            min={1}
            placeholder="z.B. 12"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Einzugsdatum *</Label>
          <Input id="startDate" name="startDate" type="date" required />
        </div>
        {showCityField && (
          <div className="space-y-2">
            <Label htmlFor="city">Stadt *</Label>
            <Select name="city" required>
              <SelectTrigger id="city">
                <SelectValue placeholder="Stadt wählen" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.slug} value={city.slug}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Nachricht</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Erzählen Sie uns von Ihren Anforderungen..."
          rows={3}
        />
      </div>

      {listingId && <input type="hidden" name="listingId" value={listingId} />}
      {citySlug && <input type="hidden" name="city" value={citySlug} />}

      {error && (
        <p className="text-center text-sm text-error">
          Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        <Send className="mr-2 h-4 w-4" />
        {submitting ? "Wird gesendet..." : "Anfrage senden"}
      </Button>

      <p className="text-center text-xs text-muted-text">
        Kostenlos & unverbindlich. Wir melden uns innerhalb von 24h.
      </p>
    </form>
  );
}
