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
				d.all(view.el, ".rows-con [data-prop]:not(.progress-cell)").forEach(function(propEl){
					propEl.removeAttribute("data-editable");
				});
			}else{
				targetEl.classList.add("active");
				targetEl.innerHTML = "view";
				tableEl.classList.add("edit-mode");
				d.all(view.el, ".rows-con [data-prop]:not(.progress-cell)").forEach(function(propEl){
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
		},

		"mousedown; .row .slide-valve": function(evt){
			var view = this;
			var targetEl = evt.target;
			view._dragItem = targetEl;
			view._lastPageX = evt.pageX;
			view._currentBarWidth = d.closest(targetEl, ".slide-con").clientWidth;

			// set init value
			view._startValue = app.elAbsOffset(view._dragItem).left + view._dragItem.clientWidth / 2 - app.elAbsOffset(d.closest(targetEl, ".slide-con")).left;
		},

		"keyup; .slide-bar input": function(evt){
			var view = this;
			var inputEl = evt.target;
			var slideBarEl = d.closest(inputEl, ".slide-bar");
			
			// enter
			if (evt.which === 13){
				var val = inputEl.value;
				if(!val){
					val = 0;
				}

				setPosition.call(view, slideBarEl, val);
			}
		},

		// show slide bar
		"click; .table.edit-mode .progress-bar": function(evt){
			var view = this;
			var progressBarEl = d.closest(evt.target, ".progress-bar");
			var cellEl = d.closest(progressBarEl, ".cell");
			var value  = progressBarEl.getAttribute("data-progress") * 1;
			value = isNaN(value) ? 0 : value;

			var slideBarEl = app.elFrom(render("Dashboard-slide-bar"));
			setPosition.call(view, slideBarEl, value);

			d.empty(cellEl);
			cellEl.appendChild(slideBarEl);
			cellEl.classList.add("init-slide-cell");
		},

		"click; .btn-delete": function(evt){
			var view = this;
			var entityInfo = utils.entityRef(evt.target);
			ds.get(entityInfo.type).remove(entityInfo.id);
		}
	}, 

	docEvents: {
		"click": function(evt){
			var view = this;
			var targetEl = evt.target;
			var currentProgressCell = d.closest(targetEl, ".cell.progress-cell");

			d.all(view.el, ".cell.progress-cell").forEach(function(cellEl){
				if(!currentProgressCell || currentProgressCell != cellEl){
					var slideBarEl = d.first(cellEl, ".slide-bar");
					// FIXME stopPropagation can not work
					if(!cellEl.classList.contains("init-slide-cell")){
						if(slideBarEl){
							d.empty(cellEl);
							var value  = d.first(slideBarEl, "input").value * 1;
							value = isNaN(value) ? 0 : value;
							var progressBarEl = app.elFrom(render("Dashboard-progress-bar", value));
							cellEl.appendChild(progressBarEl);

							var propInfo = getPropInfo(cellEl);
							propInfo.value = value;
							var entityInfo = utils.entityRef(cellEl, propInfo.type);
							if (entityInfo){
								var vals = {};
								vals[propInfo.name] = propInfo.value;
								ds.get(entityInfo.type).update(entityInfo.id, vals);
							}
						}
					}
					cellEl.classList.remove("init-slide-cell");
				}
			});
		},
		"mousemove": function(evt){
			var view = this;
			if(view._dragItem){

				// for table rows
				if(view._dragItem.classList.contains("row")){
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
				// for slide valve
				}else if(view._dragItem.classList.contains("slide-valve")){
					var deltaX = evt.pageX - view._lastPageX + view._startValue;
					var left = deltaX / view._currentBarWidth;
					left = left > 1 ? 1 : left;
					left = left < 0 ? 0 : left;
					left = parseInt(left * 100);
					view._dragItem.style.left = left + "%";

					var slideBarEl = d.closest(view._dragItem, ".slide-bar");
					d.first(slideBarEl, "input").value = left;
				}
				
			}
		},

		"mouseup": function(evt){
			var view = this;
			if(view._dragItem){
				// for table rows
				if(view._dragItem.classList.contains("row")){
					d.remove(view._dragItem);

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


				view._dragItem = null;
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
			item.totalRequirementProgress = item.totalRequirementProgress || 0;
			item.totalFunctionalProgress = item.totalFunctionalProgress || 0;
			var html = render("Dashboard-table-row-item", item);
			conEl.appendChild(app.elFrom(html));
		}

		if(tableEl.classList.contains("edit-mode")){
			d.all(conEl, "[data-prop]:not(.progress-cell)").forEach(function(propEl){
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

function setPosition(slideBarEl, value){
	var view = this;
	value = value * 1;
	value = isNaN(value) ? 0 : value;

	var inputEl = d.first(slideBarEl, "input");
	var valveEl = d.first(slideBarEl, ".slide-valve");

	inputEl.value = value;
	valveEl.style.left = value + "%";

}

function getPropInfo(propEl){
	var dataPropStr = propEl.getAttribute("data-prop");
	var typeAndName = dataPropStr.split(".");
	return {type:typeAndName[0],name:typeAndName[1]};
}

