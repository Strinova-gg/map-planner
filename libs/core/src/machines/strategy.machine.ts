import { setup, assign, fromPromise } from 'xstate';
import { nanoid } from 'nanoid';
import type { CanvasObject } from '../types/canvas';
import type { Strategy, StrategyMode, Half, Plan } from '../types/strategy';
import { localDb } from '../local-db';

const MAX_HISTORY = 50;

export type StrategyContext = {
  strategyId: string;
  mapSlug: string;
  title: string;
  mode: StrategyMode;
  halves: Half[];
  activeHalfId: string | null;
  activePlanId: string | null;
  objects: CanvasObject[];
  past: CanvasObject[][];
  future: CanvasObject[][];
  isDirty: boolean;
  saveError: string | null;
};

export type StrategyInput = { strategyId: string };

export type StrategyEvent =
  | { type: 'COMMIT_OBJECTS'; objects: CanvasObject[] }
  | { type: 'DELETE_OBJECTS'; ids: string[] }
  | { type: 'TRANSFORM_OBJECT'; id: string; patch: Partial<CanvasObject> }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE' }
  | { type: 'SET_TITLE'; title: string }
  | { type: 'SET_MODE'; mode: StrategyMode }
  | { type: 'ADD_HALF' }
  | { type: 'REMOVE_HALF'; halfId: string }
  | { type: 'SELECT_HALF'; halfId: string }
  | { type: 'RENAME_HALF'; halfId: string; name: string }
  | { type: 'UPDATE_HALF_TEAMS'; halfId: string; attackerIds: string[]; defenderIds: string[] }
  | { type: 'ADD_PLAN' }
  | { type: 'REMOVE_PLAN'; planId: string }
  | { type: 'SELECT_PLAN'; planId: string }
  | { type: 'RENAME_PLAN'; planId: string; name: string };

function makePlan(name: string): Plan {
  return { id: nanoid(), name, objects: [] };
}

function makeHalf(name: string): Half {
  return { id: nanoid(), name, attackerIds: [], defenderIds: [], plans: [makePlan('Plan 1')] };
}

function pushHistory(past: CanvasObject[][], current: CanvasObject[]): CanvasObject[][] {
  return [...past, current].slice(-MAX_HISTORY);
}

function getActiveObjects(ctx: StrategyContext): CanvasObject[] {
  if (ctx.mode === 'custom') return ctx.objects;
  const half = ctx.halves.find((h) => h.id === ctx.activeHalfId);
  if (!half) return [];
  const plan = half.plans.find((p) => p.id === ctx.activePlanId);
  return plan?.objects ?? [];
}

function setActiveObjects(
  ctx: StrategyContext,
  newObjects: CanvasObject[],
): Partial<StrategyContext> {
  if (ctx.mode === 'custom') return { objects: newObjects };
  return {
    halves: ctx.halves.map((h) =>
      h.id === ctx.activeHalfId
        ? {
            ...h,
            plans: h.plans.map((p) =>
              p.id === ctx.activePlanId ? { ...p, objects: newObjects } : p,
            ),
          }
        : h,
    ),
  };
}

type LoadOutput = Pick<Strategy, 'objects' | 'title' | 'mapSlug' | 'mode' | 'halves'>;

