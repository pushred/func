import Example from './pages/Example.html';
import index from 'func-index';

new Example({
	target: document.querySelector('body'),
	data: {
	  index: index.map(style => ({
	    ...style,
	    className: style.selector.replace('.', ''),
	  })),
	},
});
