const kebabCase = require('lodash.kebabcase');

export function generateClasses({ config, palette }) {
  const safeConfig = {
    classes: config.classes || {},
    states: config.states || {},
  };

  return Object.keys(palette).reduce((output, colorKey) => {
    const colorName = kebabCase(colorKey);
    const colorValue = `hsl(${palette[colorKey].hsl().join(', ')})`;

    return [
      ...output,
      ...Object.keys(safeConfig.classes).map(property => {
        const className = safeConfig.classes[property].replace('${name}', colorName);
        const states = Object.keys(safeConfig.states);
        const styles = `${property}: ${colorValue}`;

        return [
          `.${className} { ${styles} }`,
          ...states.map(pseudoClassName => `.${className}:${pseudoClassName} { ${styles} }`),
        ];
      }),
    ];
  }, []).join('\n');
}
