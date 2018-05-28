import chroma from 'chroma-js';
import { parse } from './colors';

function parseTests() {
  test('hex values', () => {
    const palette = { red: '#ff0000' };
    const output = parse(palette);
    expect(output.red.constructor.name).toEqual('Color');
  });

  test('color model values (terse)', () => {
    const palette = {
      red: {
        h: 360,
        s: 100,
        b: 100,
      },
    };

    const output = parse(palette);
    expect(output.red.constructor.name).toEqual('Color');
  });

  test('color model values (verbose)', () => {
    const palette = {
      red: {
        hue: 360,
        saturation: 100,
        brightness: 100,
      },
    };

    const output = parse(palette);
    expect(output.red.constructor.name).toEqual('Color');
  });
}

describe('colors', () => {
  describe('parses and normalizes', parseTests);
});
