export type ToolMode =
  | 'select'
  | 'arrow'
  | 'line'
  | 'freehand'
  | 'rect'
  | 'ellipse'
  | 'text'
  | 'character'
  | 'marker'
  | 'vision-cone'
  | 'ability-zone';

export type PhaseLabel = 'pre-round' | 'mid-round' | 'post-plant';
export type MarkerVariant = 'bomb-site' | 'danger' | 'watch-point';
export type CharacterTeam = 'attacker' | 'defender';

interface BaseObject {
  id: string;
  zIndex: number;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  fill: string;
  locked: boolean;
  phaseLabel?: PhaseLabel;
}

export interface ArrowObject extends BaseObject {
  kind: 'arrow';
  points: number[];
  dashed: boolean;
}

export interface LineObject extends BaseObject {
  kind: 'line';
  points: number[];
  dashed: boolean;
}

export interface FreehandObject extends BaseObject {
  kind: 'freehand';
  points: number[];
}

export interface RectObject extends BaseObject {
  kind: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface EllipseObject extends BaseObject {
  kind: 'ellipse';
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  rotation: number;
}

export interface TextObject extends BaseObject {
  kind: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
}

export interface CharacterObject extends BaseObject {
  kind: 'character';
  x: number;
  y: number;
  characterId: string;
  team: CharacterTeam;
  label?: string;
}

export interface MarkerObject extends BaseObject {
  kind: 'marker';
  x: number;
  y: number;
  variant: MarkerVariant;
  label?: string;
}

export interface VisionConeObject extends BaseObject {
  kind: 'vision-cone';
  x: number;
  y: number;
  rotation: number;
  angle: number;
  range: number;
}

export interface AbilityZoneObject extends BaseObject {
  kind: 'ability-zone';
  x: number;
  y: number;
  radius: number;
  characterId?: string;
}

export type CanvasObject =
  | ArrowObject
  | LineObject
  | FreehandObject
  | RectObject
  | EllipseObject
  | TextObject
  | CharacterObject
  | MarkerObject
  | VisionConeObject
  | AbilityZoneObject;
