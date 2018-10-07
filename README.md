func
====

> Express a design system with configuration, get your classes for free

[Functional CSS][functional-css] is the best! Writing tons of classes is a chore. Libraries like [Tachyons][] help, but only go as far as their authors wish to. Other libraries sometimes go _too_ far.

**func** currently focuses on generating classes from a color palette. It outputs a stylesheet that you can import alongside your own CSS, or those from libraries. It also outputs JSON for import into JavaScript modules.

Table of Contents
-----------------

- [Install](#install)
- [Usage](#usage)
- [Configuration](#configuration)
- [Custom Classes](#custom-classes)
- [Colors](#colors)
- [Contribute](#contribute)
- [License](#license)

Install
-------

```sh
npm install func-css
```

or:

```sh
yarn add func-css
```

try it out first:

```sh
npx func
```

Usage
-----

```
$ func --help

  Usage
    $ func [-o output path]

  Configuration is loaded from a file or a func key in your package.json

  Options
    -o, --output    Filepath for generated stylesheet
    --jsonOutput    Filepath for generated JSON
    --config        Custom config filename, defaults to (funcrc|func.config).(json|yaml|yml)
```

Configuration
-------------

- `files`

  - `classes` relative filepath for optional [class config](#classes)
  - `colors` relative filepath for [colors config](#colors)

- `properties`

  - `{css-property-name}` desired class name format, interpolate colors with `${name}`

- `states` array of [pseudo-class][] names to generate for each property

Output
------

### CSS

Specified classes are expanded with colors in HSL functional notation, or HSLA wherever alpha is specified.

```css
.red-color { color: hsl(0, 100%, 50%) }
.bg-red-color { background-color: hsl(0, 100%, 50%) }
.b--red-color { border-color: hsla(0, 100%, 50%, 0.5) }
.blue-color { color: hsl(240, 100%, 50%) }
.bg-blue-color { background-color: hsl(240, 100%, 50%) }
.b--blue-color { border-color: hsla(240, 100%, 50%, 0.5) }
```

### JSON

JSON property names are camelCased and colors are output in hex notation for broader compatibility. rgba values are used whenever alpha is specified.

```json
{
  "redColor": "#f00000",
  "redBg": "#f00000",
  "redBorder": "rgba(240, 0, 0, 0.5)",
  "blueColor": "#0000ff",
  "blueBg": "#0000ff",
  "blueBorder": "rgba(0, 0, 255, 0.5)"
}
```

Custom Classes
--------------

It’s often best to avoid including the names of colors in your classes. Stay flexible with role-based names mapped to colors:

```yaml
error: red-aa
error-bg: red
error-border: red

success: green-aa
success-bg: green
success-border: green
```

### Property Suffixes

Note the use of suffixes in the class names in the example above. They not only provide a unique name but also assign CSS properties they alias.

|suffix   |property          |
|---------|------------------|
|—        |color             |
|bg       |background-color  |
|border   |border-color      |

### Child Selectors

Space-separated child selectors following the named color will be appended to the class selector:

```yaml
disabled: gray *:link *:visited *:hover *:active input::placeholder
```

↓

```css
.disabled *:link *:visited *:hover *:active input::placeholder { color: hsl(0, 0%, 50%) }
```

Order is respected, [sometimes it matters][lvha].

### Pseudo Classes

Use a `&` selector shorthand to specify pseudo-classes:

```yaml
disabled: gray &:link &:visited &:hover &:active input::placeholder
```

↓

```css
.disabled:link { color: hsl(0, 0%, 50%) }
.disabled:visited { color: hsl(0, 0%, 50%) }
.disabled:hover { color: hsl(0, 0%, 50%) }
.disabled:active { color: hsl(0, 0%, 50%) }
.disabled input::placeholder { color: hsl(0, 0%, 50%) }
```

### Alpha Adjuster

Tweak the alpha of a color like so:

```yaml
disabled: gray a(0.8)
```

Only this adjuster is supported for now. You can specify additional shades and tints of your colors using sensible systems like HSL.

### CSS Keywords

Classes mapped to [CSS Keywords][css-keywords] such as `currentColor` and `transparent` can also be defined. Any values that don’t match a named color will passthrough.

Colors
------

Define your palette as a mapping of color names to values in any of these formats:

- `#ff0000` hex
- `#fff` shorthand hex, `#` is optional
- `255, 0, 0` comma-separated rgb values

These color models can also be used:

- HSL
- HSB
- HSV
- Lab
- RGB

…with a verbose object:

```yaml
hue: 0
saturation: 100%
lightness: 50%
```

…or a terse object:

```yaml
h: 0
s: 100%
l: 50%
```

Colors are parsed and converted with the powers of [chroma.js][]

Contribute
----------

Pull requests accepted!

License
-------

**[ISC](./LICENSE) LICENSE**  
Copyright &copy; 2017 Push the Red Button

[functional-css]: https://marcelosomers.com/writing/rationalizing-functional-css/
[tachyons]: https://tachyons.io/

[pseudo-class]: https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes
[css-keywords]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
[lvha]: https://meyerweb.com/eric/thoughts/2007/06/04/ordering-the-link-states/
[chroma.js]: http://gka.github.io/chroma.js/#quick-start
