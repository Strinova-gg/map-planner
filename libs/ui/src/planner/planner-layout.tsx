'use client';

import { useRef, useCallback, useState } from 'react';
import type Konva from 'konva';
import type { CanvasObject, ToolMode, MarkerVariant, CharacterTeam } from '@map-planner/core';
import type { StrategyMode, Half } from '@map-planner/core';
import { MAPS } from '@map-planner/core';
import { TooltipProvider } from '../components/tooltip';
import { ToolToolbar } from './tool-toolbar';
import { StrategySidebar } from './strategy-sidebar';
import { StrategyTopbar } from './strategy-topbar';
import { PropertyPanel } from './property-panel';
import { StrategyCanvas } from '../canvas/strategy-canvas';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;

interface Props {
  // Canvas machine state
  tool: ToolMode;
  selectedIds: string[];
  activeColor: string;
  activeFill: string;
  activeStrokeWidth: number;
  activeCharacterId: string | null;
  activeCharacterTeam: CharacterTeam;
  activeMarkerVariant: MarkerVariant;
  placedCharacterIds: Set<string>;
  inProgressObject: CanvasObject | null;

  // Strategy machine state
  mapSlug: string;
  title: string;
  objects: CanvasObject[];
  isDirty: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  // Strategy mode/halves/plans state
  mode: StrategyMode;
  halves: Half[];
  activeHalfId: string | null;
  activePlanId: string | null;

