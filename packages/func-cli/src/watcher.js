const log = require('./logger');

let chokidar;

try {
  chokidar = require('chokidar');
} catch (err) {
  chokidar = null;
}

const {
  ERR_MISSING_CHOKIDAR,
} = require('./errors');

/**
 * Watcher
 * uses Chokidar to watch specified files for changes
 *
 * @param {array} files - absolute file paths
 *
 @ @emits change
 * @returns chokidar instance
 */

function Watcher(files = []) {
  if (!chokidar) return Promise.reject(ERR_MISSING_CHOKIDAR);

  const watcher = chokidar.watch(files)
  watcher.on('ready', () => { log.info('watching…') });

  return watcher;
}

module.exports = Watcher;
