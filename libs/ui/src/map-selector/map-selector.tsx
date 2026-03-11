'use client';

import { MAPS } from '@map-planner/core';
import { MapCard } from './map-card';

interface Props {
  onMapSelect: (slug: string) => void;
}

export function MapSelector({ onMapSelect }: Props) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">Select a Map</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {MAPS.map((map) => (
          <MapCard key={map.slug} map={map} onClick={onMapSelect} />
        ))}
      </div>
    </div>
  );
}
