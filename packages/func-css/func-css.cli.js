#!/usr/bin/env node

const { basename, dirname, join, resolve } = require('path');
const { writeFileSync } = require('fs');

const { Cli, log, Watcher } = require('func-cli');
const { DEFAULTS } = require('func-cli/lib/consts');
const { parse } = require('./lib/colors');
const { expandClasses, generateClasses, generateProps } = require('./lib/generator');

const HELP = `
  Usage
    $ func [-o output path]

  Configuration is loaded from a file or a func key in your package.json

  Options
    -o, --output    Filepath for generated stylesheet
    --jsonOutput    Filepath for generated JSON
    --config        Custom config filename, defaults to (funcrc|func.config).(json|yaml|yml)
    --watch         Watch config files and regenerate on changes
`;

const FLAGS = {
  config: {
    type: 'string',
  },
  output: {
    type: 'string',
    alias: 'o',
  },
  jsonOutput: {
    type: 'string',
  },
};

/**
 * generate
 * @params {Object} config - merged configuration
 * @returns {Promise} generator results
 */

function generate(config) {
  return Promise.all([
    generateStylesheet(config),
    generateJson(config),
  ]);
}

function generateJson({ func, classes, colors } = {}) {
  if (!classes) return {};
  return JSON.stringify(generateProps({ classes, colors }), null, 2);
}

function generateStylesheet({ func, classes, colors } = {}) {
  const { properties } = func;
  return [
    func.properties && generateClasses({ properties, colors }),
    classes && expandClasses({ classes, colors }),
  ].filter(Boolean).join(/\n/);
}

/**
 * updateOutput
 * generates and writes stylesheet and JSON output files from latest configuration
 *
 * @param {array} configFiles - absolute file paths
 * @emits stylesheet and JSON output files to specified path
 */

function updateOutput(config) {
  generate(config)
    .then(output => {
      const stylesheet = output[0];
      const json = output[1];

      writeFileSync(config.paths.stylesheet, stylesheet);
      log.save('stylesheet saved to', config.paths.stylesheet);

      if (!json) return;
      writeFileSync(config.paths.json, json);
      log.save('JSON saved to', config.paths.json);
    })
    .catch(log.error);
}

/**
 * watch
 * changes detected in config files trigger regeneration and new output files
 *
 * @param {array} configFiles - absolute file paths
 * @fires updateOutput
 */

function watch(configFiles = [], cli) {
  Watcher(configFiles)
    .on('change', (path) => {
      log.info(`${basename(path)} changed, regenerating…`);
      cli.refreshConfigs().then(({ config }) => updateOutput(config));
    });
}

Cli(HELP, FLAGS)
  .then(({ cli, config, configFiles }) => {
    return cli.flags.watch
      ? watch(configFiles, cli)
      : updateOutput(config);
  })
  .catch(log.error);
