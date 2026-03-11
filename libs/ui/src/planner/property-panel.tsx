'use client';

import { Trash2, Lock, Unlock } from 'lucide-react';
import type { CanvasObject, PhaseLabel } from '@map-planner/core';
import { Button } from '../components/button';
import { Label } from '../components/label';
import { Slider } from '../components/slider';
import { Separator } from '../components/separator';
import { Badge } from '../components/badge';

interface Props {
  selectedObjects: CanvasObject[];
  onDelete: (ids: string[]) => void;
  onTransform: (id: string, patch: Partial<CanvasObject>) => void;
}

const PHASE_OPTIONS: Array<{ value: PhaseLabel; label: string }> = [
  { value: 'pre-round', label: 'Pre-round' },
  { value: 'mid-round', label: 'Mid-round' },
  { value: 'post-plant', label: 'Post-plant' },
];

export function PropertyPanel({ selectedObjects, onDelete, onTransform }: Props) {
  if (selectedObjects.length === 0) return null;

  const obj = selectedObjects[0];
  const isMulti = selectedObjects.length > 1;
  const allIds = selectedObjects.map((o) => o.id);

  return (
    <div className="absolute bottom-4 right-4 z-10 w-52 rounded-lg border border-border bg-card p-3 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {isMulti ? `${selectedObjects.length} objects` : obj.kind}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={() => onDelete(allIds)}
        >
          <Trash2 size={13} />
        </Button>
      </div>

      {!isMulti && (
        <>
          {/* Opacity */}
          <div className="mb-3">
            <Label className="mb-1.5 block text-xs">
              Opacity: {Math.round(obj.opacity * 100)}%
            </Label>
            <Slider
              min={0.1}
              max={1}
              step={0.05}
              value={[obj.opacity]}
              onValueChange={([v]) => onTransform(obj.id, { opacity: v })}
            />
          </div>

          {/* Lock */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 h-7 w-full justify-start gap-2 text-xs"
            onClick={() => onTransform(obj.id, { locked: !obj.locked })}
          >
            {obj.locked ? <Lock size={12} /> : <Unlock size={12} />}
            {obj.locked ? 'Locked' : 'Unlocked'}
          </Button>

          <Separator className="my-2" />

          {/* Phase label */}
          <div>
            <Label className="mb-1.5 block text-xs">Phase</Label>
            <div className="flex flex-wrap gap-1">
              {PHASE_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  onClick={() =>
                    onTransform(obj.id, {
                      phaseLabel: obj.phaseLabel === p.value ? undefined : p.value,
                    })
                  }
                >
                  <Badge
                    variant={obj.phaseLabel === p.value ? 'default' : 'outline'}
                    className="cursor-pointer text-[10px]"
                  >
                    {p.label}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
