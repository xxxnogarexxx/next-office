"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoGalleryProps {
  photos: string[];
  name: string;
}

export function PhotoGallery({ photos, name }: PhotoGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Scroll lock: fix body position when gallery is open
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Focus trap: trap Tab and handle Escape inside gallery overlay
  useEffect(() => {
    if (!isOpen) return;
    const overlay = galleryRef.current;
    if (!overlay) return;

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const capturedOverlay = overlay;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = capturedOverlay.querySelectorAll(focusableSelector);
      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    // Focus the first focusable element on open
    const focusable = capturedOverlay.querySelectorAll(focusableSelector);
    if (focusable.length > 0) (focusable[0] as HTMLElement).focus();

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (photos.length === 0) return null;

  return (
    <>
      {/* Grid preview — clickable */}
      <div
        className="grid cursor-pointer grid-cols-1 gap-1 sm:grid-cols-4 sm:grid-rows-2"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-l-xl sm:col-span-2 sm:row-span-2">
          <Image
            src={photos[0]}
            alt={name}
            fill
            className="object-cover transition-opacity hover:opacity-90"
            sizes="(max-width: 640px) 100vw, 50vw"
            priority
          />
        </div>
        {photos.slice(1, 5).map((photo, i) => (
          <div
            key={i}
            className={`relative hidden aspect-[16/10] overflow-hidden sm:block ${
              i === 1 ? "rounded-tr-xl" : i === 3 ? "rounded-br-xl" : ""
            }`}
          >
            <Image
              src={photo}
              alt={`${name} Foto ${i + 2}`}
              fill
              className="object-cover transition-opacity hover:opacity-90"
              sizes="25vw"
            />
            {/* "Show all" overlay on last visible thumbnail */}
            {i === photos.length - 2 || i === 3 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white transition-colors hover:bg-black/40">
                <span className="text-sm font-medium">
                  Alle {photos.length} Fotos
                </span>
              </div>
            ) : null}
          </div>
        ))}
        {/* Mobile: show all button */}
        <button className="mt-1 text-sm font-medium text-foreground underline underline-offset-2 hover:text-body sm:hidden">
          Alle {photos.length} Fotos anzeigen
        </button>
      </div>

      {/* Fullscreen gallery overlay */}
      {isOpen && (
        <div
          ref={galleryRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Fotogalerie: ${name}`}
          className="fixed inset-0 z-[100] overflow-y-auto bg-white"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </Button>
            <span className="text-sm text-body">
              {photos.length} Fotos — {name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable photo list */}
          <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="flex flex-col gap-4">
              {photos.map((photo, i) => (
                <div key={i} className="relative w-full">
                  <Image
                    src={photo}
                    alt={`${name} Foto ${i + 1}`}
                    width={1200}
                    height={800}
                    className="h-auto w-full rounded-lg object-cover"
                    sizes="(max-width: 896px) 100vw, 896px"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
