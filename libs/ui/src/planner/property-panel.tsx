'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2, Lock, Unlock, Paintbrush, Palette } from 'lucide-react';
import type { CanvasObject, PhaseLabel } from '@map-planner/core';
import { Button } from '../components/button';
import { Input } from '../components/input';
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

const CHANGE_INTERVAL_MS = 500;

type PropertyDraft = {
  text: string;
  fontSize: number;
  stroke: string;
  fill: string;
  strokeWidth: number;
  opacity: number;
};

function makeDraft(object: CanvasObject): PropertyDraft {
  return {
    text: object.kind === 'text' ? object.text : '',
    fontSize: object.kind === 'text' ? object.fontSize : 16,
    stroke: object.stroke,
    fill: object.fill === 'transparent' ? '#ffffff' : object.fill,
    strokeWidth: object.strokeWidth,
    opacity: object.opacity,
  };
}

export function PropertyPanel({ selectedObjects, onDelete, onTransform }: Props) {
  const textInputRef = useRef<HTMLInputElement>(null);
  const pendingChangeRef = useRef<{ id: string; patch: Partial<CanvasObject> } | null>(null);
  const changeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastChangeAtRef = useRef(0);
  const lastSentValuesRef = useRef<Record<string, unknown>>({});
  const selectedObjectIdRef = useRef<string | null>(null);
  const selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;
  const selectedTextId = selectedObject?.kind === 'text' ? selectedObject.id : null;
  const [draft, setDraft] = useState<PropertyDraft>({
    text: '',
    fontSize: 16,
    stroke: '#000000',
    fill: '#ffffff',
    strokeWidth: 2,
    opacity: 1,
  });

  useEffect(() => {
    if (!selectedObject) {
      selectedObjectIdRef.current = null;
      return;
    }
    const nextDraft = makeDraft(selectedObject);
    if (selectedObjectIdRef.current !== selectedObject.id) {
      if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
      changeTimerRef.current = null;
      pendingChangeRef.current = null;
      lastChangeAtRef.current = 0;
      lastSentValuesRef.current = {};
      selectedObjectIdRef.current = selectedObject.id;
      setDraft(nextDraft);
      return;
    }
    setDraft((current) => {
      const synced = { ...current };
      for (const [key, value] of Object.entries(nextDraft)) {
        if (lastSentValuesRef.current[key] !== value) {
          synced[key as keyof PropertyDraft] = value as never;
        }
      }
      return synced;
    });
  }, [selectedObject]);

  useEffect(
    () => () => {
      if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!selectedTextId || !textInputRef.current) return;
    const frame = requestAnimationFrame(() => {
      textInputRef.current?.focus();
      textInputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedTextId]);

  if (selectedObjects.length === 0) return null;

  const obj = selectedObjects[0];
  const isMulti = selectedObjects.length > 1;
  const allIds = selectedObjects.map((o) => o.id);
  const supportsFill = ['rect', 'ellipse', 'vision-cone', 'ability-zone'].includes(obj.kind);
  const supportsDash = obj.kind === 'arrow' || obj.kind === 'line';
  const sendChange = (patch: Partial<CanvasObject>) => {
    const changedEntries = Object.entries(patch).filter(
      ([key, value]) => lastSentValuesRef.current[key] !== value,
    );
    if (changedEntries.length === 0) return;
    changedEntries.forEach(([key, value]) => {
      lastSentValuesRef.current[key] = value;
    });
    onTransform(obj.id, Object.fromEntries(changedEntries) as Partial<CanvasObject>);
  };
  const flushChange = () => {
    const pending = pendingChangeRef.current;
    if (!pending || pending.id !== obj.id) return;
    pendingChangeRef.current = null;
    lastChangeAtRef.current = Date.now();
    sendChange(pending.patch);
  };
  const queueChange = (patch: Partial<CanvasObject>) => {
    const pending = pendingChangeRef.current;
    pendingChangeRef.current = {
      id: obj.id,
      patch: pending?.id === obj.id ? { ...pending.patch, ...patch } : patch,
    };
    const delay = Math.max(0, CHANGE_INTERVAL_MS - (Date.now() - lastChangeAtRef.current));
    if (delay === 0) {
      flushChange();
    } else if (!changeTimerRef.current) {
      changeTimerRef.current = setTimeout(() => {
        changeTimerRef.current = null;
        flushChange();
      }, delay);
    }
  };
  const commit = (patch: Partial<CanvasObject>) => {
    if (changeTimerRef.current) {
      clearTimeout(changeTimerRef.current);
      changeTimerRef.current = null;
    }
    const pending = pendingChangeRef.current;
    pendingChangeRef.current = null;
    lastChangeAtRef.current = Date.now();
    sendChange(pending?.id === obj.id ? { ...pending.patch, ...patch } : patch);
  };
  const commitOnEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur();
  };

  return (
    <div className="absolute bottom-4 right-4 z-10 max-h-[calc(100%-2rem)] w-64 overflow-y-auto rounded-lg border border-border bg-card p-3 shadow-lg">
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
          {obj.kind === 'text' && (
            <div className="mb-3">
              <Label htmlFor={`text-${obj.id}`} className="mb-1.5 block text-xs">
                Text
              </Label>
              <Input
                ref={textInputRef}
                id={`text-${obj.id}`}
                value={draft.text}
                onChange={(event) => {
                  const text = event.target.value;
                  setDraft((current) => ({ ...current, text }));
                  queueChange({ text });
                }}
                onBlur={(event) => commit({ text: event.currentTarget.value })}
                onKeyDown={commitOnEnter}
                className="h-8 text-xs"
              />
              <Label htmlFor={`font-size-${obj.id}`} className="mb-1.5 mt-3 block text-xs">
                Size: {draft.fontSize}px
              </Label>
              <Slider
                id={`font-size-${obj.id}`}
                min={8}
                max={48}
                step={1}
                value={[draft.fontSize]}
                onValueChange={([fontSize]) => {
                  setDraft((current) => ({ ...current, fontSize }));
                  queueChange({ fontSize });
                }}
                onValueCommit={([fontSize]) => commit({ fontSize })}
              />
            </div>
          )}

          <div className="mb-3 grid grid-cols-2 gap-3">
            <label className={supportsFill ? 'block text-xs' : 'col-span-2 block text-xs'}>
              <span className="mb-1.5 flex items-center gap-1 text-muted-foreground">
                <Paintbrush size={12} /> Stroke
              </span>
              <input
                type="color"
                value={draft.stroke}
                onChange={(event) => {
                  const stroke = event.target.value;
                  setDraft((current) => ({ ...current, stroke }));
                  queueChange({ stroke });
                }}
                onBlur={(event) => commit({ stroke: event.currentTarget.value })}
                className="h-8 w-full cursor-pointer rounded border border-input bg-transparent p-1"
              />
            </label>

            {supportsFill && (
              <label className="block text-xs">
                <span className="mb-1.5 flex items-center gap-1 text-muted-foreground">
                  <Palette size={12} /> Fill
                </span>
                <input
                  type="color"
                  value={draft.fill}
                  onChange={(event) => {
                    const fill = event.target.value;
                    setDraft((current) => ({ ...current, fill }));
                    queueChange({ fill });
                  }}
                  onBlur={(event) => commit({ fill: event.currentTarget.value })}
                  disabled={obj.fill === 'transparent'}
                  className="h-8 w-full cursor-pointer rounded border border-input bg-transparent p-1"
                />
                <span className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={obj.fill === 'transparent'}
                    onChange={(event) =>
                      commit({
                        fill: event.target.checked ? 'transparent' : '#ffffff',
                      })
                    }
                    className="h-3.5 w-3.5 accent-primary"
                  />
                  No fill
                </span>
              </label>
            )}
          </div>

          <div className="mb-3">
            <Label htmlFor={`stroke-width-${obj.id}`} className="mb-1.5 block text-xs">
              Stroke width: {draft.strokeWidth}px
            </Label>
            <Slider
              id={`stroke-width-${obj.id}`}
              min={1}
              max={12}
              step={1}
              value={[draft.strokeWidth]}
              onValueChange={([strokeWidth]) => {
                setDraft((current) => ({ ...current, strokeWidth }));
                queueChange({ strokeWidth });
              }}
              onValueCommit={([strokeWidth]) => commit({ strokeWidth })}
            />
          </div>

          {supportsDash && (
            <label className="mb-3 flex h-8 cursor-pointer items-center justify-between text-xs">
              Dashed line
              <input
                type="checkbox"
                checked={obj.dashed}
                onChange={(event) => onTransform(obj.id, { dashed: event.target.checked })}
                className="h-4 w-4 accent-primary"
              />
            </label>
          )}

          {/* Opacity */}
          <div className="mb-3">
            <Label className="mb-1.5 block text-xs">
              Opacity: {Math.round(draft.opacity * 100)}%
            </Label>
            <Slider
              min={0.1}
              max={1}
              step={0.05}
              value={[draft.opacity]}
              onValueChange={([opacity]) => {
                setDraft((current) => ({ ...current, opacity }));
                queueChange({ opacity });
              }}
              onValueCommit={([opacity]) => commit({ opacity })}
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
