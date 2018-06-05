const kebabCase = require('lodash.kebabcase');

const { parse } = require('./colors');

/**
 * adjustColor
 * Applies Chroma.js functions
 * @private
 */

function adjustColor(color, adjuster) {
  const name = adjuster.split('(')[0];
  const value = /\((.*)\)/.exec(adjuster)[1];

  const decimalValue = value.includes('%')
    ? parseInt(value, 10) / 100
    : value;

  if (name === 'a' || name === 'alpha' || name === 'opacity') {
    return color.alpha(decimalValue);
  }

  return color;
}

/**
 * getProperty
 * Maps a class containing a shorthand alias to a full CSS property name
 * @private
 */

function getProperty({
  className,
  propertyAliases = {
    bg: 'background-color',
    border: 'border-color',
  },
}) {
  const alias = Object.keys(propertyAliases).find(alias => className.includes(alias));
  if (!alias) return 'color';

  return propertyAliases[alias];
}

/**
 * expandClasses
 * Expands color/pseudo-class shorthand config into one or more classes
 */

function expandClasses({ classes, colors }) {
  const chromaColors = parse(colors);

  return Object.keys(classes).reduce((output, className) => {
    const property = getProperty({ className });

    const value = classes[className];
    const adjusterFn = /[a-z]*\(.*\)/.exec(value);
    const props = adjusterFn
      ? value.replace(adjusterFn[0], '').split(/\s/)
      : value.split(/\s/);

    const states = props
      .filter(name => name.includes(':'))
      .map(state => {
        if (state[0] === '&') return state.substr(1); // nest-style
        if (state[0] === ':') return state; // shorthand
        return ' ' + state; // descendent
      });

    const colorKey = props[0];
    const colorValue = adjusterFn
      ? adjustColor(chromaColors[colorKey], adjusterFn[0])
      : chromaColors[colorKey];

    if (!colorValue) return output;

    const styles = `${property}: ${colorValue.css('hsl').replace(/,/g, ', ')}`;

    return [
      ...output,
      `.${className} { ${styles} }`,
      ...states.map(pseudoClassName => `.${className}${pseudoClassName} { ${styles} }`),
    ];
  }, []).join('\n');
}

/**
 * generateClasses
 * Creates a named color class for each configured property
 */

function generateClasses({ colors, properties = {}, states = [] }) {
  const chromaColors = parse(colors);

  return Object.keys(colors).reduce((output, colorKey) => {
    const colorName = kebabCase(colorKey);
    const colorValue = chromaColors[colorKey];

    return [
      ...output,
      ...Object.keys(properties).map(property => {
        const className = properties[property].replace('${name}', colorName);

        const styles = `${property}: ${colorValue.css('hsl').replace(/,/g, ', ')}`;

        return [
          `.${className} { ${styles} }`,
          ...states.map(pseudoClassName => `.${className}:${pseudoClassName} { ${styles} }`),
        ];
      }),
    ];
  }, []).join('\n');
}

module.exports = {
  expandClasses,
  generateClasses,
};
