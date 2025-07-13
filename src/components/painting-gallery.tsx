
"use client";

import type { Painting } from "@/lib/types";
import { PaintingCard } from "./painting-card";

type PaintingGalleryProps = {
  paintings: Painting[];
};

export function PaintingGallery({ paintings }: PaintingGalleryProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {paintings.map((painting) => (
          <PaintingCard
            key={painting.id}
            painting={painting}
          />
        ))}
      </div>
    </>
  );
}
