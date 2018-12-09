const chroma = require('chroma-js');
const { mix, parse } = require('./colors');

function mixTests() {
  const palette = parse({ red: '#ff0000' });
  const mixtures = mix({ color1: palette.red, color2: chroma('white'), stops: 3  });

  test('mix stops', () => {
    expect(mixtures).toHaveLength(3);
  });

  test('steps are equidistant', () => {
    const lightness = mixtures.map(color => color.hsl()[2]);
    const step1 = lightness[0] - lightness[1];
    const step2 = lightness[1] - lightness[2];

    expect(step1).toBeCloseTo(step2);
  });
}

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
        hue: 360,
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

  test('invalid hues', () => {
    const palette = {
      gray: {
        hue: 0,
        saturation: '0%',
        lightness: '0%',
      },
    };

    expect(() => {
      parse(palette)
    }).toThrow();
  });

  test('shades', () => {
    const palette = {
      gray: {
        hue: 360,
        saturation: 0,
        brightness: 0,
        shades: 3,
      },
    };

    const output = parse(palette);

    expect(Object.keys(output)).toEqual(
      expect.arrayContaining(['gray', 'dark-gray', 'darker-gray'])
    );

    Object.values(output).forEach(val => {
      expect(val.constructor.name).toEqual('Color');
    });
  });

  test('tints', () => {
    const palette = {
      gray: {
        hue: 360,
        saturation: 0,
        brightness: 0,
        tints: 3,
      },
    };

    const output = parse(palette);

    expect(Object.keys(output)).toEqual(
      expect.arrayContaining(['gray', 'light-gray', 'lighter-gray'])
    );

    Object.values(output).forEach(val => {
      expect(val.constructor.name).toEqual('Color');
    });
  });
}

describe('colors', () => {
  describe('parses and normalizes', parseTests);
  describe('mixtures', mixTests);
});
