'use client';

import { Ellipse } from 'react-konva';
import type { EllipseObject } from '@map-planner/core';

interface Props {
  object: EllipseObject;
  onSelect?: (id: string, multi: boolean) => void;
  draggable?: boolean;
  onDragEnd?: (id: string, x: number, y: number) => void;
}

export function EllipseObjectRenderer({ object, onSelect, draggable, onDragEnd }: Props) {
  return (
    <Ellipse
      id={object.id}
      x={object.x}
      y={object.y}
      radiusX={object.radiusX}
      radiusY={object.radiusY}
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
