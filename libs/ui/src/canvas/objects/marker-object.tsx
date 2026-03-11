'use client';

import { Circle, Text, Group, RegularPolygon } from 'react-konva';
import type { MarkerObject } from '@map-planner/core';

interface Props {
  object: MarkerObject;
  onSelect?: (id: string, multi: boolean) => void;
  draggable?: boolean;
  onDragEnd?: (id: string, x: number, y: number) => void;
}

const MARKER_CONFIG = {
  'bomb-site': { color: '#ef4444', symbol: 'B' },
  danger: { color: '#f97316', symbol: '!' },
  'watch-point': { color: '#3b82f6', symbol: '👁' },
} as const;

export function MarkerObjectRenderer({ object, onSelect, draggable, onDragEnd }: Props) {
  const config = MARKER_CONFIG[object.variant];
  const RADIUS = 16;

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
      {object.variant === 'bomb-site' ? (
        <RegularPolygon
          sides={4}
          radius={RADIUS}
          fill={config.color}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
          rotation={45}
        />
      ) : (
        <Circle
          radius={RADIUS}
          fill={config.color}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
        />
      )}
      <Text
        text={config.symbol}
        fontSize={12}
        fontStyle="bold"
        fill="#fff"
        width={RADIUS * 2}
        height={RADIUS * 2}
        x={-RADIUS}
        y={-RADIUS}
        align="center"
        verticalAlign="middle"
      />
      {object.label && (
        <Text
          text={object.label}
          fontSize={10}
          fill="#fff"
          y={RADIUS + 4}
          x={-30}
          width={60}
          align="center"
        />
      )}
    </Group>
  );
}
