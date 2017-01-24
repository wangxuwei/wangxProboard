var app = require("./app.js");
var d = mvdom; // external lib

app.elFrom = function(str){
	var node = document.createElement("div");
	node.innerHTML = str;
	return node.firstChild;
};
