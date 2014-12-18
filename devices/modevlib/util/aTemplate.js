importScript("../collections/aArray.js");
importScript("aUtil.js");
importScript("aString.js");


var Template = function Template(template){
	this.template = template;
};

(function(){
	Template.prototype.expand = function expand(values){
		var map = {};
		if (!(values instanceof Array)) {
			var keys = Object.keys(values);
			keys.forall(function(k){
				map[k.toLowerCase()] = values[k];
			});
		}//endif
		//ADD RELATIVE REFERENCES
		map["."] = values;

		return _expand(this.template, [map]);
	};
	Template.prototype.replace = Template.prototype.expand;

	var FUNC = {};
	FUNC.html = CNV.String2HTML;
	FUNC.css = CNV.Object2style;
	FUNC.datetime = function(d, f){
		if (f===undefined){
			f="yyyy-MM-dd HH:mm:ss";
		}//endif
		return d.format(f);
	};


	function _expand(template, namespaces){
		if (template instanceof Array) {
			return _expand_array(template, namespaces);
		} else if (typeof(template) == "string") {
			return _expand_text(template, namespaces);
		} else {
			return _expand_loop(template, namespaces);
		}//endif
	}


	function _expand_array(arr, namespaces){
		//AN ARRAY OF TEMPLATES IS SIMPLY CONCATENATED
		return arr.map(function(t){
			return _expand(t, namespaces);
		}).join("");
	}

	function _expand_loop(loop, namespaces){
		Map.expecting(loop, ["from", "template"]);
		if (typeof(loop.from) != "string") {
			Log.error("expecting from clause to be string");
		}//endif

		return namespaces[0][loop.from].map(function(m, i, all){
			var map = Map.copy(namespaces[0]);
			if (m instanceof Object && !(m instanceof Array)) {
				var keys = Object.keys(m);
				keys.forall(function(k){
					map[k.toLowerCase()] = m[k];
				});
			}//endif
			//ADD RELATIVE REFERENCES
			map["."] = m;
			namespaces.forall(function(n, i){
				map[Array(i + 3).join(".")] = n;
			});

			return _expand(loop.template, namespaces.copy().prepend(map));
		}).join(loop.separator === undefined ? "" : loop.separator);
	}

	function _expand_text(template, namespaces){
		//namespaces IS AN ARRAY OBJECTS FOR VARIABLE NAME LOOKUP
		//CASE INSENSITIVE VARIABLE REPLACEMENT

		//COPY VALUES, BUT WITH lowerCase KEYS
		var map = namespaces[0];

		var output = template;
		var s = 0;
		while (true) {
			s = output.indexOf('{{', s);
			if (s < 0) return output;
			var e = output.indexOf('}}', s);
			if (e < 0) return output;
			var path = output.substring(s + 2, e).toLowerCase().split("|");
			var key = path[0];
			var val = map[key];
			for (var p = 1; p < path.length; p++) {
				var func = path[p].split("(")[0];
				if (FUNC[func] === undefined) {
					Log.error(func + " is an unknown string function for template expansion")
				}//endif
				if (path[p].split("(").length==1){
					val = FUNC[func](val)
				}else{
					val = eval("FUNC[func](val, "+path[p].split("(")[1]);
				}//endif
			}//for

			val = "" + val;
			if (val !== undefined && (val instanceof String || typeof(val) == "string" || (typeof map[key]) != "object")) {
				output = output.replaceAll(output.substring(s, e + 2), val);
				e = s + val.length;
			} else {
				//Log.debug()
			}//endif
			s = e;
		}//while
	}

})();
