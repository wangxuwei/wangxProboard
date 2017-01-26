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
				ds.get("Feature").create({name: val}).then(function(){
					inputEl.value = "";
				});
			}
		},

		"click; .table-header .row .cell.feature .edit": function(evt){
			var view = this;
			var targetEl = evt.target;
			var tableEl = d.closest(targetEl, ".table");
			if(targetEl.classList.contains("active")){
				targetEl.classList.remove("active");
				targetEl.innerHTML = "edit";
				tableEl.classList.remove("drag-edit-mode");
			}else{
				targetEl.classList.add("active");
				targetEl.innerHTML = "view";
				tableEl.classList.add("drag-edit-mode");
			}
		},

		"mousedown; .row .drag-col .icon": function(evt){
			var view = this;
			var targetEl = evt.target;
			var rowEl = d.closest(targetEl, ".row");
			var rowCloneEl = app.elCopy(rowEl);
			var rowsConEl = d.closest(targetEl, ".rows-con");

			view._dragItem = rowCloneEl;
			view._dragHolder = rowEl;

			view._dragHolder.classList.add("drag-holder");
			view._dragItem.classList.add("drag-item");
			rowsConEl.appendChild(view._dragItem);

			view._dragItem.style.left = evt.pageX + "px";
			view._dragItem.style.top = evt.pageY + "px";
			view._dragItem.style.opacity = .5;
		}
	}, 

	docEvents: {
		"mousemove": function(evt){
			var view = this;
			if(view._dragItem){
				view._dragItem.style.left = evt.pageX + "px";
				view._dragItem.style.top = evt.pageY + "px";

				var rowsConEl = d.closest(view._dragItem, ".rows-con");
				var rows = d.all(rowsConEl, ".row:not(.drag-item):not(.drag-holder)");
				for(var i = 0; i < rows.length; i++){
					var row = rows[i];
					var rowOffset = app.elAbsOffset(row);
					if(evt.pageX > rowOffset.left && evt.pageY > rowOffset.top && evt.pageX < rowOffset.left + row.clientWidth && evt.pageY < rowOffset.top + row.clientHeight){
						if(evt.pageY > rowOffset.top + row.clientHeight / 2){
							rowsConEl.insertBefore(view._dragHolder, row);
							rowsConEl.insertBefore(row, view._dragHolder);
						}else{
							rowsConEl.insertBefore(view._dragHolder, row);
						}

						var dargNameEl = d.first(view._dragItem, ".name");
						var holderNameEl = d.first(view._dragHolder, ".name");
						var parentId = row.getAttribute("data-parent-id");
						if(parentId){
							view._dragItem.classList.add("secondary");
							view._dragHolder.classList.add("secondary");
						}else{
							if(evt.pageX - rowOffset.left > 24){
								view._dragItem.classList.add("secondary");
								view._dragHolder.classList.add("secondary");
							}else{
								view._dragItem.classList.remove("secondary");
								view._dragHolder.classList.remove("secondary");
							}
						}
						break;
					}
				}
			}
		},

		"mouseup": function(evt){
			var view = this;
			if(view._dragItem){
				d.remove(view._dragItem);
				view._dragHolder.classList.remove("drag-holder");
				view._dragItem = null;
				view._dragHolder = null;
				// TODO: save the order
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
	ds.get("Feature").getFeaturesByRank().then(function(features){
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
