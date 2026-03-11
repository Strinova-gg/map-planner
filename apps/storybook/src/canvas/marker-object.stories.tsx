import type { Meta, StoryObj } from '@storybook/react';
import { Stage, Layer } from 'react-konva';
import { MarkerObjectRenderer } from '@map-planner/ui';
import type { MarkerVariant } from '@map-planner/core';

const meta: Meta = {
  title: 'Canvas/MarkerObject',
};
export default meta;

type Story = StoryObj;

const base = { zIndex: 0, stroke: '#f59e0b', strokeWidth: 2, opacity: 1, fill: '#f59e0b', locked: false as const };

const makeMarker = (variant: MarkerVariant, x: number, label?: string) => ({
  ...base, id: variant, kind: 'marker' as const, x, y: 100, variant, label,
});

export const AllMarkers: Story = {
  render: () => (
    <Stage width={400} height={200}>
      <Layer>
        <MarkerObjectRenderer object={makeMarker('bomb-site', 80, 'A')} />
        <MarkerObjectRenderer object={makeMarker('danger', 200)} />
        <MarkerObjectRenderer object={makeMarker('watch-point', 320)} />
      </Layer>
    </Stage>
  ),
};
