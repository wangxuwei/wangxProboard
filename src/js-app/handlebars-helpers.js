var render = require("../js-app/render.js").render;

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


Handlebars.registerHelper('check', function (lvalue, operator, rvalue, options) {

	var operators, result;

	if (arguments.length < 3) {
		throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
	}

	if (typeof options === "undefined") {
		options = rvalue;
		rvalue = operator;
		operator = "===";
	}

	operators = {
		'===': function (l, r) { return l === r; },
		'!==': function (l, r) { return l !== r; },
		'<': function (l, r) { return l < r; },
		'>': function (l, r) { return l > r; },
		'<=': function (l, r) { return l <= r; },
		'>=': function (l, r) { return l >= r; },
		'typeof': function (l, r) { return typeof l == r; }
	};

	if (!operators[operator]) {
		throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
	}

	result = operators[operator](lvalue, rvalue);

	if (result) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}

});

// we can use like this {{{incl "tmpl-test" data ...}}}
Handlebars.registerHelper("incl", function(template, data, options) {
	var params = Array.prototype.slice.call(arguments, 1, arguments.length - 1);
	if(params.length == 1){
		params = params[0];
	}
	var html = render(template, params);
	return html;
});
