#!/usr/bin/env node

const chalk = require('chalk');
const cosmiconfig = require('cosmiconfig');
const meow = require('meow');
const { dirname, join, resolve } = require('path');
const { writeFileSync } = require('fs');

const { parse } = require('./colors');
const { expandClasses, generateClasses, generateProps } = require('./generator');

const HELP = `
  Usage
    $ func [-o output path]

  Configuration is loaded from a file or a func key in your package.json

  Options
    -o, --output    Filepath for generated stylesheet
    --config        Custom config filename, defaults to (funcrc|func.config).(json|yaml|yml)
`;

const DEFAULTS = {
  configFilenames: [
    'package.json',
    '.funcrc',
    '.funcrc.json',
    '.funcrc.yaml',
    '.funcrc.yml',
    'func.config.json',
    'func.config.yaml',
    'func.config.yml',
  ],
  output: 'func.css',
  jsonOutput: 'func.json',
};

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
  if (!result) {
    const err = new Error('No configuration found');

    err.details = `
      Specify a func key in your package.json or create one of these files somewhere in your project:

      ${DEFAULTS.configFilenames.slice(1).join('\n')}

      A custom filename may be specified with --config

      Please reference the README for details regarding the structure of the config.
    `;

    throw err;
  }

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

function logError(err) {
  console.error(chalk.red(err));
  if (!err.details && !err.stack) return;

  if (err.details) {
    return console.log(
      chalk.gray(
        err.details
          .split(/\n/)
          .map(s => s.trim())
          .map(s => s.padStart(2 + s.length))
          .join('\n')
      )
    );
  }

  console.log(chalk.gray(
    err.stack
      .split(/\n/)
      .slice(1)
      .map(s => s.trim())
      .map(s => s.padStart(2 + s.length))
      .join('\n')
  ), '\n');
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

function validateArgs() {
  if (cli.flags.config && !/json|yaml|yml/.test(cli.flags.config)) {
    throw new Error('Config filename must have a .json, .yaml, or .yml extension');
  }

  return Promise.resolve();
}

validateArgs()
  .then(cosmiconfig('func', COSMIC_OPTIONS).search)
  .then(loadConfigs)
  .then(generate)
  .then(output => {
    const stylesheet = output[0];
    const stylesheetPath = cli.flags.output || DEFAULTS.output;

    writeFileSync(stylesheetPath, stylesheet);
    console.info(chalk.green('✔'), chalk.gray('stylesheet saved to'), chalk.cyan(stylesheetPath));

    const json = output[1];
    const targetBase = dirname(stylesheetPath);
    const jsonPath = cli.flags.jsonOutput || join(targetBase, DEFAULTS.jsonOutput);

    if (!json) return;
    writeFileSync(jsonPath, json);
    console.info(chalk.green('✔'), chalk.gray('JSON saved to'), chalk.cyan(jsonPath));
  })
  .catch(logError);
