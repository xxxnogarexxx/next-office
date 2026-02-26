"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LeadForm } from "@/components/lead-form";
import { Shield, Zap, BadgeCheck, Star } from "lucide-react";

interface LeadDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  subtitle: string;
  listingId?: string;
  listingName?: string;
  citySlug?: string;
}

export function LeadDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  listingId,
  listingName,
  citySlug,
}: LeadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-md" showCloseButton={false}>
        {/* Header */}
        <div className="px-6 pt-6 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-body">
                {subtitle}
              </DialogDescription>
            </div>
            <button onClick={() => onOpenChange(false)} className="rounded-md p-1.5 hover:bg-gray-100" aria-label="Schließen">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* Trust strip */}
          <div className="mt-4 flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> 100% kostenlos</span>
            <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Antwort in 30 Min.</span>
            <span className="flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5" /> Preisgarantie</span>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-6">
          <LeadForm
            variant="dialog"
            listingId={listingId}
            listingName={listingName}
            citySlug={citySlug}
          />
        </div>

        {/* Client logos */}
        <div className="px-6 pb-3">
          <p className="mb-2 text-center text-[11px] text-muted-text">Vertrauen uns bereits</p>
          <div className="flex items-center justify-center gap-6 opacity-40 grayscale">
            <Image src="/logo-zalando.svg" alt="Zalando" width={80} height={20} className="h-4 w-auto" />
            <Image src="/logo-canon.svg" alt="Canon" width={80} height={20} className="h-4 w-auto" />
            <Image src="/logo-fresenius.svg" alt="Fresenius" width={80} height={20} className="h-4 w-auto" />
          </div>
        </div>

        {/* Advisor footer */}
        <div className="border-t bg-gray-50 px-6 py-3">
          <div className="flex items-center gap-3">
            <Image
              src="/team-benjamin.jpg"
              alt="Benjamin Plass"
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-xs font-semibold">Benjamin Plass</p>
              <p className="text-[11px] text-muted-text">Ihr persönlicher Berater</p>
            </div>
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
