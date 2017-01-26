var d = mvdom; // global lib dependency
var store = require("./store.js");

class BaseDs{

	constructor(type){
		this._type = type;
	}


	// --------- Public API --------- //
	create(entity){
		var type = this._type;
		return new Promise(function(resolve, reject){

			// get the next seq and put the new object
			var id = store.nextSeq();
			store.put(type, id, entity);

			// get the new entity from the store (will have the .id)
			entity = store.get(type, id);
			// we resolve first, to allow the caller to do something before the event happen
			resolve(entity);

			// we publish the dataservice event
			d.hub("dsHub").pub(type,"create",entity);
		});
	}

	update(id, entity){
		var type = this._type;
		return new Promise(function(resolve, reject){
			var dbEntity = store.get(type, id);
			if (dbEntity){
				//make sure we do not change the .id
				delete entity.id;

				// put the new entity properties in the dbEntity
				Object.assign(dbEntity, entity);
				store.put(type,id, dbEntity);

				// we resolve 
				resolve(dbEntity);

				// we public the dataservice event
				d.hub("dsHub").pub(type,"update", dbEntity);

			}else{
				reject("Cannot update entity " + type + " because [" + id + "] not found");
			}
		})
	}

	get(id){
		var type = this._type;
		return new Promise(function(resolve, reject){
			return store.get(type);
		});
	}

	list(filter){
		var type = this._type;
		// TODO: need to add the filtering support
		return new Promise(function(resolve, reject){
			resolve(store.all(type));	
		})
		
	}

	first(filter){
		var type = this._type;
		// TODO: need to be implemented
	}

	remove(id){
		var type = this._type;
		return new Promise(function(resolve, reject){
			resolve(store.remove(type, id));

			// we publish the dataservice event
			d.hub("dsHub").pub(type,"delete",id);		
		})
	}
}

module.exports = BaseDs;