export const strategyMachine = setup({
  types: {
    context: {} as StrategyContext,
    input: {} as StrategyInput,
    events: {} as StrategyEvent,
  },
  actors: {
    loadStrategy: fromPromise(
      async ({ input }: { input: { strategyId: string } }): Promise<LoadOutput> => {
        const s = await localDb.strategies.get(input.strategyId);
        const defaultHalves = [makeHalf('Half 1'), makeHalf('Half 2')];
        if (!s) {
          return {
            objects: [],
            title: 'Untitled Strategy',
            mapSlug: '',
            mode: 'default',
            halves: defaultHalves,
          };
        }
        const mode: StrategyMode = s.mode ?? 'custom';
        const halves: Half[] =
          s.halves && s.halves.length > 0 ? s.halves : defaultHalves;
        return { objects: s.objects ?? [], title: s.title, mapSlug: s.mapSlug, mode, halves };
      },
    ),
    saveStrategy: fromPromise(
      async ({ input }: { input: Omit<Strategy, 'createdAt'> & { createdAt?: Date } }): Promise<void> => {
        const existing = await localDb.strategies.get(input.id);
        await localDb.strategies.put({
          ...input,
          createdAt: existing?.createdAt ?? new Date(),
          updatedAt: new Date(),
        });
      },
    ),
  },
  guards: {
    canUndo: ({ context }) => context.past.length > 0,
    canRedo: ({ context }) => context.future.length > 0,
    isDirty: ({ context }) => context.isDirty,
  },
}).createMachine({
  id: 'strategy',
  initial: 'initializing',
  context: ({ input }) => ({
    strategyId: input.strategyId,
    mapSlug: '',
    title: 'Untitled Strategy',
    mode: 'default' as StrategyMode,
    halves: [],
    activeHalfId: null,
    activePlanId: null,
    objects: [],
    past: [],
    future: [],
    isDirty: false,
    saveError: null,
  }),
  states: {
    initializing: {
      invoke: {
        src: 'loadStrategy',
        input: ({ context }) => ({ strategyId: context.strategyId }),
        onDone: {
          target: 'editing',
          actions: assign(({ event }) => {
            const { objects, title, mapSlug, mode, halves } = event.output;
            const firstHalf = halves[0] ?? null;
            const firstPlan = firstHalf?.plans[0] ?? null;
            return {
              objects,
              title,
              mapSlug,
              mode,
              halves,
              activeHalfId: firstHalf?.id ?? null,
              activePlanId: firstPlan?.id ?? null,
            };
          }),
        },
        onError: { target: 'editing' },
      },
    },
    editing: {
      initial: 'idle',
      states: {
        idle: {
          after: {
            2000: { guard: 'isDirty', target: 'saving' },
          },
          on: {
            COMMIT_OBJECTS: {
              actions: assign(({ context, event }) => ({
                past: pushHistory(context.past, getActiveObjects(context)),
                future: [],
                isDirty: true,
                ...setActiveObjects(context, event.objects),
              })),
            },
            DELETE_OBJECTS: {
              actions: assign(({ context, event }) => {
                const newObjs = getActiveObjects(context).filter(
                  (o) => !event.ids.includes(o.id),
                );
                return {
                  past: pushHistory(context.past, getActiveObjects(context)),
                  future: [],
                  isDirty: true,
                  ...setActiveObjects(context, newObjs),
                };
              }),
            },
            TRANSFORM_OBJECT: {
              actions: assign(({ context, event }) => {
                const newObjs = getActiveObjects(context).map((o) =>
                  o.id === event.id ? ({ ...o, ...event.patch } as CanvasObject) : o,
                );
                return {
                  past: pushHistory(context.past, getActiveObjects(context)),
                  future: [],
                  isDirty: true,
                  ...setActiveObjects(context, newObjs),
                };
              }),
            },
            UNDO: {
              guard: 'canUndo',
              actions: assign(({ context }) => {
                const prev = context.past[context.past.length - 1];
                return {
                  future: [getActiveObjects(context), ...context.future],
                  past: context.past.slice(0, -1),
                  isDirty: true,
                  ...setActiveObjects(context, prev),
                };
              }),
            },
            REDO: {
              guard: 'canRedo',
              actions: assign(({ context }) => {
                const next = context.future[0];
                return {
                  past: [...context.past, getActiveObjects(context)],
                  future: context.future.slice(1),
                  isDirty: true,
                  ...setActiveObjects(context, next),
                };
              }),
            },
            SAVE: { target: 'saving' },
            SET_TITLE: {
              actions: assign({ title: ({ event }) => event.title, isDirty: () => true }),
            },
            SET_MODE: {
              actions: assign(({ event, context }) => {
                if (event.mode === context.mode) return {};
                if (event.mode === 'default') {
                  const h1 = makeHalf('Half 1');
                  const h2 = makeHalf('Half 2');
                  return {
                    mode: 'default' as StrategyMode,
                    halves: [h1, h2],
                    activeHalfId: h1.id,
                    activePlanId: h1.plans[0].id,
                    past: [],
                    future: [],
                    isDirty: true,
                  };
                }
                return { mode: 'custom' as StrategyMode, past: [], future: [], isDirty: true };
              }),
            },
            ADD_HALF: {
              actions: assign(({ context }) => {
                const newHalf = makeHalf(`Half ${context.halves.length + 1}`);
                return {
                  halves: [...context.halves, newHalf],
                  activeHalfId: newHalf.id,
                  activePlanId: newHalf.plans[0].id,
                  past: [],
                  future: [],
                  isDirty: true,
                };
              }),
            },
            REMOVE_HALF: {
              actions: assign(({ context, event }) => {
                const remaining = context.halves.filter((h) => h.id !== event.halfId);
                if (remaining.length === 0) return {};
                const newActive = remaining[0];
                return {
                  halves: remaining,
                  activeHalfId:
                    context.activeHalfId === event.halfId ? newActive.id : context.activeHalfId,
                  activePlanId:
                    context.activeHalfId === event.halfId
                      ? newActive.plans[0]?.id ?? null
                      : context.activePlanId,
                  past: [],
                  future: [],
                  isDirty: true,
                };
              }),
            },
            SELECT_HALF: {
              actions: assign(({ context, event }) => {
                const half = context.halves.find((h) => h.id === event.halfId);
                if (!half) return {};
                return {
                  activeHalfId: event.halfId,
                  activePlanId: half.plans[0]?.id ?? null,
                  past: [],
                  future: [],
                };
              }),
            },
            RENAME_HALF: {
              actions: assign(({ context, event }) => ({
                halves: context.halves.map((h) =>
                  h.id === event.halfId ? { ...h, name: event.name } : h,
                ),
                isDirty: true,
              })),
            },
            UPDATE_HALF_TEAMS: {
              actions: assign(({ context, event }) => ({
                halves: context.halves.map((h) =>
                  h.id === event.halfId
                    ? { ...h, attackerIds: event.attackerIds, defenderIds: event.defenderIds }
                    : h,
                ),
                isDirty: true,
              })),
            },
            ADD_PLAN: {
              actions: assign(({ context }) => {
                const half = context.halves.find((h) => h.id === context.activeHalfId);
                if (!half) return {};
                const newPlan = makePlan(`Plan ${half.plans.length + 1}`);
                return {
                  halves: context.halves.map((h) =>
                    h.id === context.activeHalfId
                      ? { ...h, plans: [...h.plans, newPlan] }
                      : h,
                  ),
                  activePlanId: newPlan.id,
                  past: [],
                  future: [],
                  isDirty: true,
                };
              }),
            },
            REMOVE_PLAN: {
              actions: assign(({ context, event }) => {
                const half = context.halves.find((h) => h.id === context.activeHalfId);
                if (!half || half.plans.length <= 1) return {};
                const remaining = half.plans.filter((p) => p.id !== event.planId);
                return {
                  halves: context.halves.map((h) =>
                    h.id === context.activeHalfId ? { ...h, plans: remaining } : h,
                  ),
                  activePlanId:
                    context.activePlanId === event.planId
                      ? remaining[0].id
                      : context.activePlanId,
                  past: [],
                  future: [],
                  isDirty: true,
                };
              }),
            },
            SELECT_PLAN: {
              actions: assign(({ event }) => ({
                activePlanId: event.planId,
                past: [],
                future: [],
              })),
            },
            RENAME_PLAN: {
              actions: assign(({ context, event }) => ({
                halves: context.halves.map((h) =>
                  h.id === context.activeHalfId
                    ? {
                        ...h,
                        plans: h.plans.map((p) =>
                          p.id === event.planId ? { ...p, name: event.name } : p,
                        ),
                      }
                    : h,
                ),
                isDirty: true,
              })),
            },
          },
        },
        saving: {
          invoke: {
            src: 'saveStrategy',
            input: ({ context }) => ({
              id: context.strategyId,
              mapSlug: context.mapSlug,
              title: context.title,
              mode: context.mode,
              halves: context.halves,
              objects: context.objects,
              updatedAt: new Date(),
            }),
            onDone: {
              target: 'idle',
              actions: assign({ isDirty: () => false, saveError: () => null }),
            },
            onError: {
              target: 'idle',
              actions: assign({ saveError: ({ event }) => String(event.error) }),
            },
          },
        },
      },
    },
  },
});
