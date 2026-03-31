'use client';

// React hooks for component state and lifecycle behavior.
import { useEffect, useState } from 'react';
// Next.js router helper for client-side navigation.
import { useRouter } from 'next/navigation';
// nanoid generates unique IDs for new strategies.
import { nanoid } from 'nanoid';
// localDb provides access to the indexed DB strategy store.
import { localDb } from '@map-planner/core';
// Strategy type describes the shape of a saved strategy object.
import type { Strategy } from '@map-planner/core';
// UI components for selecting a map and rendering buttons.
import { MapSelector } from '@map-planner/ui';
import { Button } from '@map-planner/ui';
// Icon used for the delete button.
import { Trash2 } from 'lucide-react';

export function HomePageClient() {
  // Router for navigating to planner pages.
  const router = useRouter();
  // Local state holds the list of recent strategies.
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  // Load recent strategies once when the component mounts.
  useEffect(() => {
    localDb.strategies.orderBy('updatedAt').reverse().toArray().then(setStrategies);
  }, []);

  // Called when the user selects a map to start a new strategy.
  const handleMapSelect = async (slug: string) => {
    const id = nanoid();
    const now = new Date();

    // Create a new empty strategy object with metadata.
    const strategy: Strategy = {
      id,
      mapSlug: slug,
      title: '',
      mode: 'default',
      halves: [],
      objects: [],
      createdAt: now,
      updatedAt: now,
    };

    // Save the new strategy and navigate to its planner page.
    await localDb.strategies.put(strategy);
    router.push(`/planner/${id}`);
  };

  // Open an existing strategy by navigating to its planner page.
  const handleOpenStrategy = (id: string) => {
    router.push(`/planner/${id}`);
  };

  // Delete a strategy from the local database and update UI state.
  const handleDeleteStrategy = async (id: string) => {
    await localDb.strategies.delete(id);
    setStrategies((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Strinova Map Planner</h1>
          <p className="mt-1 text-sm text-muted-foreground">Plan your strategies</p>
        </div>

        {/* Map selector allows choosing a map and creating a new strategy. */}
        <MapSelector onMapSelect={handleMapSelect} />

        {/* Show recent strategies only when there are saved items. */}
        {strategies.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Strategies</h2>
            <div className="flex flex-col gap-2">
              {strategies.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:border-ring transition-colors"
                >
                  <button
                    className="flex-1 text-left"
                    onClick={() => handleOpenStrategy(s.id)}
                  >
                    <div className="text-sm font-medium text-foreground">
                      {s.title || 'Untitled Strategy'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.mapSlug} · {new Date(s.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteStrategy(s.id)}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
