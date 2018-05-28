import chroma from 'chroma-js';
import isPlainObject from 'lodash.isplainobject';

export function parse(palette) {
  return Object.keys(palette).reduce((output, colorName) => {
    let colorVals = palette[colorName];
    if (typeof colorVals === 'string') output[colorName] = chroma(colorVals);
    if (!isPlainObject(colorVals)) return output;

    const colorModelName = Object.keys(colorVals).map(val => val[0]).join('');
    colorVals = Object.keys(colorVals).map(key => colorVals[key]);

    output[colorName] = chroma.call(null, colorVals, colorModelName);

    return output;
  }, {});
}
