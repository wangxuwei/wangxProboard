var d = mvdom; // global lib dependency
var BaseDs = require("./ds-base.js");
var FeatureDs = require("./ds-feature.js");

module.exports = {
	get: get
};


var ds = {
	feature: new FeatureDs("Feature")
}


function get(type){
	if(type){
		return ds[type.toLowerCase()];
	}
}