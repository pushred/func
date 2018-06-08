import { expandClasses, generateClasses } from './generator';
import { parse } from './colors';

function testExpandClasses() {
  const colors = {
    red: '#ff0000',
    gray: '#fafafa',
    white: '#fff',
    blue: '#0000ff',
  };

  test('css keywords passthrough', () => {
    const classes = {
      'button': 'currentColor',
      'button-bg': 'inherit',
      'button-border': 'initial',
    };

    const output = expandClasses({ classes, colors });
    expect(output).toEqual(expect.stringContaining('.button { color: currentColor'));
    expect(output).toEqual(expect.stringContaining('.button-bg { background-color: inherit'));
    expect(output).toEqual(expect.stringContaining('.button-border { border-color: initial'));
  });

  test('assigns named color to specified classes', () => {
    const classes = {
      'button': 'white',
      'button-bg': 'red',
      'button-border': 'red',
    };

    const output = expandClasses({ classes, colors });
    expect(output).toEqual(expect.stringContaining('.button { color'));
    expect(output).toEqual(expect.stringContaining('.button-bg { background-color'));
    expect(output).toEqual(expect.stringContaining('.button-border { border-color'));
  });

  test('pseudo-classes', () => {
    const classes = {
      'button': 'white :link',
      'button-bg': 'red *:link *:visited',
      'button-border': 'red &:link',
    };

    const output = expandClasses({ classes, colors });
    expect(output).toEqual(expect.stringContaining('.button:link { color'));
    expect(output).toEqual(expect.stringContaining('.button-bg *:link { background-color'));
    expect(output).toEqual(expect.stringContaining('.button-bg *:visited { background-color'));
    expect(output).toEqual(expect.stringContaining('.button-border:link { border-color'));
  });

  test('pseudo-elements', () => {
    const classes = {
      'input': 'gray ::placeholder',
    };

    const output = expandClasses({ classes, colors });
    expect(output).toEqual(expect.stringContaining('.input::placeholder { color'));
  });

  test('alpha adjuster', () => {
    const classes = {
      'button': 'white a(0.8)',
      'button-bg': 'white alpha(90%)',
    };

    const output = expandClasses({ classes, colors });
    expect(output).toEqual(expect.stringContaining('hsla(0, 0%, 100%, 0.8)'));
    expect(output).toEqual(expect.stringContaining('hsla(0, 0%, 100%, 0.9)'));
  });
}

function testGenerateClasses() {
  const colors = {
    red: '#ff0000',
    blue: '#0000ff',
  };

  test('creates specified classes for each color', () => {
    const properties = {
      color: '${name}-color',
    };

    const output = generateClasses({ colors, properties });
    expect(output).toEqual(expect.stringContaining('.red-color'));
    expect(output).toEqual(expect.stringContaining('.blue-color'));
  });

  test('assigns color values in HSL by default', () => {
    const properties = {
      color: '${name}-color',
    };

    const output = generateClasses({ colors, properties });
    expect(output).toEqual(expect.stringContaining('hsl(0, 100%, 50%)'));
    expect(output).toEqual(expect.stringContaining('hsl(240, 100%, 50%)'));
  });

  test('pseudo-classes', () => {
    const config = {
      properties: {
        color: '${name}-color',
      },
      states: [
        'link',
      ],
    };

    const output = generateClasses({ ...config, colors });

    expect(output).toEqual(expect.stringContaining('.red-color:link'));
    expect(output).toEqual(expect.stringContaining('.blue-color:link'));
  });
}

describe('generator', () => {
  describe('expandClasses', testExpandClasses);
  describe('generateClasses', testGenerateClasses);
});
