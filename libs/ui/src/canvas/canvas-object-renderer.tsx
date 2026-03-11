'use client';

import type { CanvasObject } from '@map-planner/core';
import { ArrowObjectRenderer } from './objects/arrow-object';
import { LineObjectRenderer } from './objects/line-object';
import { FreehandObjectRenderer } from './objects/freehand-object';
import { RectObjectRenderer } from './objects/rect-object';
import { EllipseObjectRenderer } from './objects/ellipse-object';
import { TextObjectRenderer } from './objects/text-object';
import { CharacterIcon } from './objects/character-icon';
import { MarkerObjectRenderer } from './objects/marker-object';
import { VisionCone } from './objects/vision-cone';
import { AbilityZone } from './objects/ability-zone';

interface Props {
  object: CanvasObject;
  onSelect?: (id: string, multi: boolean) => void;
  draggable?: boolean;
  onDragEnd?: (id: string, x: number, y: number) => void;
}

export function CanvasObjectRenderer({ object, onSelect, draggable, onDragEnd }: Props) {
  const props = { object: object as never, onSelect, draggable, onDragEnd };

  switch (object.kind) {
    case 'arrow':
      return <ArrowObjectRenderer {...props} object={object} />;
    case 'line':
      return <LineObjectRenderer {...props} object={object} />;
    case 'freehand':
      return <FreehandObjectRenderer {...props} object={object} />;
    case 'rect':
      return <RectObjectRenderer {...props} object={object} />;
    case 'ellipse':
      return <EllipseObjectRenderer {...props} object={object} />;
    case 'text':
      return <TextObjectRenderer {...props} object={object} />;
    case 'character':
      return <CharacterIcon {...props} object={object} />;
    case 'marker':
      return <MarkerObjectRenderer {...props} object={object} />;
    case 'vision-cone':
      return <VisionCone {...props} object={object} />;
    case 'ability-zone':
      return <AbilityZone {...props} object={object} />;
    default:
      return null;
  }
}
