var app = require("./app.js");
var d = mvdom; // external lib

app.elFrom = function(str){
	var node = document.createElement("div");
	node.innerHTML = str;
	return node.firstChild;
};

app.elCopy = function(el){
	var html = el.outerHTML;
	var copyEl = app.elFrom(html);
	return copyEl;
};

app.elAbsOffset = function(el){
	var offset = {left: el.offsetLeft, top: el.offsetTop};
	if(el.offsetParent != null){
		var topOffset = app.elAbsOffset(el.offsetParent);
		offset.left += topOffset.left;
		offset.top += topOffset.top;
	}
	return offset; 
}