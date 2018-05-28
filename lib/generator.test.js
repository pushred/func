import { generateClasses } from './generator';
import { parse } from './colors';

function classTests() {
  const palette = parse({
    red: '#ff0000',
    blue: '#0000ff',
  });

  test('creates specified classes for each color', () => {
    const config = {
      classes: {
        color: '${name}-color',
      },
    };

    const output = generateClasses({ config, palette });
    expect(output).toEqual(expect.stringContaining('.red-color'));
    expect(output).toEqual(expect.stringContaining('.blue-color'));
  });

  test('assigns color values in HSL by default', () => {
    const config = {
      classes: {
        color: '${name}-color',
      },
    };

    const output = generateClasses({ config, palette });
    expect(output).toEqual(expect.stringContaining('hsl(0, 1, 0.5)'));
    expect(output).toEqual(expect.stringContaining('hsl(240, 1, 0.5)'));
  });

  test('pseuedo-classes', () => {
    const config = {
      classes: {
        color: '${name}-color',
      },
      states: {
        link: '*',
      },
    };

    const output = generateClasses({ config, palette });
    expect(output).toEqual(expect.stringContaining('.red-color:link'));
    expect(output).toEqual(expect.stringContaining('.blue-color:link'));
  });
}

describe('generates', () => {
  describe('classes', classTests);
});
