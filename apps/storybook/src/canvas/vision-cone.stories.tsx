import type { Meta, StoryObj } from '@storybook/react';
import { Stage, Layer } from 'react-konva';
import { VisionCone } from '@map-planner/ui';

const meta: Meta = {
  title: 'Canvas/VisionCone',
};
export default meta;

type Story = StoryObj;

const base = { zIndex: 0, stroke: '#22c55e', strokeWidth: 1, opacity: 0.5, fill: '#22c55e', locked: false as const };

export const Default: Story = {
  render: () => (
    <Stage width={400} height={300}>
      <Layer>
        <VisionCone
          object={{ ...base, id: '1', kind: 'vision-cone', x: 200, y: 150, rotation: 0, angle: 60, range: 120 }}
        />
      </Layer>
    </Stage>
  ),
};
