const { resolve } = require('path');

const Cli = require('./cli');
const meow = require('meow');
const logger = require('./logger');

const CONFIG_PATH = resolve(__dirname, '../test');
const HELP = 'help!';

describe.only('Cli', () => {
  beforeEach(() => {
    process.argv = [];
  });

  test('returns a meow object', () => {
    return Cli(HELP, { searchFrom: CONFIG_PATH })
      .then(({ cli }) => {
        expect(Object.keys(cli))
          .toEqual(expect.arrayContaining(['input', 'flags', 'help']));
      });
  });

  test('loads config specified by flag', () => {
    process.argv = ['/usr/local/bin/node', 'cli.js', '--config', 'package.json'];

    return Cli(HELP, { searchFrom: CONFIG_PATH })
      .then(({ config }) => {
        expect(Object.keys(config))
          .toEqual(expect.arrayContaining(['func', 'colors', 'classes']));
        });
  });

  test('searches for config files', () => {
    return Cli(HELP, { searchFrom: CONFIG_PATH })
      .then(({ config }) => {
        expect(Object.keys(config))
          .toEqual(expect.arrayContaining(['func', 'colors', 'classes']));
        });
  });

  test('rejects if no config files are found', () => {
    return Cli(HELP)
      .catch(err => expect(err.message).toEqual('No configuration found'));
  });

  test('returns loaded config files', () => {
    return Cli(HELP, { searchFrom: CONFIG_PATH })
      .then(({ config }) => expect(config).toMatchSnapshot());
  });

  test('returns cosmiconfig search results', () => {
    const classesPath = resolve(__dirname, '../test/classes.yml');
    const colorsPath = resolve(__dirname, '../test/colors.yml');

    return Cli(HELP, { searchFrom: CONFIG_PATH })
      .then(({ cli, configFiles }) => {
        expect(configFiles).toEqual(expect.arrayContaining([
          classesPath,
          colorsPath,
        ]));
      });
  });
});
