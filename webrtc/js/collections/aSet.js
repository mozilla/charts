/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


importScript("aArray.js");



var aSet=function(data){
	this.map={};
	if (data!==undefined)
		this.addArray(data);
};


(function(){

	aSet.prototype.add=function(v){
		this.map[v]=1;
		return this;
	};

	aSet.prototype.addArray=function(a){
		for(var i=a.length;i--;){
			this.map[a[i]]=1;
		}//for
		return this;
	};

	aSet.prototype.remove=function(v){
		this.map[v]=undefined;
		return this;
	};

	aSet.prototype.getArray=function(){
		return Object.keys(this.map);
	};

	aSet.prototype.contains=function(v){
		return this.map[v]==1;
	};

	aSet.prototype.map=function(func){
		return this.getArray().map(func);
	};


})();




