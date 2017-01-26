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

		"click; .table-header .row .cell.impl .edit": function(evt){
			var view = this;
			var targetEl = evt.target;
			var tableEl = d.closest(targetEl, ".table");
			if(targetEl.classList.contains("active")){
				targetEl.classList.remove("active");
				targetEl.innerHTML = "edit";
				tableEl.classList.remove("edit-mode");
				d.all(view.el, ".rows-con [data-prop]").forEach(function(propEl){
					propEl.removeAttribute("data-editable");
				});
			}else{
				targetEl.classList.add("active");
				targetEl.innerHTML = "view";
				tableEl.classList.add("edit-mode");
				d.all(view.el, ".rows-con [data-prop]").forEach(function(propEl){
					propEl.setAttribute("data-editable", "");
				});
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
								var prevRow = d.prev(view._dragHolder, ".row:not(.secondary)");
								if(prevRow){
									view._dragItem.classList.add("secondary");
									view._dragHolder.classList.add("secondary");
								}else{
									view._dragItem.classList.remove("secondary");
									view._dragHolder.classList.remove("secondary");
								}
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
				view._dragItem = null;

				if(view._dragHolder.classList.contains("secondary")){
					var parentRow = d.prev(view._dragHolder, ".row:not(.secondary)");
					if(parentRow){
						view._dragHolder.setAttribute("data-parent-id", parentRow.getAttribute("data-entity-id"));
					}else{
						view._dragHolder.setAttribute("data-parent-id", "");
					}
				}else{
					view._dragHolder.setAttribute("data-parent-id", "");
				}

				view._dragHolder.classList.remove("drag-holder");
				view._dragHolder = null;
				saveOrders.call(view);
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
	var tableEl = d.first(view.el, ".table");
	var conEl = d.first(tableEl, ".table-content .rows-con");
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

		if(tableEl.classList.contains("edit-mode")){
			d.all(conEl, "[data-prop]").forEach(function(propEl){
				propEl.setAttribute("data-editable", "");
			});
		}
	});	
}

function saveOrders(){
	var view = this;
	var features = [];
	d.all(view.el, ".rows-con .row").forEach(function(row){
		var obj = utils.entityRef(row, "Feature");
		delete obj.type;
		obj.parentId = row.getAttribute("data-parent-id");
		obj.parentId = obj.parentId ? obj.parentId * 1 : null;
		features.push(obj);
	});
	ds.get("Feature").reorderFeatures(features);
}
