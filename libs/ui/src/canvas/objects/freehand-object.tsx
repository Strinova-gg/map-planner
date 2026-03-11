'use client';

import { Line } from 'react-konva';
import type { FreehandObject } from '@map-planner/core';

interface Props {
  object: FreehandObject;
  onSelect?: (id: string, multi: boolean) => void;
  draggable?: boolean;
  onDragEnd?: (id: string, x: number, y: number) => void;
}

export function FreehandObjectRenderer({ object, onSelect, draggable, onDragEnd }: Props) {
  return (
    <Line
      id={object.id}
      points={object.points}
      stroke={object.stroke}
      strokeWidth={object.strokeWidth}
      opacity={object.opacity}
      tension={0.5}
      lineCap="round"
      lineJoin="round"
      draggable={draggable}
      onClick={(e) => onSelect?.(object.id, e.evt.shiftKey)}
      onTap={() => onSelect?.(object.id, false)}
      onDragEnd={(e) => onDragEnd?.(object.id, e.target.x(), e.target.y())}
    />
  );
}
