'use client';

import { Circle, Text, Group, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import type { CharacterObject } from '@map-planner/core';
import { CHARACTERS, agentIconSrc } from '@map-planner/core';

interface Props {
  object: CharacterObject;
  onSelect?: (id: string, multi: boolean) => void;
  draggable?: boolean;
  onDragEnd?: (id: string, x: number, y: number) => void;
}

const RADIUS = 18;

export function CharacterIcon({ object, onSelect, draggable, onDragEnd }: Props) {
  const charData = CHARACTERS.find((c) => c.id === object.characterId);
  const color = charData?.color ?? '#888';
  const initials = (charData?.name ?? '?').slice(0, 2).toUpperCase();
  const [agentImage, imageStatus] = useImage(charData ? agentIconSrc(charData.id) : '');

  return (
    <Group
      id={object.id}
      x={object.x}
      y={object.y}
      draggable={draggable}
      onClick={(e) => onSelect?.(object.id, e.evt.shiftKey)}
      onTap={() => onSelect?.(object.id, false)}
      onDragEnd={(e) => onDragEnd?.(object.id, e.target.x(), e.target.y())}
    >
      {/* Coloured background circle */}
      <Circle
        radius={RADIUS}
        fill={color}
        stroke={object.team === 'attacker' ? '#ef4444' : '#60a5fa'}
        strokeWidth={2}
        opacity={object.opacity}
      />

      {/* Portrait image clipped to circle, falls back to initials */}
      {imageStatus === 'loaded' && agentImage ? (
        <Group
          clipFunc={(ctx) => {
            ctx.arc(0, 0, RADIUS, 0, Math.PI * 2, false);
          }}
          opacity={object.opacity}
        >
          <KonvaImage
            image={agentImage}
            x={-RADIUS}
            y={-RADIUS}
            width={RADIUS * 2}
            height={RADIUS * 2}
          />
        </Group>
      ) : (
        <Text
          text={initials}
          fontSize={12}
          fontStyle="bold"
          fill="#fff"
          width={RADIUS * 2}
          height={RADIUS * 2}
          x={-RADIUS}
          y={-RADIUS}
          align="center"
          verticalAlign="middle"
          opacity={object.opacity}
        />
      )}

      {/* Team-coloured stroke ring rendered on top so it's not hidden by the image */}
      <Circle
        radius={RADIUS}
        fill="transparent"
        stroke={object.team === 'attacker' ? '#ef4444' : '#60a5fa'}
        strokeWidth={2}
        opacity={object.opacity}
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
