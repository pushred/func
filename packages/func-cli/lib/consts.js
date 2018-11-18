const CONFIG_NAME = 'func';

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
  indexJsonOutput: 'func-index.json',
};

module.exports = {
  CONFIG_NAME,
  DEFAULTS,
};
