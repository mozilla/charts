
importScript("../collections/aArray.js");
importScript("aUtil.js");
importScript("aString.js");


var Template=function Template(template){
	this.template=template;
};

(function(){
	Template.prototype.expand = function expand(values){
		var map={};
		var keys=Object.keys(values);
		keys.forall(function(k){
			map[k.toLowerCase()]=values[k];
		});
		//ADD RELATIVE REFERENCES
		map["."]=values;

		return _expand(this.template, [map]);
	};

	function _expand(template, namespaces){
		if (template instanceof Array){
			return _expand_array(template, namespaces);
		}else if (template instanceof String){
			return _expand_text(template, namespaces);
		}else{
			return _expand_loop(template, namespaces);
		}//endif
	}


	function _expand_array(arr, namespaces){
	//AN ARRAY OF TEMPLATES IS SIMPLY CONCATENATED
		return arr.map(function(t){
			return _expand(t, namespaces);
		});
	}

	function _expand_loop(loop, namespaces){
		Map.expecting(loop, ["from", "template"]);

		return loop.from.map(function(m, i, all){
			var map=Map.copy(namespaces[0]);
			if (m instanceof Object){
				var keys=Object.keys(m);
				keys.forall(function(k){
					map[k.toLowerCase()]=m[k];
				});
			}//endif
			//ADD RELATIVE REFERENCES
			map["."]=m;
			namespaces.forall(function(n, i){
				map[Array(i+3).join(".")]=n;
			});

			return _expand(m, namespaces.copy().prepend(map));
		});
	}

	function _expand_text(template, namespaces){
	//namespaces IS AN ARRAY OBJECTS FOR VARIABLE NAME LOOKUP
	//CASE INSENSITIVE VARIABLE REPLACEMENT

		//COPY VALUES, BUT WITH lowerCase KEYS
		var map=namespaces[0];

		var output = template;
		var s=0;
		while(true){
			s = output.indexOf('{{', s);
			if (s < 0) return output;
			var e = output.indexOf('}}', s);
			if (e < 0) return output;
			var key = output.substring(s + 2, e).toLowerCase();

			var val = map[key];
			if (val!==undefined && (val instanceof String || (typeof map[key])!="object")){
				output=output.replaceAll(output.substring(s, e + 2), map[key]);
				e = s + map[key].length;
			}else{
				//Log.debug()
			}//endif
			s=e;
		}//while
	}

})();
