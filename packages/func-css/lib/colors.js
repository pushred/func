const chroma = require('chroma-js');
const isPlainObject = require('lodash.isplainobject');

const MIXTURES = ['shades', 'tints'];

const STOP_NAMES = {
  shade: [
    'dark',
    'darker',
    'darkest',
    'x-dark',
    'xx-dark',
    'xxx-dark',
  ],
  tint: [
    'light',
    'lighter',
    'lightest',
    'x-light',
    'xx-light',
    'xxx-light',
  ],
};

/**
 * @typedef {Object} Color
 * chroma.js color instance
 */

/**
 * parse
 * Parses color strings and configs to chroma.js instances
 * @private
 */

function parse(colors = {}) {
  return Object.keys(colors).reduce((output, colorKey) => {
    const rawColor = colors[colorKey];

    if (typeof rawColor === 'string') {
      output[colorKey] = getColorData({
        color: chroma(rawColor),
        colorName: colorKey,
      });
    }

    if (!isPlainObject(rawColor)) return output;

    const config = Object.keys(rawColor).reduce((config, key) => {
      (MIXTURES.includes(key))
        ? config.mixtures[key] = rawColor[key]
        : config.color[key] = rawColor[key];
      return config;
    }, {
      color: {},
      mixtures: {},
    });

    let colorModelName = Object.keys(config.color).map(val => val[0]).join('');
    if (colorModelName === 'hsb') colorModelName = 'hsv';

    const colorSpec = Object.keys(config.color).map(key => {
      const originalValue = config.color[key];
      const isPctValue = ['s', 'b', 'l', 'v'].includes(key[0]);
      if (!isPctValue) return originalValue;

      const value = parseFloat(originalValue);

      if (value === 0) return value;
      if (value > 1) return value / 100;
      return originalValue;
    });

    const hasHue = colorModelName === 'hsl' || colorModelName === 'hsv';
    const isBlack = colorSpec[1] === 0 && colorSpec[2] === 0;
    const isWhite = colorSpec[1] === 0 && colorSpec[2] === 1;

    if (hasHue && colorSpec[0] === 0 && (isBlack || isWhite)) {
      throw new Error('`0` is not a valid hue, pure black/white have none');
    }

    const baseColor = chroma.call(null, colorSpec, colorModelName);

    return {
      ...output,
      [colorKey]: getColorData({ color: baseColor, colorName: colorKey }),
      ...Object.keys(config.mixtures).reduce((mixtures, mixture) => ({
        ...mixtures,
        ...getMixtures({
          baseColor,
          colorName: colorKey,
          method: mixture.slice(0, -1), // singular
          stops: config.mixtures[mixture].stops,
        }),
      }), {}),
    };
  }, {});
}

/**
 * getColorData
 * Expands parsed color metadata
 * @param {String} colorName
 * @param {Color} color
 * @private
 */

 function getColorData({ color, colorName }) {
  return {
    color,
    colorName,
    hex: color.hex('rgb'),
    hsl: color.css('hsl'),
    rgb: color.css('rgb'),
  };
 }

/**
 * getMixtures
 * Generates a set of mixtures
 * @param {Color} baseColor
 * @param {('shade'|'tint')} method
 * @param {Number} stops
 * @private
 */

function getMixtures({ baseColor, colorName, method, stops = 2 } = {}) {
  if (!baseColor) return console.error('baseColor required');
  if (!method) return console.error('method required');

  let mixColor;
  if (method === 'tint') mixColor = chroma('white');
  if (method === 'shade') mixColor = chroma('black');

  return mix({
    stops,
    color1: baseColor,
    color2: mixColor,
  }).reduce((values, value, index) => ({
    ...values,
    [`${STOP_NAMES[method][index]}-${colorName}`]: {
      ...getColorData({ color: value, colorName }),
      mixture: {
        method,
        stop: STOP_NAMES[method][index],
      },
    },
  }), {});
}

/**
 * mixColor
 * Creates color mixtures for a specified number of stops
 * @param {Color} color1
 * @param {Color} color2
 * @param {Number} stops
 * @private
 */

function mix({ color1, color2, stops = 2 } = {}) {
  const ratioIncrement = 1 / (stops + 1);
  return [...Array(stops)].map((stop, index) => {
    return chroma.mix(color1, color2, ratioIncrement * (index + 1))
  });
}

module.exports = {
  mix,
  parse,
};
