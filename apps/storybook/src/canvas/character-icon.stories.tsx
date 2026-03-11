import type { Meta, StoryObj } from '@storybook/react';
import { Stage, Layer } from 'react-konva';
import { CharacterIcon } from '@map-planner/ui';
import { CHARACTERS } from '@map-planner/core';

const meta: Meta = {
  title: 'Canvas/CharacterIcon',
};
export default meta;

type Story = StoryObj;

const base = { zIndex: 0, stroke: '#ffffff', strokeWidth: 2, opacity: 1, fill: 'transparent', locked: false as const };

export const Attackers: Story = {
  render: () => (
    <Stage width={600} height={200}>
      <Layer>
        {CHARACTERS.slice(0, 6).map((char, i) => (
          <CharacterIcon
            key={char.id}
            object={{ ...base, id: char.id, kind: 'character', x: 50 + i * 90, y: 80, characterId: char.id, team: 'attacker' }}
          />
        ))}
      </Layer>
    </Stage>
  ),
};

export const Defender: Story = {
  render: () => (
    <Stage width={200} height={200}>
      <Layer>
        <CharacterIcon
          object={{ ...base, id: '1', kind: 'character', x: 100, y: 100, characterId: CHARACTERS[0].id, team: 'defender' }}
        />
      </Layer>
    </Stage>
  ),
};
