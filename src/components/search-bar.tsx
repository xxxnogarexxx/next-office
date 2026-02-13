"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cities } from "@/lib/listings";

interface SearchBarProps {
  className?: string;
  size?: "default" | "lg";
  variant?: "default" | "hero";
}

export function SearchBar({ className, size = "default", variant = "default" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = query.length > 0
    ? cities.filter((city) =>
        city.name.toLowerCase().includes(query.toLowerCase())
      )
    : cities;

  function navigate(slug: string) {
    setQuery("");
    setIsOpen(false);
    router.push(`/${slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && filtered[selectedIndex]) {
        navigate(filtered[selectedIndex].slug);
      } else if (filtered.length === 1) {
        navigate(filtered[0].slug);
      } else if (query.length > 0) {
        // If typed text matches a city, go there
        const match = cities.find(
          (c) => c.name.toLowerCase() === query.toLowerCase()
        );
        if (match) {
          navigate(match.slug);
        } else {
          router.push("/search");
        }
      } else {
        router.push("/search");
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const inputHeight = size === "lg" ? "h-12 text-base" : "h-10 text-sm";

  function handleSearch() {
    if (selectedIndex >= 0 && filtered[selectedIndex]) {
      navigate(filtered[selectedIndex].slug);
    } else if (filtered.length === 1) {
      navigate(filtered[0].slug);
    } else if (query.length > 0) {
      const match = cities.find(
        (c) => c.name.toLowerCase() === query.toLowerCase()
      );
      if (match) navigate(match.slug);
      else router.push("/search");
    } else {
      router.push("/search");
    }
  }

  const dropdown = isOpen && filtered.length > 0 && (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border bg-white shadow-lg">
      {filtered.map((city, i) => (
        <button
          key={city.slug}
          onClick={() => navigate(city.slug)}
          className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-surface ${
            i === selectedIndex ? "bg-surface" : ""
          }`}
        >
          <MapPin className="h-4 w-4 shrink-0 text-muted-text" />
          <div>
            <span className="font-medium text-foreground">
              {city.name}
            </span>
            <span className="ml-2 text-muted-text">
              {city.listingCount} Büros
            </span>
          </div>
        </button>
      ))}
    </div>
  );

  if (variant === "hero") {
    return (
      <div ref={wrapperRef} className={`relative ${className ?? ""}`}>
        <div className="rounded-xl bg-white px-4 pb-3 pt-3 shadow-md sm:px-5 sm:pb-3 sm:pt-4">
          <p className="mb-1.5 text-sm font-semibold text-foreground">Wo suchen Sie?</p>
          <div className="flex items-center gap-2 sm:gap-3">
            <MapPin className="h-5 w-5 shrink-0 text-muted-text" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Stadt, Stadtteil oder Adresse..."
              autoComplete="off"
              data-form-type="other"
              suppressHydrationWarning
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-text"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="flex shrink-0 items-center justify-center rounded-lg bg-primary p-2.5 text-white transition-colors hover:bg-accent-blue-hover sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm sm:font-medium"
            >
              <span className="hidden sm:inline">Suchen</span>
              <Search className="h-5 w-5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
        {dropdown}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={`relative ${className ?? ""}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-text z-10" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          setSelectedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Stadt eingeben..."
        autoComplete="off"
        data-form-type="other"
        suppressHydrationWarning
        className={`pl-10 bg-white ${inputHeight}`}
      />
      {dropdown}
    </div>
  );
}
