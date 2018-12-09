#!/usr/bin/env node

const { readFileSync } = require('fs');
const { basename } = require('path');

const { Cli, log, saveJson, Watcher } = require('func-cli');
const { DEFAULTS } = require('func-cli/lib/consts');

const postcss = require('postcss');
const postcssImport = require('postcss-import');

const HELP = `
  Usage
    $ func-index [-o output path]

  Options
    -o, --output    Filepath for generated JSON, defaults to func-index.json
    --watch         Watch stylesheet and regenerate on changes
`;

const FLAGS = {
  config: {
    type: 'string',
  },
  output: {
    type: 'string',
    alias: 'o',
  },
};

/**
 * parseStylesheet
 * loads stylesheet and parses to an AST
 *
 * @param {object} cli - instance
 * @param {object} config - merged config
 * @returns {object} PostCSS AST
 */

function parseStylesheet({ cli, config }) {
  const cssPath = cli.input[0] || config.output;

  if (!cssPath) {
    return Promise.reject('Must specify path to a stylesheet');
  }

  const css = readFileSync(cssPath, 'utf-8');

  return postcss()
    .use(postcssImport)
    .process(css, { from: cssPath });
}

/**
 * indexStyles
 * transforms AST to func-index data
 *
 * @param {object} ast - PostCSS AST
 * @returns {object} index data
 */

function indexStyles(ast) {
  return ast.root.nodes.reduce((rulesets, ruleset) => {
    if (!ruleset.selector) return rulesets;
    if (!Array.isArray(ruleset.nodes)) return rulesets;

    return [
      ...rulesets,
      {
        selector: ruleset.selector,
        props: ruleset.nodes.reduce((props, prop) => ([
          ...props,
          {
            property: prop.prop,
            value: prop.value,
          },
        ]), []),
      },
    ];
  }, []);
}

/**
 * updateIndex
 * changes detected in stylesheets trigger regeneration and new output files
 *
 * @param {object} cli - instance
 * @param {object} config - merged config
 * @fires saveJson
 */

function updateIndex({ cli, config }) {
  return parseStylesheet({ cli, config })
    .then(indexStyles)
    .then(data => saveJson({
      config,
      data,
      name: DEFAULTS.indexJsonOutput,
      outputPath: cli.flags.output,
    }));
}

/**
 * watch
 * changes detected in stylesheets trigger regeneration and new output files
 *
 * @param {array} stylesheets - absolute file paths
 * @fires parseStyles
 */

function watch({ cli }) {
  const cssPath = cli.input[0] || config.output;

  if (!cssPath) {
    return Promise.reject('Must specify path to a stylesheet');
  }

  Watcher(cssPath)
    .on('change', (path) => {
      log.info(`${basename(path)} changed, updating index…`);
      cli.refreshConfigs()
        .then(({ config }) => updateIndex({ cli, config }))
        .catch(log.error);
    });
}

Cli(HELP, FLAGS)
  .then(({ cli, config }) => (
    cli.flags.watch
      ? watch({ cli, config })
      : updateIndex({ cli, config })
  ))
  .catch(err => {
    throw new Error(err);
  });
