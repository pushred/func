const { basename, dirname, resolve } = require('path');

const cosmiconfig = require('cosmiconfig');
const log = require('./logger');
const meow = require('meow');

const { CONFIG_NAME, DEFAULTS } = require('./consts');

const {
  ERR_INVALID_CONFIG_ARG,
  ERR_NO_CONFIG
} = require('./errors');

/**
 * searchConfigs
 * generates and writes stylesheet and JSON output files from latest configuration
 *
 * @param {Object} params
 * @param {string} params.configFlag - ?
 * @param {Object} params.explorer - cosmiconfig instance
 * @param [string] params.searchFrom - absolute file path
 * @emits {Promise} cosmiconfig search results
 * @private
 */

function searchConfigs({ configFlag, explorer, searchFrom = process.cwd() }) {
  return configFlag
    ? explorer.load(resolve(searchFrom, configFlag))
    : explorer.search(searchFrom)
}

/**
 * @typedef {Object} Configs
 * @property {Object} Configs.config
 * @property {Object} Configs.config.func - configuration
 * @property {Object} Configs.config.class - configuration
 * @property {Object} Configs.config.color - configuration
 * @property {array} Configs.configFiles - absolute file paths
 */

/**
 * loadConfigs
 * loads all configuration files and merges their contents
 *
 * @param {Object} params
 * @param {Object} params.explorer - cosmiconfig instance
 * @param {Object} params.searchResults - cosmiconfig search results
 * @emits {Promise} Configs
 * @private
 */

function loadConfigs({ cli, explorer, searchResults }) {
  if (searchResults === null) return Promise.reject(ERR_NO_CONFIG);

  const { config, isEmpty } = searchResults;
  if (isEmpty) return Promise.reject(ERR_NO_CONFIG);

  const { classes, colors } = config.files;
  const configDir = dirname(searchResults.filepath);

  return Promise.all([
    config,
    explorer.load(
      resolve(configDir, classes)
    ),
    explorer.load(
      resolve(configDir, colors)
    ),
  ]).then(result => ({
    config: {
      func: {
        ...result[0],
        ...cli.flags,
      },
      classes: result[1].config,
      colors: result[2].config,
    },
    configFiles: [
      result[1].filepath,
      result[2].filepath,
    ],
    searchResults,
  }));
}

/**
 * @typedef {Object} Cli
 * @property {Object} Cli.cli - meow instance
 * @property {Object} Cli.config - Configs
 * @property {array} Cli.configFiles - absolute file paths
 */

/**
 * Cli
 * merges configuration from files and command flags
 *
 * @param {Object} params
 * @param {Object} params.explorer - cosmiconfig instance
 * @param {Object} params.searchResults - cosmiconfig search results
 * @returns {Promise} Cli
 */

function Cli(help, options = {}) {
  options.description = false;

  const cosmicOptions = {
    searchPlaces: DEFAULTS.configFilenames,
  };

  const cli = meow(help, options);
  const explorer = cosmiconfig(CONFIG_NAME, cosmicOptions);

  return searchConfigs({
    explorer,
    configFlag: cli.flags.config,
    searchFrom: options.searchFrom,
  }).then(searchResults => loadConfigs({
    cli,
    explorer,
    searchResults,
  })).then(({ config, configFiles, searchResults }) => {
    cli.refreshConfigs = () => {
      explorer.clearLoadCache();
      return loadConfigs({ cli, explorer, searchResults });
    };

    return {
      cli,
      config,
      configFiles
    };
  });
}

module.exports = Cli;