var d = mvdom; // external lib
var render = require("../js-app/render.js").render;
var utils = require("../js-app/utils.js");

d.register("Dashboard",{
	create: function(data, config){
		return render("Dashboard");
	}, 

	postDisplay: function(){
		var view = this; // best practice, set the view variable first. 

	}
});
