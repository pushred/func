#!/usr/bin/env node

const { copyFileSync } = require('fs');
const { join } = require('path');

const server = require('live-server');
const tmp = require('tmp');

const rollup = require('rollup');
const aliasPlugin = require('rollup-plugin-alias');
const jsonPlugin = require('rollup-plugin-json');
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
  copyFileSync(config.paths.stylesheet, join(tmpDirPath, 'func.css'));

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
      jsonPlugin(),
      sveltePlugin(),
    ],
  };

  return Promise.resolve(rollup.rollup(rollupOptions))
    .then(bundle => bundle.write(rollupOptions.output))
    .then(() => startServer(tmpDirPath))
    .then(() => (rollupOptions));
}

function startServer(tmpDirPath) {
  server.start({
    root: tmpDirPath,
    open: false,
  });

  return Promise.resolve();
}

function watch(rollupOptions) {
  const watcher = rollup.watch({
    ...rollupOptions,
    watch: {
      // chokidar: true,
      include: join(__dirname, './lib/**'),
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
