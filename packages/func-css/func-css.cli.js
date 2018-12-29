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
    --tokensOutput    Filepath for generated design tokens
    --config        Custom config filename, defaults to (funcrc|func.config).(json|yaml|yml)
    --watch         Watch config files and regenerate on changes, specify extra space-separated paths to watch
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
  tokensOutput: {
    type: 'string',
  },
  watch: {
    type: 'string',
    default: '',
  },
};

/**
 * generate
 * @params {Object} config - merged configuration
 * @returns {Promise} generator results
 */

function generate(config) {
  config.colors = parse(config.colors);

  return Promise.all([
    generateStylesheet(config),
    generateJson(config),
    generateTokens(config),
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

function generateTokens({ colors = {} } = {}) {
  const tokens = Object.keys(colors).reduce((tokens, colorName) => ({
    ...tokens,
    [colorName]: colors[colorName].hex,
  }), {});

  return JSON.stringify(tokens, null, 2);
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
      const tokens = output[2];

      writeFileSync(config.paths.stylesheet, stylesheet);
      log.save('stylesheet saved to', config.paths.stylesheet);

      if (json) {
        writeFileSync(config.paths.json, json);
        log.save('JSON saved to', config.paths.json);
      }

      if (tokens) {
        writeFileSync(config.paths.tokens, tokens);
        log.save('design tokens saved to', config.paths.tokens);
      }
    });
}

/**
 * watch
 * changes detected in config files trigger regeneration and new output files
 *
 * @param {array} configFiles - absolute file paths
 * @fires updateOutput
 */

function watch({ cli, configFiles = [] }) {
  Watcher(configFiles)
    .on('change', (path) => {
      log.info(`${basename(path)} changed, regenerating…`);
      cli.refreshConfigs()
        .then(({ config }) => updateOutput(config))
        .catch(log.error);
    });
}

Cli(HELP, FLAGS)
  .then(({ cli, config, configFiles }) => (
    cli.flags.watch
      ? watch({ cli, configFiles })
      : updateOutput(config)
  ))
  .catch(err => {
    throw err;
  });
