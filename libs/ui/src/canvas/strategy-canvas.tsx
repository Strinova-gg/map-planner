'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Group, Image as KonvaImage, Transformer, Text as KonvaText } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';
import type { CanvasObject, ToolMode, MapLabel } from '@map-planner/core';
import { CanvasObjectRenderer } from './canvas-object-renderer';

export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 900;
const ERASER_RADIUS = 12;
const ERASER_SAMPLE_SPACING = 6;

function pointNearSegment(
  point: { x: number; y: number },
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): boolean {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const lengthSquared = deltaX * deltaX + deltaY * deltaY;
  const progress = lengthSquared === 0
    ? 0
    : Math.max(0, Math.min(1, ((point.x - startX) * deltaX + (point.y - startY) * deltaY) / lengthSquared));
  return Math.hypot(point.x - (startX + progress * deltaX), point.y - (startY + progress * deltaY)) <= ERASER_RADIUS;
}

interface Props {
  mapImagePath: string;
  workspaceWidth: number;
  workspaceHeight: number;
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
  onEraseObjects: (ids: string[]) => void;
  onCanvasClick: () => void;
  onObjectDragEnd: (id: string, x: number, y: number) => void;
  onTransformEnd: (id: string, patch: Partial<CanvasObject>) => void;
  stageRef?: React.RefObject<Konva.Stage | null>;
  /** Called with image-relative [0–1] fractions on every mouse move over the map */
  onMapHover?: (x: number, y: number) => void;
}

