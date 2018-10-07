const chalk = require('chalk');

function logInfo(details) {
  console.info(chalk.cyan('[func]'), chalk.gray(details));
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
          .trim()
      )
    );
  }

  console.log(
    chalk.gray(
      err.stack
        .split(/\n/)
        .slice(1)
        .map(s => s.trim())
        .map(s => s.padStart(2 + s.length))
        .join('\n')
    )
  );
}

function logSave(details, path) {
  console.info(chalk.green('✔'), chalk.gray(details), chalk.cyan(path));
}

module.exports = {
  info: logInfo,
  error: logError,
  save: logSave
};
