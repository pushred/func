const chroma = require('chroma-js');
const { parse } = require('./colors');

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

  test('percentages are preserved', () => {
    const palette = {
      red: {
        hue: 0,
        saturation: 0.65,
        lightness: 0.5,
      },
    };

    const output = parse(palette);

    const hslRed = output.red.hsl();

    expect(hslRed[0]).toBeCloseTo(0);
    expect(hslRed[1]).toBeCloseTo(0.647);
    expect(hslRed[2]).toBeCloseTo(0.5);
  });

  test('percentages specified as integers are converted', () => {
    const palette = {
      red: {
        hue: 360,
        saturation: 100,
        brightness: 50,
      },
      green: {
        hue: 90,
        saturation: 100,
        lightness: 50,
      },
      blue: {
        hue: 240,
        saturation: 100,
        value: 50,
      },
    };

    const output = parse(palette);

    const hslRed = output.red.hsl();
    const hslGreen = output.green.hsl();
    const hslBlue = output.blue.hsl();

    expect(hslRed[0]).toBeCloseTo(0);
    expect(hslRed[1]).toBeCloseTo(1);
    expect(hslRed[2]).toBeCloseTo(0.25);
    expect(hslGreen[0]).toBeCloseTo(89.88);
    expect(hslGreen[1]).toBeCloseTo(1);
    expect(hslGreen[2]).toBeCloseTo(0.5);
    expect(hslBlue[0]).toBeCloseTo(240);
    expect(hslBlue[1]).toBeCloseTo(1);
    expect(hslBlue[2]).toBeCloseTo(0.25);
  });
}

describe('colors', () => {
  describe('parses and normalizes', parseTests);
});
