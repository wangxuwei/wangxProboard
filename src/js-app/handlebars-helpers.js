

Handlebars.registerHelper('echo', function (cond, val) {
	return (cond)?val:"";
});

// svg icons helper
Handlebars.registerHelper('i', function(name, classNames, options) {
	classNames = typeof classNames == 'string' ? classNames : '';
	var html = ['<i class="icon svg-icon ' + classNames + '">'];
	html.push('<svg viewBox="0 0 24 24">');
	html.push('<use xlink:href="../svg/sprite.svg#' + name + '"></use>');
	html.push('</svg>');
	html.push('</i>');
	return html.join('\n');
});
