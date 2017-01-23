var d = mvdom; // external lib
var render = require("../js-app/render.js").render;
var utils = require("../js-app/utils.js");
var route = require("../js-app/route.js");

d.register("MainView",{
	create: function(data, config){
		return render("MainView");
	}, 

	postDisplay: function(){
		var view = this; // best practice, set the view variable first. 

	},
	// --------- Hub Events --------- //
	hubEvents: {
		// event for url changes
		"routeHub;CHANGE": function(event){
			var view = this;
			showView.call(view);
		}
	}
	// --------- /Hub Events --------- //
});

var viewNameByPath = {
	"dashboard": "Dashboard"
};

function showView(){
	var view = this;
	var path0 = route.pathAt(0);
	var contentViewName = viewNameByPath[path0] || "Dashboard";
	
	var contentEl = d.first(view.el, ".main-content");
	d.empty(contentEl);
	d.display(contentViewName, contentEl);
}