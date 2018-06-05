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

  Create a func.config.json file in your project’s root or a config directory

  Options
    -o, --output    Filepath to write generated stylesheet
`;

const DEFAULTS = {
  output: 'func.css',
};

const cli = meow(HELP, {
  flags: {
    output: {
      type: 'string',
      alias: 'o',
    }
  },
});

const getConfig = cosmiconfig('func', {
  searchPlaces: [
    'package.json',
    '.funcrc',
    '.funcrc.json',
    '.funcrc.yaml',
    '.funcrc.yml',
    'func.config.json',
    'func.config.yaml',
    'func.config.yml',
  ],
});

function loadConfigs(result) {
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
  console.log(chalk.gray(
    err.stack
      .split(/\n/)
      .slice(1)
      .map(s => s.trim())
      .map(s => s.padStart(2 + s.length))
      .join('\n')
  ), '\n');
}

function generateStylesheet({ func, classes, colors }) {
  const { properties } = func;
  return [
    func.properties && generateClasses({ properties, colors }),
    classes && expandClasses({ classes, colors }),
  ].filter(Boolean).join(/\n/);
}

getConfig.search()
  .then(loadConfigs)
  .then(generateStylesheet)
  .then(stylesheet => {
    const outputPath = cli.flags.output || DEFAULTS.output;
    writeFileSync(outputPath, stylesheet);
    console.info(chalk.green('✔'), chalk.gray('stylesheet saved to'), chalk.cyan(outputPath));
  })
  .catch(logError);
