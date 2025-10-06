import { OptionDefaults } from 'typedoc';

const config = {
  name: 'Mapples Open Kit',
  entryPointStrategy: 'packages',
  entryPoints: ['packages/@mapples/*'],
  packageOptions: {
    entryPoints: ['src/index.ts'],
    blockTags: [...OptionDefaults.blockTags, '@fileoverview', '@component'],
    sort: ['source-order'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/__tests__/**'],
  },
  readme: 'none',
  fileExtension: '.mdx',
  entryFileName: 'index',
  hideBreadcrumbs: true,
  hidePageHeader: true,
  plugin: ['typedoc-plugin-markdown'],
  visibilityFilters: {
    protected: false,
    private: false,
    inherited: true,
    external: false,
  },
  cleanOutputDir: true,
};

export default config;
