import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/react-vite',
  staticDirs: ['../../../apps/web/public'],
  viteFinal: async (config) => {
    config.plugins = [...(config.plugins || []), tailwindcss()];
    const uiPath = resolve(__dirname, '../../../libs/ui/src');
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@map-planner/ui/styles.css': `${uiPath}/styles.css`,
          '@map-planner/ui': uiPath,
          '@map-planner/core': resolve(__dirname, '../../../libs/core/src/index.ts'),
        },
      },
    };
  },
};

export default config;
