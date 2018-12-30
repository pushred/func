import Example from './pages/Example.html';
import { parse } from 'func-css/lib/colors';
import colors from 'func-colors';
import index from 'func-index';

new Example({
	target: document.querySelector('body'),
	data: {
	  colors: parse(colors),
	  index: index.map(style => ({
	    ...style,
	    className: style.selector.replace('.', ''),
	  })),
	},
});
