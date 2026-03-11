'use client';

import { Rect } from 'react-konva';
import type { RectObject } from '@map-planner/core';

interface Props {
  object: RectObject;
  onSelect?: (id: string, multi: boolean) => void;
  draggable?: boolean;
  onDragEnd?: (id: string, x: number, y: number) => void;
}

export function RectObjectRenderer({ object, onSelect, draggable, onDragEnd }: Props) {
  return (
    <Rect
      id={object.id}
      x={object.x}
      y={object.y}
      width={object.width}
      height={object.height}
      rotation={object.rotation}
      fill={object.fill === 'transparent' ? undefined : object.fill}
      stroke={object.stroke}
      strokeWidth={object.strokeWidth}
      opacity={object.opacity}
      draggable={draggable}
      onClick={(e) => onSelect?.(object.id, e.evt.shiftKey)}
      onTap={() => onSelect?.(object.id, false)}
      onDragEnd={(e) => onDragEnd?.(object.id, e.target.x(), e.target.y())}
    />
  );
}
