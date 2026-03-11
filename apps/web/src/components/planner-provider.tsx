'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMachine } from '@xstate/react';
import { canvasMachine, strategyMachine } from '@map-planner/core';
import type { CharacterTeam } from '@map-planner/core';
import { PlannerLayout } from '@map-planner/ui';

interface Props {
  strategyId: string;
}

export function PlannerProvider({ strategyId }: Props) {
  const router = useRouter();
  const [canvasState, canvasSend] = useMachine(canvasMachine);
  const [strategyState, strategySend] = useMachine(strategyMachine, {
    input: { strategyId },
  });

  // Compute the active objects from mode/halves/plans
  const sCtx = strategyState.context;
  const activeObjects = useMemo(() => {
    if (sCtx.mode === 'custom') return sCtx.objects;
    const half = sCtx.halves.find((h) => h.id === sCtx.activeHalfId);
    if (!half) return [];
    const plan = half.plans.find((p) => p.id === sCtx.activePlanId);
    return plan?.objects ?? [];
  }, [sCtx]);

  // Set of characterIds already placed on the current plan
  const placedCharacterIds = useMemo(
    () =>
      new Set(
        activeObjects
          .filter((o) => o.kind === 'character')
          .map((o) => (o as Extract<typeof o, { kind: 'character' }>).characterId),
      ),
    [activeObjects],
  );

  // Forward pendingCommit from canvas machine to strategy machine
  useEffect(() => {
    const pending = canvasState.context.pendingCommit;
    if (!pending) return;
    
    const isCustomMode = sCtx.mode === 'custom';
    
    // In default mode, check if already placed with same team and move instead
    if (!isCustomMode && pending.kind === 'character') {
      const existing = activeObjects.find(
        (o) => o.kind === 'character' && 
               (o as Extract<typeof o, { kind: 'character' }>).characterId === pending.characterId &&
               (o as Extract<typeof o, { kind: 'character' }>).team === pending.team
      );
      if (existing) {
        strategySend({ type: 'TRANSFORM_OBJECT', id: existing.id, patch: { x: pending.x, y: pending.y } });
        canvasSend({ type: 'CLEAR_PENDING_COMMIT' });
        return;
      }
    }
    
    strategySend({ type: 'COMMIT_OBJECTS', objects: [...activeObjects, pending] });
    
    // In custom mode, switch back to select tool after placing
    if (isCustomMode) {
      canvasSend({ type: 'SELECT_TOOL', tool: 'select' });
    }
    
    canvasSend({ type: 'CLEAR_PENDING_COMMIT' });
  }, [canvasState.context.pendingCommit, activeObjects, sCtx.mode, strategySend, canvasSend]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        strategySend({ type: 'UNDO' });
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        strategySend({ type: 'REDO' });
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        strategySend({ type: 'SAVE' });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const ids = canvasState.context.selectedIds;
        if (ids.length > 0) {
          strategySend({ type: 'DELETE_OBJECTS', ids });
          canvasSend({ type: 'SELECT_TOOL', tool: 'select' });
        }
      } else if (e.key === 'Escape') {
        canvasSend({ type: 'SELECT_TOOL', tool: 'select' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canvasState.context.selectedIds, canvasSend, strategySend]);

  const ctx = canvasState.context;

  const handleDeleteObjects = useCallback(
    (ids: string[]) => {
      strategySend({ type: 'DELETE_OBJECTS', ids });
      canvasSend({ type: 'SELECT_TOOL', tool: 'select' });
    },
    [strategySend, canvasSend],
  );

  const handleSelectCharacter = useCallback(
    (id: string, team: CharacterTeam) => {
      canvasSend({ type: 'SET_CHARACTER', characterId: id, team });
    },
    [canvasSend],
  );

  return (
    <PlannerLayout
      // Canvas state
      tool={ctx.tool}
      selectedIds={ctx.selectedIds}
      activeColor={ctx.activeColor}
      activeFill={ctx.activeFill}
      activeStrokeWidth={ctx.activeStrokeWidth}
      activeCharacterId={ctx.activeCharacterId}
      activeCharacterTeam={ctx.activeCharacterTeam}
      activeMarkerVariant={ctx.activeMarkerVariant}
      placedCharacterIds={placedCharacterIds}
      inProgressObject={ctx.inProgressObject}
      // Strategy state
      mapSlug={sCtx.mapSlug}
      title={sCtx.title}
      objects={activeObjects}
      isDirty={sCtx.isDirty}
      isSaving={strategyState.matches({ editing: 'saving' })}
      canUndo={sCtx.past.length > 0}
      canRedo={sCtx.future.length > 0}
      mode={sCtx.mode}
      halves={sCtx.halves}
      activeHalfId={sCtx.activeHalfId}
      activePlanId={sCtx.activePlanId}
      // Canvas dispatchers
      onToolSelect={(tool) => canvasSend({ type: 'SELECT_TOOL', tool })}
      onColorChange={(color) => canvasSend({ type: 'SET_COLOR', color })}
      onFillChange={(fill) => canvasSend({ type: 'SET_FILL', fill })}
      onStrokeWidthChange={(width) => canvasSend({ type: 'SET_STROKE_WIDTH', width })}
      onSelectCharacter={handleSelectCharacter}
      onSelectMarker={(variant) => canvasSend({ type: 'SET_MARKER_VARIANT', variant })}
      onMouseDown={(x, y) => canvasSend({ type: 'MOUSE_DOWN', x, y })}
      onMouseMove={(x, y) => canvasSend({ type: 'MOUSE_MOVE', x, y })}
      onMouseUp={(x, y) => canvasSend({ type: 'MOUSE_UP', x, y })}
      onObjectClick={(id, multi) => canvasSend({ type: 'OBJECT_CLICK', id, multi })}
      onCanvasClick={() => canvasSend({ type: 'CANVAS_CLICK' })}
      // Strategy dispatchers
      onTitleChange={(title) => strategySend({ type: 'SET_TITLE', title })}
      onUndo={() => strategySend({ type: 'UNDO' })}
      onRedo={() => strategySend({ type: 'REDO' })}
      onSave={() => strategySend({ type: 'SAVE' })}
      onHome={() => router.push('/')}
      onDeleteObjects={handleDeleteObjects}
      onTransformObject={(id, patch) => strategySend({ type: 'TRANSFORM_OBJECT', id, patch })}
      onSetMode={(mode) => strategySend({ type: 'SET_MODE', mode })}
      onAddHalf={() => strategySend({ type: 'ADD_HALF' })}
      onRemoveHalf={(halfId) => strategySend({ type: 'REMOVE_HALF', halfId })}
      onSelectHalf={(halfId) => strategySend({ type: 'SELECT_HALF', halfId })}
      onUpdateHalfTeams={(halfId, attackerIds, defenderIds) =>
        strategySend({ type: 'UPDATE_HALF_TEAMS', halfId, attackerIds, defenderIds })
      }
      onAddPlan={() => strategySend({ type: 'ADD_PLAN' })}
      onRemovePlan={(planId) => strategySend({ type: 'REMOVE_PLAN', planId })}
      onSelectPlan={(planId) => strategySend({ type: 'SELECT_PLAN', planId })}
    />
  );
}
