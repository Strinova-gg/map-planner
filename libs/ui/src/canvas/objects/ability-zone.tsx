'use client';

import { Circle, Group } from 'react-konva';
import type { AbilityZoneObject } from '@map-planner/core';

interface Props {
  object: AbilityZoneObject;
  onSelect?: (id: string, multi: boolean) => void;
  draggable?: boolean;
  onDragEnd?: (id: string, x: number, y: number) => void;
}

export function AbilityZone({ object, onSelect, draggable, onDragEnd }: Props) {
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
      <Circle
        radius={Math.max(object.radius, 5)}
        fill={object.fill === 'transparent' ? 'rgba(139,92,246,0.2)' : object.fill}
        stroke={object.stroke}
        strokeWidth={object.strokeWidth}
        dash={[6, 3]}
      />
    </Group>
  );
}
