"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const filterOptions = [
  "Alle Preise",
  "Teamgröße",
  "Ausstattung",
  "Sofort verfügbar",
];

export function SearchFilters() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b bg-white px-4 py-3">
      <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filter
      </Button>
      {filterOptions.map((filter) => (
        <Button
          key={filter}
          variant="outline"
          size="sm"
          className="shrink-0"
        >
          {filter}
        </Button>
      ))}
    </div>
  );
}
