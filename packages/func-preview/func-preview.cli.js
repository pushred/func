#!/usr/bin/env node

const { copyFileSync } = require('fs');
const { basename, join } = require('path');

const server = require('live-server');
const tmp = require('tmp');

const rollup = require('rollup');
const aliasPlugin = require('rollup-plugin-alias');
const cjsPlugin = require('rollup-plugin-commonjs');
const jsonPlugin = require('rollup-plugin-json');
const resolvePlugin = require('rollup-plugin-node-resolve');
const sveltePlugin = require('rollup-plugin-svelte');

const { Cli, debug, log } = require('func-cli');
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

function initialBundle({ config }) {
  const tmpDir = tmp.dirSync();
  const tmpDirPath = tmpDir.name;

  debug('tmp directory created:', tmpDirPath);

  copyFileSync(join(__dirname, 'lib', 'index.html'), join(tmpDirPath, 'index.html'));

  const rollupOptions = {
    input: join(__dirname, 'lib', 'preview.js'),
    output: {
      format: 'iife',
      file: join(tmpDirPath, 'preview.js')
    },
    plugins: [
      aliasPlugin({
        resolve: ['.js', '.json'],
        'func-index': config.paths.indexJson,
      }),
      cjsPlugin(),
      jsonPlugin(),
      resolvePlugin(),
      sveltePlugin({ dev: true }),
    ],
  };

  return Promise.resolve(rollup.rollup(rollupOptions))
    .then(bundle => bundle.write(rollupOptions.output))
    .then(() => startServer({ tmpDirPath, outputPath: basename(config.paths.stylesheet) }))
    .then(() => ({ config, rollupOptions }))
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
} = {}) {
  const watcher = rollup.watch({
    ...rollupOptions,
    watch: {
      // chokidar: true,
      include: [
        ...Object.values(config.paths),
        join(__dirname, './lib/**'),
      ],
    },
  });

  log.info('watching for changes…')

  watcher.on('event', event => {
    if (event.code === 'START') log.info('refreshing preview…')
  });
}

Cli(HELP, FLAGS)
  .then(initialBundle)
  .then(watch)
  .catch(log.error);
