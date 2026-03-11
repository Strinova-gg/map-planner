'use client';

import { Wedge, Circle, Group } from 'react-konva';
import type { VisionConeObject } from '@map-planner/core';

interface Props {
  object: VisionConeObject;
  onSelect?: (id: string, multi: boolean) => void;
  draggable?: boolean;
  onDragEnd?: (id: string, x: number, y: number) => void;
}

export function VisionCone({ object, onSelect, draggable, onDragEnd }: Props) {
  return (
    <Group
      id={object.id}
      x={object.x}
      y={object.y}
      draggable={draggable}
      opacity={object.opacity}
      onClick={(e) => onSelect?.(object.id, e.evt.shiftKey)}
      onTap={() => onSelect?.(object.id, false)}
      onDragEnd={(e) => onDragEnd?.(object.id, e.target.x(), e.target.y())}
    >
      <Wedge
        radius={Math.max(object.range, 10)}
        angle={object.angle}
        rotation={object.rotation - object.angle / 2}
        fill={object.fill === 'transparent' ? 'rgba(251,191,36,0.25)' : object.fill}
        stroke={object.stroke}
        strokeWidth={object.strokeWidth}
      />
      <Circle radius={4} fill={object.stroke} />
    </Group>
  );
}
