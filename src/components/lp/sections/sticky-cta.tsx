"use client";

import { useState, useEffect, useRef } from "react";
import { LPButton } from "@/components/lp/ui";

export interface StickyCTAProps {
  /** Text for the sticky button */
  text?: string;
  /** Target anchor to scroll to (default: "#anfrage") */
  targetId?: string;
}

/**
 * Sticky CTA bar — persists at the bottom of the viewport while scrolling.
 *
 * Appears only AFTER the user has scrolled past the hero section (avoids
 * doubling up with the hero CTA). Also hides when the lead form (#anfrage)
 * is already in view — no need to remind the user when the form is visible.
 *
 * On click: smooth-scrolls to the target anchor (default: "#anfrage").
 *
 * Safe-area inset padding handles iOS home indicator notches.
 * "use client" — requires IntersectionObserver and scroll state.
 */
export function StickyCTA({
  text = "Jetzt kostenlos beraten lassen",
  targetId = "anfrage",
}: StickyCTAProps) {
  const [visible, setVisible] = useState(false);
  const heroHiddenRef = useRef(false);
  const formHiddenRef = useRef(true);

  useEffect(() => {
    function updateVisibility() {
      setVisible(heroHiddenRef.current && formHiddenRef.current);
    }

    // Watch the hero section — show sticky CTA after hero scrolls out of view
    const heroSection = document.getElementById("hero");
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroHiddenRef.current = !entry.isIntersecting;
        updateVisibility();
      },
      { threshold: 0 }
    );

    if (heroSection) {
      heroObserver.observe(heroSection);
    } else {
      // No hero section found — default to showing after initial scroll
      heroHiddenRef.current = true;
      updateVisibility();
    }

    // Watch the form section — hide sticky CTA when form is in view
    const formSection = document.getElementById(targetId);
    const formObserver = new IntersectionObserver(
      ([entry]) => {
        formHiddenRef.current = !entry.isIntersecting;
        updateVisibility();
      },
      { threshold: 0.1 }
    );

    if (formSection) {
      formObserver.observe(formSection);
    }

    return () => {
      heroObserver.disconnect();
      formObserver.disconnect();
    };
  }, [targetId]);

  function handleClick() {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div
      aria-hidden={!visible}
      className={[
        // Fixed bar at viewport bottom — above all other content
        "fixed bottom-0 left-0 right-0 z-50",
        // White bar with subtle top shadow separating it from page content
        "bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)]",
        // Padding: vertical rhythm + safe area for iOS home indicator notch
        "px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        // Slide-up reveal / slide-down hide animation
        "transition-transform duration-300",
        visible ? "translate-y-0" : "translate-y-full",
      ].join(" ")}
    >
      {/* Centered container matching page max-width */}
      <div className="mx-auto max-w-7xl flex justify-center">
        <LPButton
          variant="cta"
          size="lg"
          className="w-full sm:w-auto"
          onClick={handleClick}
          aria-label="Zum Anfrageformular scrollen"
        >
          {text}
        </LPButton>
      </div>
    </div>
  );
}
