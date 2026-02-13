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
          <SheetContent side="right" className="w-80 p-0" showCloseButton={false}>
            <div className="flex h-20 items-center justify-between border-b px-6">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-0.5 border border-black px-2 py-1">
                <span className="text-2xl font-normal tracking-tight">Next</span>
                <span className="text-2xl font-bold tracking-tight">Office</span>
              </Link>
              <button onClick={() => setOpen(false)} className="rounded-md p-2 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col px-6 py-6">
              <Button asChild className="h-auto w-full py-3 text-base">
                <Link href="/contact" onClick={() => setOpen(false)}>
                  Schnellangebot
                </Link>
              </Button>

              <div className="mt-8">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Unternehmen</p>
                <div className="mt-3 flex flex-col gap-1">
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
                      className="-mx-2 rounded-md px-2 py-2 text-[15px] text-gray-700 transition-colors hover:bg-gray-50 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t pt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Rechtliches</p>
                <div className="mt-3 flex flex-col gap-1">
                  {[
                    { href: "/datenschutz", label: "Datenschutz" },
                    { href: "/impressum", label: "Impressum" },
                    { href: "/agb", label: "AGB" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="-mx-2 rounded-md px-2 py-2 text-[15px] text-gray-700 transition-colors hover:bg-gray-50 hover:text-foreground"
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
