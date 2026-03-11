'use client';

import { Line } from 'react-konva';
import type { LineObject } from '@map-planner/core';

interface Props {
  object: LineObject;
  onSelect?: (id: string, multi: boolean) => void;
  draggable?: boolean;
  onDragEnd?: (id: string, x: number, y: number) => void;
}

export function LineObjectRenderer({ object, onSelect, draggable, onDragEnd }: Props) {
  return (
    <Line
      id={object.id}
      points={object.points}
      stroke={object.stroke}
      strokeWidth={object.strokeWidth}
      opacity={object.opacity}
      draggable={draggable}
      dash={object.dashed ? [10, 5] : undefined}
      onClick={(e) => onSelect?.(object.id, e.evt.shiftKey)}
      onTap={() => onSelect?.(object.id, false)}
      onDragEnd={(e) => onDragEnd?.(object.id, e.target.x(), e.target.y())}
    />
  );
}
