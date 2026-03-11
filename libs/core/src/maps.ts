export type MapSlug =
  | 'base-404'
  | 'area-88'
  | 'port-euler'
  | 'windy-town'
  | 'space-lab'
  | 'cauchy-district'
  | 'cosmite';

export interface MapLabel {
  name: string;
  /** Fraction of canvas width (0–1) */
  x: number;
  /** Fraction of canvas height (0–1) */
  y: number;
}

export interface MapMeta {
  slug: MapSlug;
  displayName: string;
  /** Clean minimap PNG used as canvas background */
  imagePath: string;
  /** Cover/preview image used on the map selector card */
  coverImagePath: string;
  accentColor: string;
  /** Callout labels shown as overlay on the canvas */
  labels: ReadonlyArray<MapLabel>;
}

export const MAPS: MapMeta[] = [
  {
    slug: 'base-404',
    displayName: 'Base 404',
    imagePath: '/minimaps/base-404.png',
    coverImagePath: '/maps/base-404-cover.jpg',
    accentColor: '#c2410c',
    labels: [
      { name: 'Police Office', x: 0.5, y: 0.1 },
      { name: 'Control Room', x: 0.85, y: 0.3 },
      { name: 'Power Room', x: 0.1, y: 0.4 },
      { name: 'Checkpoint', x: 0.85, y: 0.52 },
      { name: 'Passageway', x: 0.143, y: 0.550 },
      { name: 'Testing Range', x: 0.55, y: 0.550 },
      { name: 'Outpost', x: 0.344, y: 0.9 },
    ],
  },
  {
    slug: 'area-88',
    displayName: 'Area 88',
    imagePath: '/minimaps/area-88.png',
    coverImagePath: '/maps/area-88-cover.jpg',
    accentColor: '#0369a1',
    labels: [
      { name: 'Bank', x: 0.8, y: 0.06 },
      { name: 'P.U.S Range', x: 0.75, y: 0.14 },
      { name: 'Monument', x: 0.130, y: 0.208 },
      { name: 'Garden', x: 0.3, y: 0.208 },
      { name: 'Police Agency', x: 0.5, y: 0.28 },
      { name: 'Walkway B', x: 0.105, y: 0.4 },
      { name: 'Avenue A', x: 0.84, y: 0.38 },
      { name: 'AV Company', x: 0.95, y: 0.45 },
      { name: 'Cargo Area', x: 0.53, y: 0.5 },
      { name: 'Extreme Sports', x: 0.13, y: 0.7 },
      { name: 'Shopping Mall', x: 0.4, y: 0.73 },
      { name: 'Arcade', x: 0.610, y: 0.7 },
      { name: 'Bar', x: 0.87, y: 0.66 },
      { name: 'Station', x: 0.24, y: 0.88 },
    ],
  },
  {
    slug: 'port-euler',
    displayName: 'Port Euler',
    imagePath: '/minimaps/port-euler.png',
    coverImagePath: '/maps/port-euler-cover.jpg',
    accentColor: '#15803d',
    labels: [
      { name: 'Police Agency', x: 0.25, y: 0.07 },
      { name: 'Back Door', x: 0.75, y: 0.069 },
      { name: 'Power Plant', x: 0.55, y: 0.279 },
      { name: 'Purification Center', x: 0.83, y: 0.310 },
      { name: 'Inventory', x: 0.250, y: 0.356 },
      { name: 'Warehouse Pipeline', x: 0.079, y: 0.5 },
      { name: 'Repair Shop', x: 0.69, y: 0.57 },
      { name: 'Pier', x: 0.67, y: 0.96 },
    ],
  },
  {
    slug: 'windy-town',
    displayName: 'Windy Town',
    imagePath: '/minimaps/windy-town.png',
    coverImagePath: '/maps/windy-town-cover.jpg',
    accentColor: '#7c3aed',
    labels: [
      { name: 'Plaza', x: 0.548, y: 0.05 },
      { name: 'Garden', x: 0.82, y: 0.13 },
      { name: 'Residential Area', x: 0.2, y: 0.15 },
      { name: 'Riverway B', x: 0.09, y: 0.48 },
      { name: 'Grand Hotel', x: 0.4, y: 0.5 },
      { name: 'Walkway A', x: 0.77, y: 0.567 },
      { name: 'Pier Markets', x: 0.4, y: 0.9 },
    ],
  },
  {
    slug: 'space-lab',
    displayName: 'Space Lab',
    imagePath: '/minimaps/space-lab.png',
    coverImagePath: '/maps/space-lab-cover.jpg',
    accentColor: '#0e7490',
    labels: [
      { name: 'Lounge', x: 0.323, y: 0.100 },
      { name: 'Cubicle', x: 0.460, y: 0.13 },
      { name: 'Navigation Platform', x: 0.65, y: 0.13 },
      { name: 'Positioning Room', x: 0.82, y: 0.1 },
      { name: 'Corridor A', x: 0.59, y: 0.237 },
      { name: 'Corridor B', x: 0.398, y: 0.41 },
      { name: 'Power Room', x: 0.15, y: 0.5 },
      { name: 'Shuttle Field', x: 0.61, y: 0.466 },
      { name: 'Logistics', x: 0.548, y: 0.616 },
      { name: 'Inventory', x: 0.857, y: 0.588 },
      { name: 'Aisle', x: 0.474, y: 0.707 },
      { name: 'Main Entrance', x: 0.702, y: 0.747 },
    ],
  },
  {
    slug: 'cauchy-district',
    displayName: 'Cauchy District',
    imagePath: '/minimaps/cauchy-district.png',
    coverImagePath: '/maps/cauchy-district-cover.jpg',
    accentColor: '#b45309',
    labels: [
      { name: 'Marketplace', x: 0.529, y: 0.058 },
      { name: 'Back Alley', x: 0.85, y: 0.057 },
      { name: 'High Street', x: 0.210, y: 0.126 },
      { name: 'Residential Area', x: 0.868, y: 0.26 },
      { name: 'Warehouse', x: 0.36, y: 0.3 },
      { name: 'Signal Station', x: 0.141, y: 0.319 },
      { name: 'Central Plaza', x: 0.57, y: 0.325 },
      { name: 'Observation Deck', x: 0.9, y: 0.42 },
      { name: 'Sewer', x: 0.269, y: 0.53 },
      { name: 'B Road', x: 0.539, y: 0.492 },
      { name: 'A Aisle', x: 0.89, y: 0.56 },
      { name: 'Old Street', x: 0.417, y: 0.58 },
      { name: 'C Roadway', x: 0.05, y: 0.63 },
      { name: 'Pathway', x: 0.686, y: 0.656 },
      { name: 'Market', x: 0.515, y: 0.7 },
      { name: 'Comms', x: 0.297, y: 0.687 },
      { name: 'Front Yard', x: 0.78, y: 0.78 },
      { name: 'Shuttle', x: 0.5, y: 0.8 },
    ],
  },
  {
    slug: 'cosmite',
    displayName: 'Cosmite',
    imagePath: '/minimaps/cosmite.png',
    coverImagePath: '/maps/cosmite-cover.jpg',
    accentColor: '#6d28d9',
    labels: [
      { name: 'Archive', x: 0.49, y: 0.15 },
      { name: 'Chamber', x: 0.25, y: 0.21 },
      { name: 'Trail', x: 0.6, y: 0.28 },
      { name: 'Extraction', x: 0.2, y: 0.35 },
      { name: 'Conference Hall', x: 0.49, y: 0.37 },
      { name: 'Residential', x: 0.84, y: 0.36 },
      { name: 'Upper', x: 0.594, y: 0.445 },
      { name: 'Vault', x: 0.76, y: 0.48 },
      { name: 'Observatory', x: 0.49, y: 0.55 },
      { name: 'D-Field', x: 0.49, y: 0.67 },
      { name: 'Yard', x: 0.2, y: 0.63 },
      { name: 'Sands Street', x: 0.772, y: 0.74 },
      { name: 'Reception', x: 0.25, y: 0.79 },
      { name: 'Main Entrance', x: 0.48, y: 0.85 },
    ],
  },
];

