#!/usr/bin/env node

const cosmiconfig = require('cosmiconfig');
const meow = require('meow');
const { basename, dirname, join, resolve } = require('path');
const { writeFileSync } = require('fs');

let chokidar;

try {
  chokidar = require('chokidar');
} catch (err) {
  chokidar = null;
}

const { DEFAULTS } = require('./consts');
const { parse } = require('./colors');
const log = require('./logger');
const { expandClasses, generateClasses, generateProps } = require('./generator');

const {
  ERR_INVALID_CONFIG_ARG,
  ERR_MISSING_CHOKIDAR,
  ERR_NO_CONFIG
} = require('./errors');

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

const cli = meow(HELP, {
  flags: {
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
  },
});

const getConfig = cosmiconfig('func');

const COSMIC_OPTIONS = {
  searchPlaces: [
    ...DEFAULTS.configFilenames,
    cli.flags.config,
  ].filter(Boolean),
};

function loadConfigs(result) {
  if (!result) return Promise.reject(ERR_NO_CONFIG);

  const config = result.config;
  const { classes, colors } = result.config.files;

  return Promise.all([
    config,
    getConfig.load(
      resolve(dirname(result.filepath), classes)
    ),
    getConfig.load(
      resolve(dirname(result.filepath), colors)
    ),
  ]).then(result => ({
    func: result[0],
    classes: result[1].config,
    colors: result[2].config,
  }));
}

function generate(params) {
  return Promise.all([
    generateStylesheet(params),
    generateJson(params),
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

function updateOutput(searchResult) {
  return loadConfigs(searchResult)
    .then(generate)
    .then(output => {
      const stylesheet = output[0];
      const stylesheetPath = cli.flags.output || DEFAULTS.output;

      writeFileSync(stylesheetPath, stylesheet);
      log.save('stylesheet saved to', stylesheetPath);

      const json = output[1];
      const targetBase = dirname(stylesheetPath);
      const jsonPath = cli.flags.jsonOutput || join(targetBase, DEFAULTS.jsonOutput);

      if (!json) return;
      writeFileSync(jsonPath, json);
      log.save('JSON saved to', jsonPath);
    })
    .catch(log.error);
}

function validateArgs() {
  if (cli.flags.config && !/json|yaml|yml/.test(cli.flags.config)) {
    return Promise.reject(ERR_INVALID_CONFIG_ARG);
  }

  return Promise.resolve();
}

function watch({ searchResult }) {
  if (!chokidar) return Promise.reject(ERR_MISSING_CHOKIDAR);
  if (searchResult.isEmpty) return Promise.reject(ERR_NO_CONFIG);

  const files = searchResult.config.files || {};

  const configFiles = [
    files.classes && resolve(dirname(searchResult.filepath), files.classes),
    files.colors && resolve(dirname(searchResult.filepath), files.colors)
  ].filter(Boolean);

  chokidar.watch(configFiles)
    .on('ready', () => { log.info('watching…') })
    .on('change', (path) => {
      getConfig.clearLoadCache();
      log.info(`${basename(path)} changed, regenerating…`);
      updateOutput(searchResult);
    });
}

validateArgs()
  .then(cosmiconfig('func', COSMIC_OPTIONS).search)
  .then(searchResult => {
    return cli.flags.watch
      ? watch({ searchResult })
      : updateOutput(searchResult);
  })
  .catch(log.error);
