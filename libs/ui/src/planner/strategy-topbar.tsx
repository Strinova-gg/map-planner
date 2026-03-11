'use client';

import { Undo2, Redo2, Save, Download, CheckCircle, Loader2, Tag, House } from 'lucide-react';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/tooltip';
import { Separator } from '../components/separator';

interface Props {
  title: string;
  mapName: string;
  isDirty: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  showLabels: boolean;
  onTitleChange: (title: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExportPng: () => void;
  onToggleLabels: () => void;
  onHome: () => void;
}

export function StrategyTopbar({
  title,
  mapName,
  isDirty,
  isSaving,
  canUndo,
  canRedo,
  showLabels,
  onTitleChange,
  onUndo,
  onRedo,
  onSave,
  onExportPng,
  onToggleLabels,
  onHome,
}: Props) {
  return (
    <div className="flex h-12 items-center gap-2 border-b border-border bg-card px-3">
      {/* Home button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onHome}>
            <House size={15} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Back to map selector</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5" />

      {/* Map name */}
      <span className="text-xs font-medium text-muted-foreground">{mapName}</span>

      <Separator orientation="vertical" className="h-5" />

      {/* Strategy title */}
      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="h-7 w-48 border-0 bg-transparent px-1 text-sm font-medium focus-visible:ring-0 focus-visible:bg-muted/40"
        placeholder="Untitled Strategy"
      />

      <div className="flex-1" />

      {/* Undo / Redo */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canUndo} onClick={onUndo}>
            <Undo2 size={15} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canRedo} onClick={onRedo}>
            <Redo2 size={15} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5" />

      {/* Save status */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSave}>
            {isSaving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : isDirty ? (
              <Save size={15} />
            ) : (
              <CheckCircle size={15} className="text-green-500" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isSaving ? 'Saving…' : isDirty ? 'Save (Ctrl+S)' : 'Saved'}
        </TooltipContent>
      </Tooltip>

      {/* Toggle labels */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={showLabels ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={onToggleLabels}
          >
            <Tag size={15} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{showLabels ? 'Hide labels' : 'Show labels'}</TooltipContent>
      </Tooltip>

      {/* Export PNG */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExportPng}>
            <Download size={15} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Export PNG</TooltipContent>
      </Tooltip>
    </div>
  );
}
