import { setup, assign } from 'xstate';
import { nanoid } from 'nanoid';
import type { CanvasObject, ToolMode, MarkerVariant, CharacterTeam } from '../types/canvas';

const MIN_SIZE = 10;

export type CanvasContext = {
  tool: ToolMode;
  selectedIds: string[];
  activeColor: string;
  activeFill: string;
  activeStrokeWidth: number;
  activeOpacity: number;
  activeCharacterId: string | null;
  activeCharacterTeam: CharacterTeam;
  activeMarkerVariant: MarkerVariant;
  drawStart: { x: number; y: number } | null;
  inProgressPoints: number[];
  inProgressObject: CanvasObject | null;
  pendingCommit: CanvasObject | null;
};

export type CanvasEvent =
  | { type: 'SELECT_TOOL'; tool: ToolMode }
  | { type: 'SET_CHARACTER'; characterId: string; team: CharacterTeam }
  | { type: 'SET_MARKER_VARIANT'; variant: MarkerVariant }
  | { type: 'SET_COLOR'; color: string }
  | { type: 'SET_FILL'; fill: string }
  | { type: 'SET_STROKE_WIDTH'; width: number }
  | { type: 'SET_OPACITY'; opacity: number }
  | { type: 'MOUSE_DOWN'; x: number; y: number }
  | { type: 'MOUSE_MOVE'; x: number; y: number }
  | { type: 'MOUSE_UP'; x: number; y: number }
  | { type: 'OBJECT_CLICK'; id: string; multi: boolean }
  | { type: 'CANVAS_CLICK' }
  | { type: 'CLEAR_PENDING_COMMIT' };

function makeBase(ctx: CanvasContext) {
  return {
    id: nanoid(),
    zIndex: 0,
    stroke: ctx.activeColor,
    strokeWidth: ctx.activeStrokeWidth,
    opacity: ctx.activeOpacity,
    fill: ctx.activeFill,
    locked: false,
  };
}

