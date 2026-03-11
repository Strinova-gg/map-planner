'use client';

import { useState, useEffect } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';
import { CHARACTERS, FACTIONS, agentIconSrc } from '@map-planner/core';
import type { MarkerVariant, CharacterTeam, FactionRole } from '@map-planner/core';
import type { StrategyMode, Half } from '@map-planner/core';
import { ScrollArea } from '../components/scroll-area';
import { Button } from '../components/button';
import { cn } from '../lib/utils';

interface Props {
  // Canvas state
  activeCharacterId: string | null;
  activeCharacterTeam: CharacterTeam;
  activeMarkerVariant: MarkerVariant;
  placedCharacterIds: Set<string>;
  canvasObjects: any[];
  onSelectCharacter: (id: string, team: CharacterTeam) => void;
  onSelectMarker: (variant: MarkerVariant) => void;
  // Strategy state
  mode: StrategyMode;
  halves: Half[];
  activeHalfId: string | null;
  activePlanId: string | null;
  // Strategy handlers
  onSetMode: (mode: StrategyMode) => void;
  onAddHalf: () => void;
  onRemoveHalf: (halfId: string) => void;
  onSelectHalf: (halfId: string) => void;
  onUpdateHalfTeams: (halfId: string, attackerIds: string[], defenderIds: string[]) => void;
  onAddPlan: () => void;
  onRemovePlan: (planId: string) => void;
  onSelectPlan: (planId: string) => void;
}

const MARKER_OPTIONS: Array<{ variant: MarkerVariant; label: string; color: string }> = [
  { variant: 'bomb-site', label: 'Bomb Site', color: '#ef4444' },
  { variant: 'danger', label: 'Danger', color: '#f97316' },
  { variant: 'watch-point', label: 'Watch Point', color: '#3b82f6' },
];

