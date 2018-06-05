#!/usr/bin/env node

const chalk = require('chalk');
const cosmiconfig = require('cosmiconfig');
const meow = require('meow');
const { dirname, join, resolve } = require('path');
const { writeFileSync } = require('fs');

const { expandClasses, generateClasses } = require('./generator');

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
  .then(generateStylesheet)
  .then(stylesheet => {
    const outputPath = cli.flags.output || DEFAULTS.output;
    writeFileSync(outputPath, stylesheet);
    console.info(chalk.green('✔'), chalk.gray('stylesheet saved to'), chalk.cyan(outputPath));
  })
  .catch(logError);
