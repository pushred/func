#!/usr/bin/env node

const { readFileSync } = require('fs');

const { Cli, log } = require('func-cli');
const { DEFAULTS } = require('func-cli/lib/consts');

const postcss = require('postcss');
const postcssImport = require('postcss-import');

const HELP = `
  Usage
    $ func-index  [-o output path]

  Options
    -o, --output    Filepath for generated JSON, defaults to func-index.json
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

function parseStyles(ast) {
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

Cli(HELP, FLAGS)
  .then(({ cli, config, saveJson }) => {
    const cssPath = cli.input[0] || config.output;

    if (!cssPath) {
      return Promise.reject('Must specify path to a stylesheet');
      return;
    }

    const css = readFileSync(cssPath, 'utf-8');

    postcss()
      .use(postcssImport)
      .process(css, { from: cssPath })
      .then(parseStyles)
      .then(data => saveJson({
        data,
        name: DEFAULTS.indexJsonOutput,
        outputPath: cli.flags.output,
      }));
  })
  .catch(log.error);
