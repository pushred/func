const { resolve } = require('path');

const Cli = require('./cli');
const meow = require('meow');
const logger = require('./logger');

const CONFIG_PATH = resolve(__dirname, '../../../test');
const HELP = 'help!';

describe('Cli', () => {
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
      .then(({ config }) => {
        const jsonConfig = JSON.parse(
          JSON.stringify(config)
            .split(CONFIG_PATH)
            .join('/var/tmp')
        );

        expect(jsonConfig).toMatchSnapshot()
      });
  });

  test('returns cosmiconfig search results', () => {
    return Cli(HELP, { searchFrom: CONFIG_PATH })
      .then(({ cli, configFiles }) => {
        expect(configFiles[0].includes('classes.yml'));
        expect(configFiles[1].includes('colors.yml'));
      });
  });
});
