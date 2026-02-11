"use client";

import { useState } from "react";
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
import { cities } from "@/lib/mock-data";
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
  const [submitted, setSubmitted] = useState(false);
  const showCityField = !citySlug && !listingId;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: send to Supabase
    setSubmitted(true);
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
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" placeholder="Max Mustermann" autoComplete="off" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="max@firma.de"
            autoComplete="off"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+49 123 456789"
            autoComplete="off"
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

      <Button type="submit" size="lg" className="w-full">
        <Send className="mr-2 h-4 w-4" />
        Anfrage senden
      </Button>

      <p className="text-center text-xs text-muted-text">
        Kostenlos & unverbindlich. Wir melden uns innerhalb von 24h.
      </p>
    </form>
  );
}