/** Agent portrait with automatic fallback to coloured initials circle. */
function AgentAvatar({
  agentId,
  size,
  style,
  className,
}: {
  agentId: string;
  size: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const agent = CHARACTERS.find((c) => c.id === agentId);
  const [imgError, setImgError] = useState(false);
  if (!agent) return null;
  return (
    <div
      className={cn('relative shrink-0 overflow-hidden rounded-full', className)}
      style={{ width: size, height: size, backgroundColor: agent.color, ...style }}
    >
      {!imgError ? (
        <img
          src={agentIconSrc(agentId)}
          alt={agent.name}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white"
        >
          {agent.name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function AgentChip({
  agentId,
  team,
  active,
  placed,
  onClick,
}: {
  agentId: string;
  team: CharacterTeam;
  active: boolean;
  placed: boolean;
  onClick: () => void;
}) {
  const agent = CHARACTERS.find((c) => c.id === agentId);
  if (!agent) return null;
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-0.5 rounded-md p-1 text-xs transition-colors hover:bg-accent',
        active && 'ring-1 ring-ring bg-accent',
        placed && 'opacity-40',
      )}
      title={placed ? `${agent.name} (already placed)` : agent.name}
    >
      <AgentAvatar
        agentId={agentId}
        size={44}
        style={{
          outline: `2px solid ${team === 'attacker' ? '#ef4444' : '#60a5fa'}`,
          outlineOffset: '1px',
        }}
      />
    </button>
  );
}

function DefaultModePanel({
  halves,
  activeHalfId,
  activePlanId,
  activeCharacterId,
  activeCharacterTeam,
  activeMarkerVariant,
  placedCharacterIds,
  canvasObjects,
  onSelectCharacter,
  onSelectMarker,
  onAddHalf,
  onRemoveHalf,
  onSelectHalf,
  onUpdateHalfTeams,
  onAddPlan,
  onRemovePlan,
  onSelectPlan,
}: Omit<Props, 'mode' | 'onSetMode'>) {
  const [teamSetupOpen, setTeamSetupOpen] = useState(true);
  const [urbinoPicker, setUrbinoPicker] = useState<string | null>(null);

  // Close Urbino picker on outside click
  useEffect(() => {
    if (!urbinoPicker) return;
    const handler = () => setUrbinoPicker(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [urbinoPicker]);
  const activeHalf = halves.find((h) => h.id === activeHalfId) ?? null;

  /**
   * Toggle an agent in/out of a team.
   * exclusive=true (default): adding to one team removes from the other (PUS/Scissors).
   * exclusive=false: each team is toggled independently (Urbino).
   */
  function toggleAgent(agentId: string, targetTeam: 'attacker' | 'defender', exclusive = true) {
    if (!activeHalf) return;
    const inAttackers = activeHalf.attackerIds.includes(agentId);
    const inDefenders = activeHalf.defenderIds.includes(agentId);

    let newAttackers = [...activeHalf.attackerIds];
    let newDefenders = [...activeHalf.defenderIds];

    if (targetTeam === 'attacker') {
      if (inAttackers) {
        newAttackers = newAttackers.filter((id) => id !== agentId);
      } else {
        if (exclusive) newDefenders = newDefenders.filter((id) => id !== agentId);
        newAttackers = [...newAttackers, agentId];
      }
    } else {
      if (inDefenders) {
        newDefenders = newDefenders.filter((id) => id !== agentId);
      } else {
        if (exclusive) newAttackers = newAttackers.filter((id) => id !== agentId);
        newDefenders = [...newDefenders, agentId];
      }
    }

    onUpdateHalfTeams(activeHalf.id, newAttackers, newDefenders);
  }

  const attackerAgents = activeHalf
    ? CHARACTERS.filter((c) => activeHalf.attackerIds.includes(c.id))
    : [];
  const defenderAgents = activeHalf
    ? CHARACTERS.filter((c) => activeHalf.defenderIds.includes(c.id))
    : [];

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-3 p-2">
        {/* Halves */}
        <section>
          <div className="mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Halves
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {halves.map((h) => (
              <div
                key={h.id}
                className={cn(
                  'flex items-center rounded-md border border-border px-2.5 py-1 text-sm cursor-pointer transition-colors hover:border-ring',
                  h.id === activeHalfId && 'border-ring bg-accent',
                )}
                onClick={() => onSelectHalf(h.id)}
              >
                <span>{h.name}</span>
              </div>
            ))}
          </div>
        </section>

        {activeHalf && (
          <>
            {/* Team Setup */}
            <section>
              <button
                className="mb-1 flex w-full items-center justify-between"
                onClick={() => setTeamSetupOpen((v) => !v)}
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Team Setup
                </span>
                <ChevronDown
                  size={13}
                  className={cn(
                    'text-muted-foreground transition-transform',
                    !teamSetupOpen && '-rotate-90',
                  )}
                />
              </button>

              {teamSetupOpen && (
                <div className="flex flex-col gap-2">
                  {FACTIONS.map((faction) => (
                    <div key={faction.id} className="pb-2.5">
                      <div
                        className="mb-2 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: faction.color }}
                      >
                        {faction.name}
                        <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                          {faction.role === 'attackers'
                            ? '· attackers only'
                            : faction.role === 'defenders'
                            ? '· defenders only'
                            : '· either team'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 overflow-visible">
                        {faction.agents.map((agent) => {
                          const inAttackers = activeHalf.attackerIds.includes(agent.id);
                          const inDefenders = activeHalf.defenderIds.includes(agent.id);
                          const inBoth = inAttackers && inDefenders;
                          const unassigned = !inAttackers && !inDefenders;
                          const isUrbinoPickerOpen = urbinoPicker === agent.id;

                          // Outline: yellow=atk, blue=def, both=dual ring via box-shadow
                          const iconStyle: React.CSSProperties = {
                            backgroundColor: faction.color,
                            ...(inBoth
                              ? { outline: '2px solid #ef4444', outlineOffset: '1px', boxShadow: '0 0 0 4px #60a5fa' }
                              : inAttackers
                              ? { outline: '2px solid #ef4444', outlineOffset: '1px' }
                              : inDefenders
                              ? { outline: '2px solid #60a5fa', outlineOffset: '1px' }
                              : {}),
                          };

                          return (
                            <div key={agent.id} className="relative flex flex-col items-center">
                              <button
                                className={cn(
                                  'rounded-full cursor-pointer transition-opacity hover:opacity-80',
                                  unassigned && 'opacity-30 hover:opacity-50',
                                )}
                                title={agent.name}
                                onClick={() => {
                                  if (faction.role === 'either') {
                                    setUrbinoPicker(isUrbinoPickerOpen ? null : agent.id);
                                  } else {
                                    toggleAgent(
                                      agent.id,
                                      faction.role === 'attackers' ? 'attacker' : 'defender',
                                    );
                                  }
                                }}
                              >
                                <AgentAvatar agentId={agent.id} size={40} style={iconStyle} />
                              </button>

                              {/* Urbino team picker popover — ATK/DEF toggle independently */}
                              {isUrbinoPickerOpen && (
                                <div className="absolute top-8 left-0 z-50 flex gap-1 rounded-md border border-border bg-popover p-1 shadow-md">
                                  <button
                                    className={cn(
                                      'rounded px-2 py-1 text-xs font-bold transition-colors',
                                      inAttackers
                                        ? 'bg-red-500 text-white'
                                        : 'text-muted-foreground hover:bg-red-500 hover:text-white',
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleAgent(agent.id, 'attacker', false);
                                    }}
                                  >
                                    ATK
                                  </button>
                                  <button
                                    className={cn(
                                      'rounded px-2 py-1 text-xs font-bold transition-colors',
                                      inDefenders
                                        ? 'bg-blue-400 text-black'
                                        : 'text-muted-foreground hover:bg-blue-400 hover:text-black',
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleAgent(agent.id, 'defender', false);
                                    }}
                                  >
                                    DEF
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Plans */}
            <section>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Plans
                </span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onAddPlan} title="Add plan">
                  <Plus size={11} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeHalf.plans.map((plan, idx) => (
                  <div
                    key={plan.id}
                    className={cn(
                      'group flex items-center gap-0.5 rounded-md border border-border px-2.5 py-1 text-sm cursor-pointer transition-colors hover:border-ring',
                      plan.id === activePlanId && 'border-ring bg-accent',
                    )}
                    onClick={() => onSelectPlan(plan.id)}
                  >
                    <span>Plan {idx + 1}</span>
                    {activeHalf.plans.length > 1 && (
                      <button
                        className="ml-0.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); onRemovePlan(plan.id); }}
                      >
                        <X size={9} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Place Characters */}
            {(attackerAgents.length > 0 || defenderAgents.length > 0) && (
              <section>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Place Characters
                </div>
                {attackerAgents.length > 0 && (
                  <div className="mb-1">
                    <div className="mb-0.5 text-xs text-red-400">Attackers</div>
                    <div className="flex flex-wrap gap-2">
                      {attackerAgents.map((a) => {
                        const isPlaced = canvasObjects.some(
                          (o) => o.kind === 'character' && o.characterId === a.id && o.team === 'attacker'
                        );
                        return (
                          <AgentChip
                            key={a.id}
                            agentId={a.id}
                            team="attacker"
                            active={activeCharacterId === a.id && activeCharacterTeam === 'attacker'}
                            placed={isPlaced}
                            onClick={() => onSelectCharacter(a.id, 'attacker')}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
                {defenderAgents.length > 0 && (
                  <div>
                    <div className="mb-0.5 text-xs text-blue-400">Defenders</div>
                    <div className="flex flex-wrap gap-2">
                      {defenderAgents.map((a) => {
                        const isPlaced = canvasObjects.some(
                          (o) => o.kind === 'character' && o.characterId === a.id && o.team === 'defender'
                        );
                        return (
                          <AgentChip
                            key={a.id}
                            agentId={a.id}
                            team="defender"
                            active={activeCharacterId === a.id && activeCharacterTeam === 'defender'}
                            placed={isPlaced}
                            onClick={() => onSelectCharacter(a.id, 'defender')}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* Markers */}
        <section>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Markers
          </div>
          <div className="flex flex-col gap-1">
            {MARKER_OPTIONS.map((m) => (
              <button
                key={m.variant}
                onClick={() => onSelectMarker(m.variant)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent',
                  activeMarkerVariant === m.variant && 'ring-1 ring-ring bg-accent',
                )}
              >
                <div className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: m.color }} />
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}

function CustomModePanel({
  activeCharacterId,
  activeCharacterTeam,
  activeMarkerVariant,
  placedCharacterIds,
  canvasObjects,
  onSelectCharacter,
  onSelectMarker,
}: {
  activeCharacterId: string | null;
  activeCharacterTeam: CharacterTeam;
  activeMarkerVariant: MarkerVariant;
  placedCharacterIds: Set<string>;
  canvasObjects: any[];
  onSelectCharacter: (id: string, team: CharacterTeam) => void;
  onSelectMarker: (variant: MarkerVariant) => void;
}) {
  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-3 p-2">
        <section>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Characters
          </div>
          {FACTIONS.map((faction) => (
            <div key={faction.id} className="mb-2">
              <div
                className="mb-0.5 text-xs font-semibold uppercase tracking-wide"
                style={{ color: faction.color }}
              >
                {faction.name}
              </div>
              <div className="flex flex-wrap gap-2">
                {faction.agents.map((agent) => {
                  const defaultTeam: CharacterTeam =
                    faction.role === 'defenders' ? 'defender' : 'attacker';
                  const isActive = activeCharacterId === agent.id;
                  const isPlaced = canvasObjects.some(
                    (o) => o.kind === 'character' && o.characterId === agent.id
                  );
                  return (
                    <button
                      key={agent.id}
                      onClick={() => onSelectCharacter(agent.id, defaultTeam)}
                      className={cn(
                        'flex flex-col items-center gap-0.5 rounded-md p-1 transition-colors hover:bg-accent',
                        isActive && 'ring-1 ring-ring bg-accent',
                        isPlaced && 'opacity-40',
                      )}
                      title={isPlaced ? `${agent.name} (already placed)` : agent.name}
                    >
                      <AgentAvatar agentId={agent.id} size={40} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <section>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Markers
          </div>
          <div className="flex flex-col gap-1">
            {MARKER_OPTIONS.map((m) => (
              <button
                key={m.variant}
                onClick={() => onSelectMarker(m.variant)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent',
                  activeMarkerVariant === m.variant && 'ring-1 ring-ring bg-accent',
                )}
              >
                <div className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: m.color }} />
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}

export function StrategySidebar(props: Props) {
  const { mode, onSetMode } = props;

  return (
    <div className="flex h-full w-72 flex-col border-l border-border bg-card">
      {/* Mode toggle */}
      <div className="flex border-b border-border">
        <button
          className={cn(
            'flex-1 py-2 text-sm font-medium transition-colors',
            mode === 'default'
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
          onClick={() => onSetMode('default')}
        >
          Default
        </button>
        <button
          className={cn(
            'flex-1 py-2 text-sm font-medium transition-colors',
            mode === 'custom'
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
          onClick={() => onSetMode('custom')}
        >
          Custom
        </button>
      </div>

      {mode === 'default' ? (
        <DefaultModePanel {...props} />
      ) : (
        <CustomModePanel
          activeCharacterId={props.activeCharacterId}
          activeCharacterTeam={props.activeCharacterTeam}
          activeMarkerVariant={props.activeMarkerVariant}
          placedCharacterIds={props.placedCharacterIds}
          canvasObjects={props.canvasObjects}
          onSelectCharacter={props.onSelectCharacter}
          onSelectMarker={props.onSelectMarker}
        />
      )}
    </div>
  );
}
