var d = mvdom; // external lib
var render = require("../js-app/render.js").render;
var utils = require("../js-app/utils.js");
var ds = require("../js-app/ds.js");
var app = require("../js-app/app.js");

d.register("Dashboard",{
	create: function(data, config){
		return render("Dashboard");
	}, 

	postDisplay: function(){
		var view = this; // best practice, set the view variable first. 
		refreshLists.call(view);
	},

	events: {
		// create new item
		"keyup; input.new-feature": function(evt){
			var inputEl = evt.target;

			// enter
			if (evt.which === 13){
				var val = inputEl.value;
				ds.create("Feature",{name: val}).then(function(){
					inputEl.value = "";
				});
			}
		}
	}, 

	hubEvents: {
		"dsHub; Feature": function(data,info){				
			refreshLists.call(this);
		}
	}
});


function refreshLists(){
	var view = this;
	var conEl = d.first(view.el, ".table-content .rows-con");
	d.empty(conEl);
	ds.list("Feature").then(function(features){
		features = features || [];
		for(var i = 0; i < features.length; i++){
			var item = features[i];
			item.totalRequirementProgress = 100;
			item.totalFunctionalProgress = 80;
			var html = render("Dashboard-table-row-item", item);
			conEl.appendChild(app.elFrom(html));
		}
	});	
}
