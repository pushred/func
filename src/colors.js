import chroma from 'chroma-js';
import isPlainObject from 'lodash.isplainobject';

function parse(colors = {}) {
  return Object.keys(colors).reduce((output, colorKey) => {
    let colorVals = colors[colorKey];
    if (typeof colorVals === 'string') output[colorKey] = chroma(colorVals);
    if (!isPlainObject(colorVals)) return output;

    let colorModelName = Object.keys(colorVals).map(val => val[0]).join('');
    if (colorModelName === 'hsb') colorModelName = 'hsv';

    colorVals = Object.keys(colorVals).map(key => (
      ['s', 'b', 'l', 'v'].includes(key[0]) && parseInt(colorVals[key], 10) > 1
        ? parseInt(colorVals[key], 10) / 100
        : colorVals[key]
    ));

    output[colorKey] = chroma.call(null, colorVals, colorModelName);

    return output;
  }, {});
}

module.exports = {
  parse,
};
