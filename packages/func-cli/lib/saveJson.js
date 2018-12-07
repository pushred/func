const { resolve } = require('path');
const { writeFileSync } = require('fs');

const log = require('./logger');

/**
 * saveJson
 *
 * @param {Object|array} data - suitable for JSON serialization
 * @param {string} outputPath - custom path/filename
 *
 * @emits func-index.json file
 */

function saveJson({ config, data, name, outputPath } = {}) {
  if (data === undefined) throw('`data` is undefined');
  if (name === undefined) throw('`name` is undefined');
  if (outputPath === undefined && config.basePath === undefined) {
    throw('`outputPath` or `config` is required');
  }

  const json = JSON.stringify(data, null, 2);
  const jsonPath = outputPath || resolve(config.basePath, name);
  writeFileSync(jsonPath, json);
  log.save('JSON saved to', jsonPath);
}

module.exports = saveJson;