/** 'defenders' = can only be placed on defender team in default mode
 *  'attackers' = can only be placed on attacker team in default mode
 *  'either'    = can be placed on either team */
export type FactionRole = 'defenders' | 'attackers' | 'either';

export interface AgentMeta {
  id: string;
  name: string;
  factionId: string;
  factionRole: FactionRole;
  color: string;
}

export interface FactionMeta {
  id: string;
  name: string;
  role: FactionRole;
  color: string;
  agents: ReadonlyArray<{ id: string; name: string }>;
}

export const FACTIONS: ReadonlyArray<FactionMeta> = [
  {
    id: 'pus',
    name: 'PUS',
    role: 'defenders',
    color: '#3b82f6',
    agents: [
      { id: 'Michele', name: 'Michele' },
      { id: 'Nobunaga', name: 'Nobunaga' },
      { id: 'Kokona', name: 'Kokona' },
      { id: 'Yvette', name: 'Yvette' },
      { id: 'Flavia', name: 'Flavia' },
      { id: 'Yugiri', name: 'Yugiri' },
      { id: 'Leona', name: 'Leona' },
      { id: 'Chiyo', name: 'Chiyo' },
    ],
  },
  {
    id: 'scissors',
    name: 'Scissors',
    role: 'attackers',
    color: '#e11d48',
    agents: [
      { id: 'Ming', name: 'Ming' },
      { id: 'Lawine', name: 'Lawine' },
      { id: 'Meredith', name: 'Meredith' },
      { id: 'Reiichi', name: 'Reiichi' },
      { id: 'Kanami', name: 'Kanami' },
      { id: 'Eika', name: 'Eika' },
      { id: 'Fragrans', name: 'Fragrans' },
      { id: 'Mara', name: 'Mara' },
    ],
  },
  {
    id: 'urbino',
    name: 'Urbino',
    role: 'either',
    color: '#f59e0b',
    agents: [
      { id: 'Celestia', name: 'Celestia' },
      { id: 'Audrey', name: 'Audrey' },
      { id: 'Maddelena', name: 'Maddelena' },
      { id: 'Fuchsia', name: 'Fuchsia' },
      { id: 'Bai Mo', name: 'Mo Bai' },
      { id: 'Galatea', name: 'Galatea' },
      { id: 'Cielle', name: 'Cielle' },
    ],
  },
] as const;

/** Flat list of all agents across all factions. */
export const CHARACTERS: AgentMeta[] = FACTIONS.flatMap((f) =>
  f.agents.map((a) => ({
    id: a.id,
    name: a.name,
    factionId: f.id,
    factionRole: f.role,
    color: f.color,
  }))
);

export type CharacterId = string;

/** Returns the public path for an agent's portrait icon. */
export function agentIconSrc(agentId: string): string {
  return `/icons/${agentId.toLowerCase().replace(/\s+/g, '-')}.png`;
}
