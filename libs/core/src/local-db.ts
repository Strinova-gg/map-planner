import Dexie, { type Table } from 'dexie';
import type { Strategy } from './types/strategy';

class MapPlannerDB extends Dexie {
  strategies!: Table<Strategy>;

  constructor() {
    super('map-planner');
    this.version(1).stores({
      strategies: 'id, mapSlug, updatedAt',
    });
  }
}

export const localDb = new MapPlannerDB();