export function StrategyCanvas({
  mapImagePath,
  workspaceWidth,
  workspaceHeight,
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
  onEraseObjects,
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
  const isErasingRef = useRef(false);
  const erasedIdsRef = useRef(new Set<string>());
  const lastEraserPointRef = useRef<{ x: number; y: number } | null>(null);

  const [mapImage] = useImage(mapImagePath);

  // Compute contain-fit bounds so the image is never stretched
  const imgW = mapImage?.naturalWidth ?? CANVAS_WIDTH;
  const imgH = mapImage?.naturalHeight ?? CANVAS_HEIGHT;
  const mapScale = Math.min(CANVAS_WIDTH / imgW, CANVAS_HEIGHT / imgH);
  const mapRenderW = imgW * mapScale;
  const mapRenderH = imgH * mapScale;
  const mapOffsetX = (CANVAS_WIDTH - mapRenderW) / 2;
  const mapOffsetY = (CANVAS_HEIGHT - mapRenderH) / 2;
  const stageWidth = Math.max(CANVAS_WIDTH, workspaceWidth);
  const stageHeight = Math.max(CANVAS_HEIGHT, workspaceHeight);
  const workspaceOffsetX = (stageWidth - CANVAS_WIDTH) / 2;
  const workspaceOffsetY = (stageHeight - CANVAS_HEIGHT) / 2;

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
      return pos
        ? { x: pos.x - workspaceOffsetX, y: pos.y - workspaceOffsetY }
        : { x: 0, y: 0 };
    },
    [stageRef, workspaceOffsetX, workspaceOffsetY],
  );

  const eraseAtPointer = useCallback(() => {
    const stage = stageRef.current;
    const pos = stage?.getPointerPosition();
    if (!stage || !pos || !objectsLayerRef.current) return;
    const previous = lastEraserPointRef.current ?? pos;
    const distance = Math.hypot(pos.x - previous.x, pos.y - previous.y);
    const steps = Math.max(1, Math.ceil(distance / ERASER_SAMPLE_SPACING));
    const newlyErasedIds = new Set<string>();

    for (let step = 0; step <= steps; step += 1) {
      const progress = step / steps;
      const point = {
        x: previous.x + (pos.x - previous.x) * progress,
        y: previous.y + (pos.y - previous.y) * progress,
      };
      for (const object of objects) {
        if (erasedIdsRef.current.has(object.id)) continue;
        const isLineLike = object.kind === 'arrow' || object.kind === 'line' || object.kind === 'freehand';
        const intersects = isLineLike
          ? object.points.slice(2).some((_, index) => {
              if (index % 2 !== 0) return false;
              return pointNearSegment(
                point,
                object.points[index] + workspaceOffsetX,
                object.points[index + 1] + workspaceOffsetY,
                object.points[index + 2] + workspaceOffsetX,
                object.points[index + 3] + workspaceOffsetY,
              );
            })
          : (() => {
              const node = objectsLayerRef.current!.findOne(`#${object.id}`);
              if (!node) return false;
              const rect = node.getClientRect({ relativeTo: stage });
              return (
                point.x >= rect.x - ERASER_RADIUS &&
                point.x <= rect.x + rect.width + ERASER_RADIUS &&
                point.y >= rect.y - ERASER_RADIUS &&
                point.y <= rect.y + rect.height + ERASER_RADIUS
              );
            })();
        if (intersects) {
          erasedIdsRef.current.add(object.id);
          newlyErasedIds.add(object.id);
        }
      }
    }

    lastEraserPointRef.current = pos;
    if (newlyErasedIds.size > 0) {
      onEraseObjects([...newlyErasedIds]);
    }
  }, [objects, onEraseObjects, stageRef, workspaceOffsetX, workspaceOffsetY]);

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (tool === 'eraser') {
        isErasingRef.current = true;
        erasedIdsRef.current.clear();
        lastEraserPointRef.current = null;
        eraseAtPointer();
        return;
      }
      if (e.target === e.target.getStage()) {
        onCanvasClick();
      }
      const { x, y } = getPos(e);
      onMouseDown(x, y);
    },
    [eraseAtPointer, getPos, onMouseDown, onCanvasClick, tool],
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const { x, y } = getPos(e);
      if (tool === 'eraser' && isErasingRef.current) {
        eraseAtPointer();
      } else {
        onMouseMove(x, y);
      }
      if (onMapHover && mapRenderW > 0 && mapRenderH > 0) {
        const fx = (x - mapOffsetX) / mapRenderW;
        const fy = (y - mapOffsetY) / mapRenderH;
        if (fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1) {
          onMapHover(fx, fy);
        }
      }
    },
    [eraseAtPointer, getPos, onMouseMove, onMapHover, mapOffsetX, mapOffsetY, mapRenderW, mapRenderH, tool],
  );

  const handleMouseUp = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const { x, y } = getPos(e);
      if (tool === 'eraser') {
        isErasingRef.current = false;
        lastEraserPointRef.current = null;
        erasedIdsRef.current.clear();
        return;
      }
      onMouseUp(x, y);
    },
    [getPos, onMouseUp, tool],
  );

  const handleMouseLeave = useCallback(() => {
    if (tool !== 'eraser' || !isErasingRef.current) return;
    isErasingRef.current = false;
    lastEraserPointRef.current = null;
    erasedIdsRef.current.clear();
  }, [tool]);

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

  const isDrawing = tool !== 'select' && tool !== 'eraser';
  const cursor = tool === 'eraser' ? 'cell' : isDrawing ? 'crosshair' : 'default';

  return (
    <div style={{ cursor }} className="touch-none select-none">
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Layer 0: Map image */}
        <Layer listening={false}>
          {mapImage && (
            <KonvaImage
              image={mapImage}
              x={workspaceOffsetX + mapOffsetX}
              y={workspaceOffsetY + mapOffsetY}
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
              const lx = workspaceOffsetX + mapOffsetX + label.x * mapRenderW;
              const ly = workspaceOffsetY + mapOffsetY + label.y * mapRenderH;
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
          <Group x={workspaceOffsetX} y={workspaceOffsetY}>
            {objects.map((obj) => (
              <CanvasObjectRenderer
                key={obj.id}
                object={obj}
                onSelect={onObjectClick}
                draggable={tool === 'select' && !obj.locked}
                onDragEnd={onObjectDragEnd}
              />
            ))}
          </Group>
        </Layer>

        {/* Layer 2: In-progress drawing */}
        <Layer listening={false}>
          <Group x={workspaceOffsetX} y={workspaceOffsetY}>
            {inProgressObject && (
              <CanvasObjectRenderer object={inProgressObject} />
            )}
          </Group>
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
