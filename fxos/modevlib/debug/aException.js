/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


importScript("../util/CNV.js");


(function(){
	var Exception=function(description, cause, offset){
		Error.call(this);
		this.message=description;
		this.cause=wrap(cause);
		if (offset!==undefined){
			try{
				throw new Error();
			}catch(e){
				this.stack=parseStack(e.stack).slice(offset + 1);
			}//try
		}//endif
	};
	Exception.prototype = Object.create(Error);

	function wrap(e){
		if (e===undefined || e instanceof Exception) return e;
		if (e instanceof Error){
			var output=new Exception(e.message, e.cause);
			output.fileName= e.fileName;
			output.lineNumber = e.lineNumber;
			output.columnNumber = e.columnNumber;
			output.stack = parseStack(e.stack);
			return output;
		}//endif

		return new Exception(""+e);
	}//function
	Exception.wrap = wrap;

	//window.Exception@file:///C:/Users/klahnakoski/git/MoDevMetrics/html/modevlib/debug/aException.js:14:4
	//build@file:///C:/Users/klahnakoski/git/MoDevMetrics/html/modevlib/threads/thread.js:76:2
	//@file:///C:/Users/klahnakoski/git/MoDevMetrics/html/modevlib/threads/thread.js:442:1
	//window.Exception@file:///C:/Users/klahnakoski/git/MoDevMetrics/html/modevlib/debug/aException.js:14:4
	//@file:///C:/Users/klahnakoski/git/MoDevMetrics/html/modevlib/debug/aException.js:77:2
	//@file:///C:/Users/klahnakoski/git/MoDevMetrics/html/modevlib/debug/aException.js:9:2
	var stackPattern=/(.*)@(.*):(\d+):(\d+)/;

	function parseStack(stackString){
		var output = [];
		stackString.split("\n").forEach(function(l){
			var parts=stackPattern.exec(l);
			if (parts==null) return;
			output.append({
				"function":parts[1],
				"fileName":parts[2],
				"lineNumber":parts[3],
				"columnNumber":parts[4]
			});
		});
		return output;
	}//function

	//MAKE A GENERIC ERROR OBJECT DESCRIBING THE ARGUMENTS PASSED
	Exception.error=function(){
		var args = Array.prototype.slice.call(arguments).map(function(v,i){
			if (typeof(v)=="string") return v;
			return CNV.Object2JSON(v);
		});
		return new Exception("error called with arguments("+args.join(",\n"+")"), null);
	};


	Exception.prototype.contains=function(type){
		if (this==type) return true;
		if (this.message==type) return true;

		if (this.cause===undefined){
			return false;
		}else if (this.cause instanceof Array){
			for(var i=this.cause.length;i--;){
				if (this.cause[i].contains(type)) return true;
			}//for
			return false;
		}else if (typeof(this.cause)=="function"){
			return this.cause.contains(type);
		}else{
			return this.cause.message.indexOf(type)>=0;
		}//endif
	};


	Exception.prototype.toString=function(){
		var output = this.message + "\n";

		if (this.stack){
			output = output + this.stack.map(function(s){
				try{
					return "File " + s.fileName.split("/").last() + ", line " + s.lineNumber + ", in " + s.function + "\n";
				}catch(e){
					throw "Not expected"
				}//try
			}).join("").indent(1);
		}//endif

		if (this.cause === undefined){
			return output;
		}else if (this.cause instanceof Exception){
			return output +
				"caused by " + this.cause.toString();
		}else if (this.cause.toString === undefined){
			return output +
				"caused by\n"+
					this.cause.indent() + "\n";
		}else{
			return output + "\n" +
				"caused by\n"+
					this.cause.message.toString().indent() + "\n";
		}//endif
	};

	Exception.TIMEOUT=new Exception("TIMEOUT");

	window.Exception=Exception;

})();
