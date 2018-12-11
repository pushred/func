const { expandClasses, generateClasses, generateProps } = require('./generator');
const { parse } = require('./colors');

function testExpandClasses() {
  const colors = parse({
    red: '#ff0000',
    gray: '#fafafa',
    white: '#fff',
    blue: '#0000ff',
  });

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

  test('property is not applied to base selector when interactive pseudo-classes are specified', () => {
    const classes = {
      'button': 'white :link',
      'button-focus': 'blue :focus',
      'button-hover': 'blue :hover',
    };

    const output = expandClasses({ classes, colors });
    expect(output).toEqual(expect.stringContaining('.button:link { color'));
    expect(output).toEqual(expect.stringContaining('.button-focus:focus { color'));
    expect(output).toEqual(expect.stringContaining('.button-hover:hover { color'));
    expect(output).not.toEqual(expect.stringContaining('.button-focus { color'));
    expect(output).not.toEqual(expect.stringContaining('.button-hover { color'));
  });

  test('pseudo-elements', () => {
    const classes = {
      'input::placeholder': 'gray',
    };

    const output = expandClasses({ classes, colors });
    expect(output).not.toEqual(expect.stringContaining('.input { color'));
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

  test('snapshot', () => {
    const classes = {
      'button': 'white :link :visited :active *:link *:visited *:active',
      'button-bg': 'red &:link &:visited &:active',
      'button-bg-hover': 'red :hover *:hover',
      'button-border': 'red &:link &:visited &:active',
      'input::placeholder': 'gray',
    };

    expect(expandClasses({ classes, colors })).toMatchSnapshot();
  });
}

function testGenerateClasses() {
  const colors = parse({
    red: '#ff0000',
    blue: '#0000ff',
  });

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

  test('snapshot', () => {
    const colors = parse({
      red: '#ff0000',
      white: '#fff',
      blue: '#0000ff',
    });

    const config = {
      properties: {
        color: '${name}-color',
      },
      states: [
        'link',
        'visited',
        'active',
      ],
    };

    expect(generateClasses({ ...config, colors })).toMatchSnapshot();
  });
}

function testGenerateProps() {
  test('snapshot', () => {
    const colors = parse({
      red: '#ff0000',
      white: '#fff',
      blue: '#0000ff',
    });

    const classes = {
      'button': 'white',
      'button-bg': 'red',
      'button-border': 'red',
    };

    const config = {
      properties: {
        color: '${name}-color',
      },
      states: [
        'link',
        'visited',
        'active',
      ],
    };

    expect(generateProps({ ...config, classes, colors })).toMatchSnapshot();
  });

  test('values with alpha use rgba notation', () => {
    const colors = parse({
      white: '#fff',
    });

    const classes = {
      'button': 'white a(0.5)',
    };

    const props = generateProps({ classes, colors });
    expect(props.button).toEqual('rgba(255, 255, 255, 0.5)');
  });
}

describe('generator', () => {
  describe('expandClasses', testExpandClasses);
  describe('generateClasses', testGenerateClasses);
  describe('generateProps', testGenerateProps);
});
