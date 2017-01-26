

// --------- Local Mock Store --------- //
/*
	A very simple in-memory local store. 
*/

// The allStore is of format {objectType : {id: entity, ....}}
var allStore = {};
var seq = 1; // global sequence

var store = {
	nextSeq: function(){
		return seq++;
	},

	get: function(type, id){
		var entityStore = allStore[type];
		return (entityStore)?Object.assign({},entityStore[id]):null
	}, 

	put: function(type, id, entity){
		var entityStore = ensureObject(allStore,type);
		if (entityStore){
			var dbEntity = Object.assign({}, entity);
			dbEntity.id = id;
			entityStore[id] = dbEntity; 
			return true;
		}
		return false;
	}, 

	remove: function(type, id){
		var entityStore = allStore[type];
		if (entityStore && entityStore[id]){
			delete entityStore[id];
			return true;
		}
		return false;		
	}, 

	all: function(type){
		var list = [];
		var entityStore = allStore[type];
		if (entityStore){
			for (var id in entityStore){
				list.push(Object.assign({}, entityStore[id]));
			}
		}
		return list;
	}

}

// --------- /Local Mock Store --------- //


function ensureObject(root, name){
	var obj = root[name];
	if (!obj){
		obj = {};
		root[name] = obj;
	}
	return obj;
}


module.exports = store;