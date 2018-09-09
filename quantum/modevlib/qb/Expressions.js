(function(){
	var DEBUG = true;

	function qb2function(expr){
		var output;
		if (expr == null) {
			output = function(){
				return null;
			};
			if (DEBUG) output.expression = null;
			return output;
		} else if (expr === true) {
			output = function(){
				return true;
			};
			if (DEBUG) output.expression = expr;
			return output;
		} else if (expr === false) {
			output = function(){
				return false;
			};
			if (DEBUG) output.expression = expr;
			return output;
		} else if (isString(expr) && MVEL.isKeyword(expr)) {
			output = function(value){
				return Map.get(value, expr);
			};
			if (DEBUG) output.expression = expr;
			return output;
		} else if (aMath.isNumeric(expr)) {
			output = function(){
				return expr;
			};//endif
			if (DEBUG) output.expression = expr;
			return output;
		} else {
			var keys = Object.keys(expr);
			for (var i = keys.length; i--;) {
				var val = expressions[keys[i]];
				if (val) return val(expr);
			}//for
		}//endif
		Log.error("Can not handle expression `{{name}}`", {"name": keys[0]});
	}//method


	expressions = {};

	expressions.when = function(expr){
		var output;
		var test = qb2function(expr.when, true);
		var pass = qb2function(expr.then);
		var fail = qb2function(expr.else);

		output = function(value){
			var condition = test(value);

			if (condition != null && condition != false) {
				return pass(value);
			} else {
				return fail(value);
			}//endif
		};
		if (DEBUG) output.expression = convert.value2json(expr);
		return output;
	};

	expressions.sub = function(expr){
		var output;
		if (isArray(expr.sub)) {
			var exprs = expr.sub.mapExists(qb2function);
			output = function(value){
				return exprs[0](value) - exprs[1](value);
			};
		} else {
			var k = Map.keys(expr.sub)[0];
			var kk = qb2function(k);
			var vv = qb2function(expr.gt[k]);
			output = function(value){
				return kk(value) > vv(value);
			};//function
		}//endif
		if (DEBUG) output.expression = convert.value2json(expr);
		return output;
	};

	expressions.eq = function(expr){
		var output;
		if (isArray(expr.eq)) {
			var exprs = expr.eq.mapExists(qb2function);
			output = function(value){
				return exprs[0](value) == exprs[1](value);
			};
		} else {
			output = function(value){
				return Array.AND(Map.map(expr.eq, function(k, v){
					return Map.get(value, k) == v;
				}));
			};
		}//endif
		if (DEBUG) output.expression = convert.value2json(expr);
		return output;
	};

	expressions.term = function(expr){
		var output;
		let vars = Map.keys(expr.term)[0];
		let vals = Map.values(expr.term)[0];
		output = function(value){
			return vals == value[vars];
		};
		return output;
	};

	expressions.literal = function(expr){
		var output;
		output = function(){
			return expr.literal;
		};
		if (DEBUG) output.expression = convert.value2json(expr);
		return output;
	};

	expressions.case = function(expr){
		var output;
		var test = [];
		var then = [];
		var els_ = function(){
		};

		expr.case.forall(function(s, i, switchs){
			if (i == switchs.length - 1) {
				els_ = qb2function(s);
			} else {
				test[i] = qb2function(s.when);
				then[i] = qb2function(s.then);
			}//endif
		});

		output = function(value){
			for (var i = 0; i < test.length; i++) {
				var cond = test[i](value);
				cond = cond != null && cond != false;
				if (cond) {
					return then[i](value);
				}//endoif
			}//for
			return els_(value);
		};
		if (DEBUG) output.expression = convert.value2json(expr);
		return output;

	};


	expressions.missing = function(expr){
		var output;
		var test = qb2function(expr.missing);

		output = function(value){
			return test(value) == null;
		};
		if (DEBUG) output.expression = convert.value2json(expr);
		return output;
	};


	expressions.exists = function(expr){
		var output;
		var test = qb2function(expr.exists);

		output = function(value){
			return test(value) != null;
		};
		if (DEBUG) output.expression = convert.value2json(expr);
		return output;
	};

	expressions.not = function(expr){
		var output;
		var test = qb2function(expr.not);

		output = function(value){
			return !test(value);
		};
		if (DEBUG) output.expression = convert.value2json(expr);
		return output;
	};

	expressions.gt = function(expr){
		var output;
		if (isArray(expr.gt)) {
			var exprs = expr.gt.mapExists(qb2function);
			output = function(value){
				return exprs[0](value) > exprs[1](value);
			};
		} else {
			var k = Map.keys(expr.gt)[0];
			var kk = qb2function(k);
			var vv = qb2function(expr.gt[k]);
			output = function(value){
				return kk(value) > vv(value);
			};//function
		}//endif
		if (DEBUG) output.expression = convert.value2json(expr);
		return output;
	};

	expressions.terms = function(expr){
		var output;
		let vars = Map.keys(expr.terms)[0];
		let vals = Map.values(expr.terms)[0];
		if (!isArray(vals))	Log.error("Expecting terms to have an array");
		output = function(value){
			return vals.contains(value[vars]);
		};
		return output;
	};

	expressions.add = function(expr){
		var output;
		if (isArray(expr.add)) {
			var exprs = expr.add.mapExists(qb2function);
			output = function(value){
				return exprs[0](value) + exprs[1](value);
			};
		} else {
			var k = Map.keys(expr.add)[0];
			var kk = qb2function(k);
			var vv = qb2function(expr.add[k]);
			output = function(value){
				return kk(value) + vv(value);
			};//function
		}//endif
		if (DEBUG) output.expression = convert.value2json(expr);
		return output;
	};

	window.qb2function = qb2function;
})();

