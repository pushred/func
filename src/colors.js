import chroma from 'chroma-js';
import isPlainObject from 'lodash.isplainobject';

function parse(colors = {}) {
  return Object.keys(colors).reduce((output, colorKey) => {
    const rawColor = colors[colorKey];
    if (typeof rawColor === 'string') output[colorKey] = chroma(rawColor);
    if (!isPlainObject(rawColor)) return output;

    let colorModelName = Object.keys(rawColor).map(val => val[0]).join('');
    if (colorModelName === 'hsb') colorModelName = 'hsv';

    const color = Object.keys(rawColor).map(key => (
      ['s', 'b', 'l', 'v'].includes(key[0]) && parseInt(rawColor[key], 10) > 1
        ? parseInt(rawColor[key], 10) / 100
        : rawColor[key]
    ));

    output[colorKey] = chroma.call(null, color, colorModelName);

    return output;
  }, {});
}

module.exports = {
  parse,
};
