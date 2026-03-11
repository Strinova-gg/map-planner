'use client';

import type { MapMeta } from '@map-planner/core';
import { cn } from '../lib/utils';

interface Props {
  map: MapMeta;
  onClick: (slug: string) => void;
}

export function MapCard({ map, onClick }: Props) {
  return (
    <button
      onClick={() => onClick(map.slug)}
      className={cn(
        'group relative flex aspect-video w-full flex-col items-end justify-end overflow-hidden rounded-lg border border-border transition-all hover:border-ring hover:shadow-lg',
      )}
    >
      {/* Cover image */}
      <img
        src={map.coverImagePath}
        alt={map.displayName}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Map name */}
      <div className="relative z-10 p-3">
        <span className="text-sm font-semibold text-white drop-shadow">{map.displayName}</span>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
        <span className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
          Plan Strategy
        </span>
      </div>
    </button>
  );
}
