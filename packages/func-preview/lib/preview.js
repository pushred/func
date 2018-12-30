import Example from './pages/Example.html';
import colors from 'func-colors';
import index from 'func-index';

new Example({
	target: document.querySelector('body'),
	data: {
	  colors,
	  index: index.map(style => ({
	    ...style,
	    className: style.selector.replace('.', ''),
	  })),
	},
});