export const canvasMachine = setup({
  types: {
    context: {} as CanvasContext,
    events: {} as CanvasEvent,
  },
  actions: {
    setTool: assign({
      tool: ({ event }) => (event.type === 'SELECT_TOOL' ? event.tool : 'select'),
      selectedIds: () => [],
    }),
    setColor: assign({
      activeColor: ({ event }) => (event.type === 'SET_COLOR' ? event.color : '#e11d48'),
    }),
    setFill: assign({
      activeFill: ({ event }) => (event.type === 'SET_FILL' ? event.fill : 'transparent'),
    }),
    setStrokeWidth: assign({
      activeStrokeWidth: ({ event }) => (event.type === 'SET_STROKE_WIDTH' ? event.width : 2),
    }),
    setOpacity: assign({
      activeOpacity: ({ event }) => (event.type === 'SET_OPACITY' ? event.opacity : 1),
    }),
    setCharacter: assign({
      activeCharacterId: ({ event }) =>
        event.type === 'SET_CHARACTER' ? event.characterId : null,
      activeCharacterTeam: ({ event }) =>
        event.type === 'SET_CHARACTER' ? event.team : 'attacker',
    }),
    setMarkerVariant: assign({
      activeMarkerVariant: ({ event }) =>
        event.type === 'SET_MARKER_VARIANT' ? event.variant : 'bomb-site',
    }),
    updateSelection: assign({
      selectedIds: ({ context, event }) => {
        if (event.type !== 'OBJECT_CLICK') return context.selectedIds;
        if (event.multi) {
          return context.selectedIds.includes(event.id)
            ? context.selectedIds.filter((id) => id !== event.id)
            : [...context.selectedIds, event.id];
        }
        return [event.id];
      },
    }),
    clearSelection: assign({ selectedIds: () => [] }),
    clearPendingCommit: assign({ pendingCommit: () => null }),

    initDraw: assign(({ context, event }) => {
      if (event.type !== 'MOUSE_DOWN') return {};
      const { x, y } = event;
      const base = makeBase(context);

      switch (context.tool) {
        case 'arrow':
          return {
            drawStart: { x, y },
            inProgressPoints: [x, y, x, y],
            inProgressObject: {
              ...base,
              kind: 'arrow' as const,
              points: [x, y, x, y],
              dashed: false,
            },
          };
        case 'line':
          return {
            drawStart: { x, y },
            inProgressPoints: [x, y, x, y],
            inProgressObject: {
              ...base,
              kind: 'line' as const,
              points: [x, y, x, y],
              dashed: false,
            },
          };
        case 'freehand':
          return {
            drawStart: { x, y },
            inProgressPoints: [x, y],
            inProgressObject: {
              ...base,
              kind: 'freehand' as const,
              points: [x, y],
            },
          };
        case 'rect':
          return {
            drawStart: { x, y },
            inProgressObject: {
              ...base,
              kind: 'rect' as const,
              x,
              y,
              width: 0,
              height: 0,
              rotation: 0,
            },
          };
        case 'ellipse':
          return {
            drawStart: { x, y },
            inProgressObject: {
              ...base,
              kind: 'ellipse' as const,
              x,
              y,
              radiusX: 0,
              radiusY: 0,
              rotation: 0,
            },
          };
        case 'text':
          return {
            drawStart: { x, y },
            inProgressObject: {
              ...base,
              kind: 'text' as const,
              x,
              y,
              text: 'Text',
              fontSize: 16,
              fontFamily: 'sans-serif',
            },
          };
        case 'vision-cone':
          return {
            drawStart: { x, y },
            inProgressObject: {
              ...base,
              kind: 'vision-cone' as const,
              x,
              y,
              rotation: 0,
              angle: 60,
              range: 0,
            },
          };
        case 'ability-zone':
          return {
            drawStart: { x, y },
            inProgressObject: {
              ...base,
              kind: 'ability-zone' as const,
              x,
              y,
              radius: 0,
            },
          };
        default:
          return {};
      }
    }),

    placeInstant: assign(({ context, event }) => {
      if (event.type !== 'MOUSE_DOWN') return {};
      const { x, y } = event;
      const base = makeBase(context);

      if (context.tool === 'character' && context.activeCharacterId) {
        return {
          pendingCommit: {
            ...base,
            kind: 'character' as const,
            x,
            y,
            characterId: context.activeCharacterId,
            team: context.activeCharacterTeam,
          },
        };
      }
      if (context.tool === 'marker') {
        return {
          pendingCommit: {
            ...base,
            kind: 'marker' as const,
            x,
            y,
            variant: context.activeMarkerVariant,
          },
        };
      }
      return {};
    }),

    updateDraw: assign(({ context, event }) => {
      if (event.type !== 'MOUSE_MOVE' || !context.inProgressObject || !context.drawStart) return {};
      const { x, y } = event;
      const { drawStart } = context;

      switch (context.tool) {
        case 'arrow':
        case 'line':
          return {
            inProgressObject: {
              ...context.inProgressObject,
              points: [drawStart.x, drawStart.y, x, y],
            } as CanvasObject,
          };
        case 'freehand': {
          const newPoints = [...context.inProgressPoints, x, y];
          return {
            inProgressPoints: newPoints,
            inProgressObject: {
              ...context.inProgressObject,
              points: newPoints,
            } as CanvasObject,
          };
        }
        case 'rect': {
          const w = x - drawStart.x;
          const h = y - drawStart.y;
          return {
            inProgressObject: {
              ...context.inProgressObject,
              x: w >= 0 ? drawStart.x : x,
              y: h >= 0 ? drawStart.y : y,
              width: Math.abs(w),
              height: Math.abs(h),
            } as CanvasObject,
          };
        }
        case 'ellipse': {
          const rX = Math.abs(x - drawStart.x) / 2;
          const rY = Math.abs(y - drawStart.y) / 2;
          return {
            inProgressObject: {
              ...context.inProgressObject,
              x: (drawStart.x + x) / 2,
              y: (drawStart.y + y) / 2,
              radiusX: rX,
              radiusY: rY,
            } as CanvasObject,
          };
        }
        case 'vision-cone': {
          const dx = x - drawStart.x;
          const dy = y - drawStart.y;
          return {
            inProgressObject: {
              ...context.inProgressObject,
              range: Math.sqrt(dx * dx + dy * dy),
              rotation: Math.atan2(dy, dx) * (180 / Math.PI),
            } as CanvasObject,
          };
        }
        case 'ability-zone': {
          const dx = x - drawStart.x;
          const dy = y - drawStart.y;
          return {
            inProgressObject: {
              ...context.inProgressObject,
              radius: Math.sqrt(dx * dx + dy * dy),
            } as CanvasObject,
          };
        }
        default:
          return {};
      }
    }),

    finalizeDraw: assign(({ context }) => {
      const obj = context.inProgressObject;
      if (!obj) return { inProgressObject: null, inProgressPoints: [], drawStart: null };

      let isValid = false;
      switch (obj.kind) {
        case 'arrow':
        case 'line': {
          const dx = obj.points[2] - obj.points[0];
          const dy = obj.points[3] - obj.points[1];
          isValid = Math.sqrt(dx * dx + dy * dy) >= MIN_SIZE;
          break;
        }
        case 'freehand':
          isValid = obj.points.length >= 6;
          break;
        case 'rect':
          isValid = obj.width >= MIN_SIZE && obj.height >= MIN_SIZE;
          break;
        case 'ellipse':
          isValid = obj.radiusX >= MIN_SIZE / 2 && obj.radiusY >= MIN_SIZE / 2;
          break;
        case 'text':
        case 'vision-cone':
        case 'ability-zone':
          isValid = true;
          break;
      }

      return {
        pendingCommit: isValid ? obj : null,
        inProgressObject: null,
        inProgressPoints: [],
        drawStart: null,
      };
    }),
  },
}).createMachine({
  id: 'canvas',
  initial: 'idle',
  context: {
    tool: 'select',
    selectedIds: [],
    activeColor: '#e11d48',
    activeFill: 'transparent',
    activeStrokeWidth: 2,
    activeOpacity: 1,
    activeCharacterId: null,
    activeCharacterTeam: 'attacker',
    activeMarkerVariant: 'bomb-site',
    drawStart: null,
    inProgressPoints: [],
    inProgressObject: null,
    pendingCommit: null,
  },
  on: {
    SET_COLOR: { actions: 'setColor' },
    SET_FILL: { actions: 'setFill' },
    SET_STROKE_WIDTH: { actions: 'setStrokeWidth' },
    SET_OPACITY: { actions: 'setOpacity' },
    SET_CHARACTER: { actions: 'setCharacter' },
    SET_MARKER_VARIANT: { actions: 'setMarkerVariant' },
    CLEAR_PENDING_COMMIT: { actions: 'clearPendingCommit' },
    SELECT_TOOL: [
      {
        guard: ({ event }) => event.type === 'SELECT_TOOL' && event.tool === 'select',
        target: '.idle',
        actions: 'setTool',
      },
      {
        target: '.drawing.ready',
        actions: 'setTool',
      },
    ],
  },
  states: {
    idle: {
      on: {
        OBJECT_CLICK: { actions: 'updateSelection' },
        CANVAS_CLICK: { actions: 'clearSelection' },
      },
    },
    drawing: {
      initial: 'ready',
      states: {
        ready: {
          on: {
            MOUSE_DOWN: [
              {
                guard: ({ context }) =>
                  context.tool === 'character' || context.tool === 'marker',
                actions: 'placeInstant',
              },
              {
                target: 'active',
                actions: 'initDraw',
              },
            ],
          },
        },
        active: {
          on: {
            MOUSE_MOVE: { actions: 'updateDraw' },
            MOUSE_UP: {
              target: 'ready',
              actions: 'finalizeDraw',
            },
          },
        },
      },
    },
  },
});
