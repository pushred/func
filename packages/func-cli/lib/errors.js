const { DEFAULTS } = require('./consts');

const ERR_NO_CONFIG = new Error('No configuration found');

ERR_NO_CONFIG.details = `
  Specify a func key in your package.json or create one of these files somewhere in your project:

  ${DEFAULTS.configFilenames.slice(1).join('\n')}

  A custom filename may be specified with --config

  Please reference the README for details regarding the structure of the config.
`;

const ERR_INVALID_CONFIG_ARG = new Error('Config filename must have a .json, .yaml, or .yml extension');

const ERR_MISSING_CHOKIDAR = new Error('Optional chokidar dependency is required to use watch mode');

module.exports = {
  ERR_INVALID_CONFIG_ARG,
  ERR_MISSING_CHOKIDAR,
  ERR_NO_CONFIG
};
