#!/usr/bin/env node

const { copyFileSync } = require('fs');
const { basename, join } = require('path');

const chokidar = require('chokidar');
const server = require('live-server');
const tmp = require('tmp');

const rollup = require('rollup');
const aliasPlugin = require('rollup-plugin-alias');
const cjsPlugin = require('rollup-plugin-commonjs');
const jsonPlugin = require('rollup-plugin-json');
const resolvePlugin = require('rollup-plugin-node-resolve');
const sveltePlugin = require('rollup-plugin-svelte');
const yamlPlugin = require('rollup-plugin-yaml');

const { Cli, debug, log } = require('func-cli');
const { parse } = require('func-css/lib/colors');
const { DEFAULTS } = require('func-cli/lib/consts');

const HELP = `
  Usage
    $ func-preview
`;

const FLAGS = {
  config: {
    type: 'string',
  },
};

const INDEX_PAGE = join(__dirname, 'lib', 'index.html');

function initialBundle({ config }) {
  const tmpDir = tmp.dirSync();
  const tmpDirPath = tmpDir.name;

  debug('tmp directory created:', tmpDirPath);

  copyFileSync(INDEX_PAGE, join(tmpDirPath, 'index.html'));

  const rollupOptions = {
    input: join(__dirname, 'lib', 'preview.js'),
    output: {
      format: 'iife',
      file: join(tmpDirPath, 'preview.js')
    },
    plugins: [
      aliasPlugin({
        resolve: ['.js', '.json', '.yaml', '.yml'],
        'func-colors': join(config.basePath, config.func.files.colors),
        'func-index': config.paths.indexJson,
      }),
      cjsPlugin(),
      jsonPlugin(),
      yamlPlugin(),
      resolvePlugin(),
      sveltePlugin({ dev: true }),
    ],
  };

  return Promise.resolve(rollup.rollup(rollupOptions))
    .then(bundle => bundle.write(rollupOptions.output))
    .then(() => startServer({ tmpDirPath, outputPath: basename(config.paths.stylesheet) }))
    .then(() => ({ config, rollupOptions, tmpDirPath }))
    .catch(console.error);
}

function startServer({ outputPath, tmpDirPath }) {
  server.start({
    root: tmpDirPath,
    open: false,
    mount: [
      ['/output', outputPath],
    ],
  });

  return Promise.resolve();
}

function watch({
  config = {
    paths: {},
  },
  rollupOptions,
  tmpDirPath,
} = {}) {
  const watcher = rollup.watch({
    ...rollupOptions,
    watch: {
      chokidar: false,
      include: [
        ...Object.values(config.paths),
        join(__dirname, './lib/**/*'),
      ],
    },
  });

  log.info('watching for changes…')

  chokidar.watch(INDEX_PAGE).on('change', () => {
    copyFileSync(INDEX_PAGE, join(tmpDirPath, 'index.html'));
  });

  watcher.on('event', event => {
    if (event.code === 'START') log.info('refreshing preview…')
  });
}

Cli(HELP, FLAGS)
  .then(initialBundle)
  .then(watch)
  .catch(log.error);