  // Canvas machine dispatchers
  onToolSelect: (tool: ToolMode) => void;
  onColorChange: (color: string) => void;
  onFillChange: (fill: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onSelectCharacter: (id: string, team: CharacterTeam) => void;
  onSelectMarker: (variant: MarkerVariant) => void;
  onMouseDown: (x: number, y: number) => void;
  onMouseMove: (x: number, y: number) => void;
  onMouseUp: (x: number, y: number) => void;
  onObjectClick: (id: string, multi: boolean) => void;
  onCanvasClick: () => void;

  // Strategy machine dispatchers
  onTitleChange: (title: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onHome: () => void;
  onDeleteObjects: (ids: string[]) => void;
  onTransformObject: (id: string, patch: Partial<CanvasObject>) => void;
  // Strategy mode/halves/plans handlers
  onSetMode: (mode: StrategyMode) => void;
  onAddHalf: () => void;
  onRemoveHalf: (halfId: string) => void;
  onSelectHalf: (halfId: string) => void;
  onUpdateHalfTeams: (halfId: string, attackerIds: string[], defenderIds: string[]) => void;
  onAddPlan: () => void;
  onRemovePlan: (planId: string) => void;
  onSelectPlan: (planId: string) => void;
}

export function PlannerLayout({
  tool,
  selectedIds,
  activeColor,
  activeFill,
  activeStrokeWidth,
  activeCharacterId,
  activeCharacterTeam,
  activeMarkerVariant,
  placedCharacterIds,
  inProgressObject,
  mapSlug,
  title,
  objects,
  isDirty,
  isSaving,
  canUndo,
  canRedo,
  mode,
  halves,
  activeHalfId,
  activePlanId,
  onToolSelect,
  onColorChange,
  onFillChange,
  onStrokeWidthChange,
  onSelectCharacter,
  onSelectMarker,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onObjectClick,
  onCanvasClick,
  onTitleChange,
  onUndo,
  onRedo,
  onSave,
  onHome,
  onDeleteObjects,
  onTransformObject,
  onSetMode,
  onAddHalf,
  onRemoveHalf,
  onSelectHalf,
  onUpdateHalfTeams,
  onAddPlan,
  onRemovePlan,
  onSelectPlan,
}: Props) {
  const stageRef = useRef<Konva.Stage>(null);
  const [zoom, setZoom] = useState(1.0);
  const [showLabels, setShowLabels] = useState(true);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  const mapMeta = MAPS.find((m) => m.slug === mapSlug);

  const handleExportPng = useCallback(() => {
    if (!stageRef.current) return;
    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${title || 'strategy'}.png`;
    a.click();
  }, [title]);

  const handleObjectDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      onTransformObject(id, { x, y });
    },
    [onTransformObject],
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.001)));
  }, []);

  const selectedObjects = objects.filter((o) => selectedIds.includes(o.id));

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen flex-col bg-background">
        <StrategyTopbar
          title={title}
          mapName={mapMeta?.displayName ?? mapSlug}
          isDirty={isDirty}
          isSaving={isSaving}
          canUndo={canUndo}
          canRedo={canRedo}
          showLabels={showLabels}
          onTitleChange={onTitleChange}
          onUndo={onUndo}
          onRedo={onRedo}
          onSave={onSave}
          onExportPng={handleExportPng}
          onToggleLabels={() => setShowLabels((v) => !v)}
          onHome={onHome}
        />

        <div className="flex flex-1 overflow-hidden">
          <ToolToolbar
            currentTool={tool}
            onToolSelect={onToolSelect}
            activeColor={activeColor}
            activeFill={activeFill}
            activeStrokeWidth={activeStrokeWidth}
            onColorChange={onColorChange}
            onFillChange={onFillChange}
            onStrokeWidthChange={onStrokeWidthChange}
          />

          {/* Canvas area */}
          <div
            className="relative flex flex-1 items-center justify-center overflow-auto bg-[#0a0a0a]"
            onWheel={handleWheel}
          >
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.05s ease-out',
              }}
            >
              <StrategyCanvas
                mapImagePath={mapMeta?.imagePath ?? ''}
                labels={mapMeta?.labels}
                showLabels={showLabels}
                objects={objects}
                inProgressObject={inProgressObject}
                selectedIds={selectedIds}
                tool={tool}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onObjectClick={onObjectClick}
                onCanvasClick={onCanvasClick}
                onObjectDragEnd={handleObjectDragEnd}
                onTransformEnd={onTransformObject}
                stageRef={stageRef}
                onMapHover={(x, y) => setHoverCoords({ x, y })}
              />
            </div>

            {/* Zoom controls + coordinate readout */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-md border border-border bg-card/90 px-2 py-1 shadow-md backdrop-blur-sm">
              {hoverCoords && (
                <>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {hoverCoords.x.toFixed(3)}, {hoverCoords.y.toFixed(3)}
                  </span>
                  <div className="mx-1 h-3 w-px bg-border" />
                </>
              )}
              <button
                className="flex h-6 w-6 items-center justify-center rounded text-sm text-foreground hover:bg-muted disabled:opacity-40"
                onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))}
                disabled={zoom <= MIN_ZOOM}
              >
                −
              </button>
              <button
                className="min-w-[3rem] text-center text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setZoom(1.0)}
                title="Reset zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                className="flex h-6 w-6 items-center justify-center rounded text-sm text-foreground hover:bg-muted disabled:opacity-40"
                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))}
                disabled={zoom >= MAX_ZOOM}
              >
                +
              </button>
            </div>

            <PropertyPanel
              selectedObjects={selectedObjects}
              onDelete={onDeleteObjects}
              onTransform={onTransformObject}
            />
          </div>

          <StrategySidebar
            activeCharacterId={activeCharacterId}
            activeCharacterTeam={activeCharacterTeam}
            activeMarkerVariant={activeMarkerVariant}
            placedCharacterIds={placedCharacterIds}
            canvasObjects={objects}
            onSelectCharacter={(id, team) => {
              onSelectCharacter(id, team);
              onToolSelect('character');
            }}
            onSelectMarker={(variant) => {
              onSelectMarker(variant);
              onToolSelect('marker');
            }}
            mode={mode}
            halves={halves}
            activeHalfId={activeHalfId}
            activePlanId={activePlanId}
            onSetMode={onSetMode}
            onAddHalf={onAddHalf}
            onRemoveHalf={onRemoveHalf}
            onSelectHalf={onSelectHalf}
            onUpdateHalfTeams={onUpdateHalfTeams}
            onAddPlan={onAddPlan}
            onRemovePlan={onRemovePlan}
            onSelectPlan={onSelectPlan}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
