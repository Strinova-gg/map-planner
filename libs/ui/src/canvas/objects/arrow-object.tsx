'use client';

import { Arrow, Line } from 'react-konva';
import type { ArrowObject } from '@map-planner/core';

interface Props {
  object: ArrowObject;
  onSelect?: (id: string, multi: boolean) => void;
  draggable?: boolean;
  onDragEnd?: (id: string, x: number, y: number) => void;
}

export function ArrowObjectRenderer({ object, onSelect, draggable, onDragEnd }: Props) {
  const commonProps = {
    id: object.id,
    points: object.points,
    stroke: object.stroke,
    strokeWidth: object.strokeWidth,
    opacity: object.opacity,
    draggable,
    dash: object.dashed ? [10, 5] : undefined,
    onClick: (e: { evt: MouseEvent }) => onSelect?.(object.id, e.evt.shiftKey),
    onTap: () => onSelect?.(object.id, false),
    onDragEnd: (e: { target: { x: () => number; y: () => number } }) =>
      onDragEnd?.(object.id, e.target.x(), e.target.y()),
  };

  if (object.dashed) {
    return <Line {...commonProps} />;
  }

  return (
    <Arrow
      {...commonProps}
      fill={object.stroke}
      pointerLength={12}
      pointerWidth={10}
    />
  );
}
