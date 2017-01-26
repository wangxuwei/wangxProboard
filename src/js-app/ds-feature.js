var d = mvdom; // global lib dependency
var store = require("./store.js");
var BaseDs = require("./ds-base.js");

class FeatureDs extends BaseDs{

	reorderFeatures(features){
		var type = this._type;
		var rank = 1;

		return new Promise(function(resolve, reject){
			for(var i = 0; i < features.length; i++){
				var feature = features[i];
				feature.rank = rank++;
				var id = feature.id

				// put the new entity properties in the dbEntity
				feature = Object.assign(store.get(type, id), feature);
				
				//make sure we do not change the .id
				delete feature.id;

				store.put(type,id, feature);
			}
			// we resolve 
			resolve(features);
			d.hub("dsHub").pub(this._type, "update");
		});
	}

	getFeaturesByRank(){
		var type = this._type;

		return new Promise(function(resolve, reject){
			var features = store.all(type);

			features.sort(function(a, b){
				if(a.rank && b.rank){
					return a.rank > b.rank ? 1 : -1;
				}else{
					return a.id > b.id ? 1 : -1;
				}
			});
			// we resolve 
			resolve(features);
			
		});
	}
}

module.exports = FeatureDs;