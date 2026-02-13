"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks: { href: string; label: string }[] = [];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-0.5 border border-black px-2 py-1">
          <span className="text-2xl font-normal tracking-tight text-foreground">
            Next
          </span>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            Office
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-body transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Button asChild className="h-auto px-6 py-2.5 text-base">
            <Link href="/contact">Schnellangebot</Link>
          </Button>
        </nav>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menü öffnen</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <nav className="mt-8 flex flex-col gap-6">
              <Button asChild className="h-auto px-6 py-2.5 text-base">
                <Link href="/contact" onClick={() => setOpen(false)}>
                  Schnellangebot
                </Link>
              </Button>

              <div>
                <h3 className="text-sm font-semibold text-foreground">Unternehmen</h3>
                <div className="mt-3 flex flex-col gap-2">
                  {[
                    { href: "/ueber-uns", label: "Über uns" },
                    { href: "/fuer-anbieter", label: "Für Anbieter" },
                    { href: "/blog", label: "Ratgeber" },
                    { href: "/contact", label: "Kontakt" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="text-sm text-body transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">Rechtliches</h3>
                <div className="mt-3 flex flex-col gap-2">
                  {[
                    { href: "/datenschutz", label: "Datenschutz" },
                    { href: "/impressum", label: "Impressum" },
                    { href: "/agb", label: "AGB" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="text-sm text-body transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
