'use client';

import {
  MousePointer2,
  ArrowRight,
  Minus,
  Pencil,
  Square,
  Circle,
  Type,
  User,
  MapPin,
  Eye,
  Zap,
} from 'lucide-react';
import type { ToolMode } from '@map-planner/core';
import { Button } from '../components/button';
import { Separator } from '../components/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/tooltip';
import { cn } from '../lib/utils';

interface ToolButtonProps {
  tool: ToolMode;
  icon: React.ReactNode;
  label: string;
  currentTool: ToolMode;
  onSelect: (tool: ToolMode) => void;
  kbd?: string;
}

function ToolButton({ tool, icon, label, currentTool, onSelect, kbd }: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={currentTool === tool ? 'secondary' : 'ghost'}
          size="icon"
          className={cn(
            'h-9 w-9',
            currentTool === tool && 'ring-1 ring-ring',
          )}
          onClick={() => onSelect(tool)}
          aria-label={label}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {label}
        {kbd && <span className="ml-1 opacity-60">[{kbd}]</span>}
      </TooltipContent>
    </Tooltip>
  );
}

interface StyleControlsProps {
  activeColor: string;
  activeFill: string;
  activeStrokeWidth: number;
  onColorChange: (color: string) => void;
  onFillChange: (fill: string) => void;
  onStrokeWidthChange: (width: number) => void;
}

interface ToolToolbarProps extends StyleControlsProps {
  currentTool: ToolMode;
  onToolSelect: (tool: ToolMode) => void;
}

export function ToolToolbar({
  currentTool,
  onToolSelect,
  activeColor,
  activeFill,
  activeStrokeWidth,
  onColorChange,
  onFillChange,
  onStrokeWidthChange,
}: ToolToolbarProps) {
  const tools: Array<{ tool: ToolMode; icon: React.ReactNode; label: string; kbd?: string }> = [
    { tool: 'select', icon: <MousePointer2 size={16} />, label: 'Select', kbd: 'V' },
    { tool: 'arrow', icon: <ArrowRight size={16} />, label: 'Arrow', kbd: 'A' },
    { tool: 'line', icon: <Minus size={16} />, label: 'Line', kbd: 'L' },
    { tool: 'freehand', icon: <Pencil size={16} />, label: 'Freehand', kbd: 'F' },
    { tool: 'rect', icon: <Square size={16} />, label: 'Rectangle', kbd: 'R' },
    { tool: 'ellipse', icon: <Circle size={16} />, label: 'Ellipse', kbd: 'E' },
    { tool: 'text', icon: <Type size={16} />, label: 'Text', kbd: 'T' },
    { tool: 'character', icon: <User size={16} />, label: 'Character', kbd: 'C' },
    { tool: 'marker', icon: <MapPin size={16} />, label: 'Marker', kbd: 'M' },
    { tool: 'vision-cone', icon: <Eye size={16} />, label: 'Vision Cone' },
    { tool: 'ability-zone', icon: <Zap size={16} />, label: 'Ability Zone' },
  ];

  return (
    <div className="flex h-full flex-col items-center gap-1 border-r border-border bg-card p-2">
      {tools.map((t, i) => (
        <div key={t.tool}>
          {(i === 1 || i === 7) && <Separator className="my-1" />}
          <ToolButton {...t} currentTool={currentTool} onSelect={onToolSelect} />
        </div>
      ))}

      <Separator className="my-1" />

      {/* Stroke color */}
      <Tooltip>
        <TooltipTrigger asChild>
          <label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md hover:bg-accent">
            <div
              className="h-5 w-5 rounded-sm border border-border"
              style={{ backgroundColor: activeColor }}
            />
            <input
              type="color"
              value={activeColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="sr-only"
            />
          </label>
        </TooltipTrigger>
        <TooltipContent side="right">Stroke color</TooltipContent>
      </Tooltip>

      {/* Fill color */}
      <Tooltip>
        <TooltipTrigger asChild>
          <label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md hover:bg-accent">
            <div
              className="h-5 w-5 rounded-sm border border-border"
              style={{
                backgroundColor: activeFill === 'transparent' ? 'transparent' : activeFill,
                backgroundImage:
                  activeFill === 'transparent'
                    ? 'linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%),linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%)'
                    : undefined,
                backgroundSize: '6px 6px',
                backgroundPosition: '0 0, 3px 3px',
              }}
            />
            <input
              type="color"
              value={activeFill === 'transparent' ? '#ffffff' : activeFill}
              onChange={(e) => onFillChange(e.target.value)}
              className="sr-only"
            />
          </label>
        </TooltipTrigger>
        <TooltipContent side="right">Fill color</TooltipContent>
      </Tooltip>

      {/* Stroke width */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md text-xs font-bold hover:bg-accent"
            onClick={() => {
              const next = activeStrokeWidth >= 8 ? 1 : activeStrokeWidth + 1;
              onStrokeWidthChange(next);
            }}
          >
            {activeStrokeWidth}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">Stroke width (click to cycle)</TooltipContent>
      </Tooltip>
    </div>
  );
}
