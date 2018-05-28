const kebabCase = require('lodash.kebabcase');

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

export function expandClasses({ classes, palette }) {
  return Object.keys(classes).reduce((output, className) => {
    const property = getProperty({ className });

    const props = classes[className].split(/\s/);
    const states = props
      .filter(name => name.includes(':'))
      .map(state => {
        if (state[0] === '&') return state.substr(1); // nest-style
        if (state[0] === ':') return state; // shorthand
        return ' ' + state; // descendent
      });

    const colorKey = props[0];
    const colorValue = palette[colorKey];

    if (!colorValue) return output;

    const styles = `${property}: ${colorValue.css('hsl')}`;

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

export function generateClasses({ palette, properties = {}, states = {} }) {
  return Object.keys(palette).reduce((output, colorKey) => {
    const colorName = kebabCase(colorKey);
    const colorValue = palette[colorKey];

    return [
      ...output,
      ...Object.keys(properties).map(property => {
        const className = properties[property].replace('${name}', colorName);

        const pseudoClasses = Object.keys(states);
        const styles = `${property}: ${colorValue.css('hsl')}`;

        return [
          `.${className} { ${styles} }`,
          ...pseudoClasses.map(pseudoClassName => `.${className}:${pseudoClassName} { ${styles} }`),
        ];
      }),
    ];
  }, []).join('\n');
}
