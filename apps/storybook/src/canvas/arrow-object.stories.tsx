import type { Meta, StoryObj } from '@storybook/react';
import { Stage, Layer } from 'react-konva';
import { ArrowObjectRenderer } from '@map-planner/ui';

const meta: Meta = {
  title: 'Canvas/ArrowObject',
};
export default meta;

type Story = StoryObj;

const base = { zIndex: 0, stroke: '#ef4444', strokeWidth: 3, opacity: 1, fill: 'transparent', locked: false as const };

export const Solid: Story = {
  render: () => (
    <Stage width={400} height={300}>
      <Layer>
        <ArrowObjectRenderer
          object={{ ...base, id: '1', kind: 'arrow', points: [50, 50, 300, 200], dashed: false }}
        />
      </Layer>
    </Stage>
  ),
};

export const Dashed: Story = {
  render: () => (
    <Stage width={400} height={300}>
      <Layer>
        <ArrowObjectRenderer
          object={{ ...base, id: '2', kind: 'arrow', stroke: '#3b82f6', strokeWidth: 4, points: [50, 150, 350, 80], dashed: true }}
        />
      </Layer>
    </Stage>
  ),
};
