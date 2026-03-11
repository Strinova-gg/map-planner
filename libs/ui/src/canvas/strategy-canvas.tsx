'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Text as KonvaText } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';
import type { CanvasObject, ToolMode, MapLabel } from '@map-planner/core';
import { CanvasObjectRenderer } from './canvas-object-renderer';

export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 900;

interface Props {
  mapImagePath: string;
  labels?: ReadonlyArray<MapLabel>;
  showLabels?: boolean;
  objects: CanvasObject[];
  inProgressObject: CanvasObject | null;
  selectedIds: string[];
  tool: ToolMode;
  onMouseDown: (x: number, y: number) => void;
  onMouseMove: (x: number, y: number) => void;
  onMouseUp: (x: number, y: number) => void;
  onObjectClick: (id: string, multi: boolean) => void;
  onCanvasClick: () => void;
  onObjectDragEnd: (id: string, x: number, y: number) => void;
  onTransformEnd: (id: string, patch: Partial<CanvasObject>) => void;
  stageRef?: React.RefObject<Konva.Stage | null>;
  /** Called with image-relative [0–1] fractions on every mouse move over the map */
  onMapHover?: (x: number, y: number) => void;
}

export function StrategyCanvas({
  mapImagePath,
  labels,
  showLabels = true,
  objects,
  inProgressObject,
  selectedIds,
  tool,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onObjectClick,
  onCanvasClick,
  onObjectDragEnd,
  onTransformEnd,
  stageRef: externalStageRef,
  onMapHover,
}: Props) {
  const internalStageRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef ?? internalStageRef;
  const objectsLayerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const [mapImage] = useImage(mapImagePath);

  // Compute contain-fit bounds so the image is never stretched
  const imgW = mapImage?.naturalWidth ?? CANVAS_WIDTH;
  const imgH = mapImage?.naturalHeight ?? CANVAS_HEIGHT;
  const mapScale = Math.min(CANVAS_WIDTH / imgW, CANVAS_HEIGHT / imgH);
  const mapRenderW = imgW * mapScale;
  const mapRenderH = imgH * mapScale;
  const mapOffsetX = (CANVAS_WIDTH - mapRenderW) / 2;
  const mapOffsetY = (CANVAS_HEIGHT - mapRenderH) / 2;

  // Update transformer nodes when selection changes
  useEffect(() => {
    if (!transformerRef.current || !objectsLayerRef.current) return;
    if (tool !== 'select') {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
      return;
    }
    const nodes = selectedIds
      .map((id) => objectsLayerRef.current!.findOne(`#${id}`) as Konva.Node)
      .filter(Boolean);
    transformerRef.current.nodes(nodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedIds, tool, objects]);

  const getPos = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const stage = stageRef.current;
      if (!stage) return { x: 0, y: 0 };
      const pos = stage.getPointerPosition();
      return pos ?? { x: 0, y: 0 };
    },
    [stageRef],
  );

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        onCanvasClick();
      }
      const { x, y } = getPos(e);
      onMouseDown(x, y);
    },
    [getPos, onMouseDown, onCanvasClick],
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const { x, y } = getPos(e);
      onMouseMove(x, y);
      if (onMapHover && mapRenderW > 0 && mapRenderH > 0) {
        const fx = (x - mapOffsetX) / mapRenderW;
        const fy = (y - mapOffsetY) / mapRenderH;
        if (fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1) {
          onMapHover(fx, fy);
        }
      }
    },
    [getPos, onMouseMove, onMapHover, mapOffsetX, mapOffsetY, mapRenderW, mapRenderH],
  );

  const handleMouseUp = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const { x, y } = getPos(e);
      onMouseUp(x, y);
    },
    [getPos, onMouseUp],
  );

  const handleTransformEnd = useCallback(() => {
    if (!transformerRef.current) return;
    const nodes = transformerRef.current.nodes();
    nodes.forEach((node) => {
      const id = node.id();
      onTransformEnd(id, {
        x: node.x(),
        y: node.y(),
        ...(node.rotation() !== 0 ? { rotation: node.rotation() } : {}),
      });
      node.scaleX(1);
      node.scaleY(1);
    });
  }, [onTransformEnd]);

  const isDrawing = tool !== 'select';
  const cursor = isDrawing ? 'crosshair' : 'default';

  return (
    <div style={{ cursor }} className="touch-none select-none">
      <Stage
        ref={stageRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Layer 0: Map image */}
        <Layer listening={false}>
          {mapImage && (
            <KonvaImage
              image={mapImage}
              x={mapOffsetX}
              y={mapOffsetY}
              width={mapRenderW}
              height={mapRenderH}
            />
          )}
          {!mapImage && null}
        </Layer>

        {/* Layer 1: Callout labels */}
        {showLabels && labels && labels.length > 0 && (
          <Layer listening={false}>
            {labels.map((label) => {
              const lx = mapOffsetX + label.x * mapRenderW;
              const ly = mapOffsetY + label.y * mapRenderH;
              const w = 140;
              return (
                <KonvaText
                  key={label.name}
                  text={label.name}
                  x={lx - w / 2}
                  y={ly}
                  width={w}
                  align="center"
                  fontSize={11}
                  fontFamily="sans-serif"
                  fill="rgba(255,255,255,0.90)"
                  shadowColor="black"
                  shadowBlur={4}
                  shadowOpacity={0.9}
                />
              );
            })}
          </Layer>
        )}

        {/* Layer 2: Committed objects — placed on top of labels */}
        <Layer ref={objectsLayerRef}>
          {objects.map((obj) => (
            <CanvasObjectRenderer
              key={obj.id}
              object={obj}
              onSelect={onObjectClick}
              draggable={tool === 'select' && !obj.locked}
              onDragEnd={onObjectDragEnd}
            />
          ))}
        </Layer>

        {/* Layer 2: In-progress drawing */}
        <Layer listening={false}>
          {inProgressObject && (
            <CanvasObjectRenderer object={inProgressObject} />
          )}
        </Layer>

        {/* Layer 3: Transformer */}
        <Layer>
          <Transformer
            ref={transformerRef}
            onTransformEnd={handleTransformEnd}
            boundBoxFunc={(oldBox, newBox) => {
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox;
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}
