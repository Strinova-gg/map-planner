'use client';

import { Text } from 'react-konva';
import type { TextObject } from '@map-planner/core';

interface Props {
  object: TextObject;
  onSelect?: (id: string, multi: boolean) => void;
  draggable?: boolean;
  onDragEnd?: (id: string, x: number, y: number) => void;
}

export function TextObjectRenderer({ object, onSelect, draggable, onDragEnd }: Props) {
  return (
    <Text
      id={object.id}
      x={object.x}
      y={object.y}
      text={object.text}
      fontSize={object.fontSize}
      fontFamily={object.fontFamily}
      fill={object.stroke}
      opacity={object.opacity}
      draggable={draggable}
      onClick={(e) => onSelect?.(object.id, e.evt.shiftKey)}
      onTap={() => onSelect?.(object.id, false)}
      onDragEnd={(e) => onDragEnd?.(object.id, e.target.x(), e.target.y())}
    />
  );
}
