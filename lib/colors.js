const chroma = require('chroma-js');
const isPlainObject = require('lodash.isplainobject');

function parse(colors) {
  return Object.keys(colors).reduce((output, colorKey) => {
    let colorVals = colors[colorKey];
    if (typeof colorVals === 'string') output[colorKey] = chroma(colorVals);
    if (!isPlainObject(colorVals)) return output;

    const colorModelName = Object.keys(colorVals).map(val => val[0]).join('');
    colorVals = Object.keys(colorVals).map(key => colorVals[key]);

    output[colorKey] = chroma.call(null, colorVals, colorModelName);

    return output;
  }, {});
}

module.exports = {
  parse,
};
