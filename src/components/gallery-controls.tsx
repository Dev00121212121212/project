
"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Filter, ArrowUpDown } from "lucide-react";

type GalleryControlsProps = {
  styles: string[];
  styleFilter: string;
  setStyleFilter: (value: string) => void;
  sortOrder: string;
  setSortOrder: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
};

export function GalleryControls({
  styles,
  styleFilter,
  setStyleFilter,
  sortOrder,
  setSortOrder,
  searchQuery,
  setSearchQuery,
}: GalleryControlsProps) {
  return (
    <div className="mb-8 p-4 bg-card border rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-muted-foreground mb-1">
            Search by Title or Artist
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="search"
              placeholder="e.g., Starry Night or Van Gogh"
              className="pl-10 h-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div>
          <label htmlFor="style-filter" className="block text-sm font-medium text-muted-foreground mb-1">
             <Filter className="inline-block mr-1 h-4 w-4" />
            Filter by Style
          </label>
          <Select value={styleFilter} onValueChange={setStyleFilter}>
            <SelectTrigger id="style-filter" className="w-full">
              <SelectValue placeholder="Select Style" />
            </SelectTrigger>
            <SelectContent>
              {styles.map((style) => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>
  );
}
