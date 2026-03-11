import type { CanvasObject } from './canvas';

export type StrategyMode = 'default' | 'custom';

export interface Plan {
  id: string;
  name: string;
  objects: CanvasObject[];
}

export interface Half {
  id: string;
  name: string;
  /** Agent IDs assigned to the attacking team for this half. */
  attackerIds: string[];
  /** Agent IDs assigned to the defending team for this half. */
  defenderIds: string[];
  plans: Plan[];
}

export interface Strategy {
  id: string;
  mapSlug: string;
  title: string;
  /** 'default' = attackers/defenders with halves & plans; 'custom' = free-form flat objects. */
  mode: StrategyMode;
  /** Used in default mode. Always has at least 1 half with 1 plan. */
  halves: Half[];
  /** Used in custom mode. */
  objects: CanvasObject[];
  createdAt: Date;
  updatedAt: Date;
}
