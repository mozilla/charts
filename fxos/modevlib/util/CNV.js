/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

importScript("aHTML.js");
importScript("aUtil.js");


var CNV = function(){
};


//
//PULL THE BUGS OUT OF THE ELASTIC SEARCH RESULT OBJECT
//
CNV.ESResult2List = function(esResult){
	var output = [];
	var h=esResult.hits.hits;
	for(var x = 0; x < h.length; x++){
		if (h[x].fields!==undefined){
			output.push(h[x].fields);
		}else{
			output.push(h[x]._source);
		}//endif
	}//for
	return output;
};//method


//MVEL.esFacet2List = function(esFacet){
//	if (esFacet._type == "terms_stats") return esFacet.terms;
//
//	if (!(esFacet.terms === undefined)){
//		//ASSUME THE .term IS JSON OBJECT WITH ARRAY OF RESULT OBJECTS
//		var output = [];
//		var list = esFacet.terms;
//		for(var i = 0; i < list.length; i++){
//			var esRow = list[i];
//			var values = CNV.JSON2Object(esRow.term);
//			for(var v = 0; v < (values).length; v++){
//				values[v].count = esRow.count;
//				output.push(values[v]);
//			}//for
//		}//for
//		return output;
//	} else if (!(esFacet.entries === undefined)){
//		return esFacet.entries;
//	}//endif
//
//};//method







CNV.ESResult2HTMLSummaries = function(esResult){
	var output = "";

	if (esResult["facets"] === undefined) return output;

	var keys = Object.keys(esResult.facets);
	for(var x = 0; x < keys.length; x++){
		output += CNV.ESResult2HTMLSummary(esResult, keys[x]);
	}//for
	return output;
};//method


CNV.ESResult2HTMLSummary = function(esResult, name){
	var output = "";
	output += "<h3>" + name + "</h3>";
	var facet=esResult.facets[name];
	if (facet._type=="statistical"){
		output+=CNV.Object2JSON(facet);
	}else{
		output += CNV.List2HTMLTable(facet.terms);
	}//endif


	return output;
};//method


CNV.JSON2Object = function(json){
	try{
		return JSON.parse(json);
	}catch(e){
		Log.error("Can not parse json:\n"+json.indent(1), e);
	}//try
};//method


CNV.Map2Style = function(map){
	return mapAllKey(map, function(k, v){return k+":"+v;}).join(";")+";";
};//method


CNV.Object2JSON = function(json){
//	return JSON.stringify(json);
	if (json instanceof Array){
		try{
			var singleLine=JSON.stringify(json);
			if (singleLine.length<60) return singleLine;
		}catch(e){
			Log.warning("Problem turning array to json:", e);
		}//try

		if (json.length==0) return "[]";
		if (json.length==1) return "["+CNV.Object2JSON(json[0])+"]";

		return "[\n"+json.map(function(v, i){
			if (v===undefined) return "undefined";
			return CNV.Object2JSON(v).indent(1);
		}).join(",\n")+"\n]";
	}else if (typeof(json)=="function"){
		return "undefined";
	}else if (json instanceof Duration){
		return CNV.String2Quote(json.toString());
	}else if (json instanceof Date){
		return CNV.String2Quote(json.format("dd-NNN-yyyy HH:mm:ss"));
//	}else if (typeof(json)=="string"){
//		var s=CNV.String2Quote(json);
//		if (json.length>30 && json.indexOf("\n")>0){
//			s=s.replaceAll("\\n", "\\n\"+\n\"");
//		}//endif
//		return s;
	}else if (json instanceof Object){
		try{
			var singleLine=JSON.stringify(json);
			if (singleLine.length<60) return singleLine;
		}catch(e){
			Log.warning("Problem turning object to json:", e);
		}//try

		var keys=Object.keys(json);
		if (keys.length==0) return "{}";
		if (keys.length==1) return "{\""+keys[0]+"\":"+CNV.Object2JSON(json[keys[0]]).trim()+"}";

		var output="{\n\t";
		for(var k in json){  //NATURAL ORDER
			if (keys.contains(k)){
				var v=json[k];
				if (v!==undefined){
					if (output.length>3) output+=",\n\t";
					output+="\""+k+"\":"+CNV.Object2JSON(v).indent(1).trim();
				}//endif
			}//endif

		}//for
		return output+"\n}";

//		return "{\n\t"+mapAllKey(json, function(k, v){
//			if (v===undefined) return "";
//			return "\""+k+"\":"+CNV.Object2JSON(v).indent(1).trim();
//		}).join(",\n\t")+"\n}";
//TOO BAD: CAN NOT PROVIDE FORMATTED STRINGS
//	}else if (typeof(json)=="string"){
//		var output=JSON.stringify(json);
//		if (json.length>40 && json.indexOf("\n")>=0){
//			return "\n\t"+output.split("\\n").join("\\n\"+\n\t\"");
//		}else{
//			return output;
//		}//endif
	}else{
		return JSON.stringify(json);
	}//endif
};//method


CNV.Object2CSS=function(value){
	//FIND DEPTH
	var depth=1;
	forAllKey(value, function(name, value){
		if (value!=null && typeof(value)=="object"){
			depth=2;
		}//endif
	});

	if (depth==2){
		return mapAllKey(value, function(selector, css){
			return selector+" {"+
				mapAllKey(css, function(name, value){
					return  name+":"+value;
				}).join(";")+"}";
		}).join("\n\n");
	}else{
		return mapAllKey(value, function(name, value){
			return  name+":"+value;
		}).join(";")
	}//endif
};//method

CNV.style2Object=function(value){
	return Map.zip(value.split(";").map(function (attr) {
		if (attr.trim()=="") return undefined;
		return attr.split(":").map(function(v){return v.trim();});
	}));
};//method

CNV.Object2style=function(style){
	return mapAllKey(style, function(name, value){
		return name+":"+value;
	}).join(";");
};//method


CNV.Object2URL=function(value){
	return $.param(value).replaceAll("%5B%5D=", "=");
};//method



(function(){
	var entityMap = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': '&quot;',
		"'": '&#39;',
		"/": '&#x2F;',
		"\n": "<br>",
		"\t": "&nbsp;&nbsp;&nbsp;&nbsp;"
	};


	CNV.String2HTML = function String2HTML(value) {
		if (value==null) return "";

		var output=[];
		for(var i=0;i<value.length;i++){
			var c= value[i];
			var d = entityMap[c];
			if (d===undefined){
				output.append(c);
			}else{
				output.append(d)
			}//endif
		}//for
		return output.join("");
	};//method
})();


CNV.String2HTMLTable = function(value){
	value="<table><tr>"+value.replaceAll("\n", "</tr><tr>").replaceAll("\t", "</td><td>")+"</tr></table>";
	return value;
};//method

CNV.String2Quote = function(str){
	return "\"" + (str + '').replaceAll("\n", "\\n").replace(/([\n\\"'])/g, "\\$1").replace(/\0/g, "\\0") + "\"";
};//method

CNV.Date2Code = function(date){
	return "Date.newInstance("+date.getMilli()+")";
};//method

CNV.Date2milli = function(date){
	return date.getMilli();
};//method

CNV.milli2Date = function(milli){
	return new Date(milli);
};//method



//CONVERT TO SOME MOSTLY HUMAN READABLE FORM (MEANT TO BE DIGESTED BY OTHER TEXT TOOLS)
CNV.Value2Text=function(value){
	if (value === undefined){
		return "";
	} else if (value==NaN){
		return NaN;
	} else if (value == null){
		return "null";
	} else if (typeof(value)=="string"){
		return CNV.String2Quote(value);
	} else if (aMath.isNumeric(value)){
		if ((""+value).length==13){
			//PROBABLY A TIMESTAMP
			value=new Date(value);
			if (value.floorDay().getMilli()==value.getMilli()){
				return value.format("yyyy/MM/dd");
			}else{
				return value.format("yyyy/MM/dd HH:mm:ss");
			}//endif
		}else{
			return ""+value;
		}
	} else if (value.milli){
		//DURATION
		return "\""+value.toString()+"\"";
	} else if (value.getTime){
		if (value.floorDay().getMilli()==value.getMilli()){
			return value.format("yyyy/MM/dd");
		}else{
			return value.format("yyyy/MM/dd HH:mm:ss");
		}//endif
	}//endif

	var json = CNV.Object2JSON(value);
	return CNV.String2Quote(json);
};//method


//CONVERT TO JAVESCRIPT FOR THE SAME
CNV.Value2Quote=function(value){
	if (value === undefined){
		return "undefined";
	} else if (value==NaN){
		return "NaN";
	} else if (value == null){
		return "null";
	} else if (typeof(value)=="string"){
		return CNV.String2Quote(value);
	} else if (aMath.isNumeric(value)){
		return ""+value;
	} else if (value.milli){
		//DURATION
		return "Duration.newInstance(\""+value.toString()+"\")";
	} else if (value.getTime){
		return "Date.newInstance("+value.getMilli()+")";
	}//endif

	var json = CNV.Object2JSON(value);
	return CNV.String2Quote(json);
};//method


CNV.String2Integer = function(value){
	if (value===undefined) return undefined;
	if (value==null || value=="") return null;
	return value - 0;
};//method



function unPipe(value){
	var s=value.indexOf("\\", 1);
	if (s<0) return value.substring(1);

	var result="";
	var e=1;
	while(true){
		var c=value.charAt(s+1);
		if (c=='p'){
			result=result+value.substring(e, s)+'|';
			s+=2;
			e=s;
		}else if (c=='\\'){
			result=result+value.substring(e, s)+'\\';
			s+=2;
			e=s;
		}else{
			s++;
		}//endif
		s=value.indexOf("\\", s);
		if (s<0) break;
	}//while
	return result+value.substring(e);
}//method

CNV.Pipe2Value=function(value){
	var type=value.charAt(0);
	if (type=='0') return null;
	if (type=='n') return CNV.String2Integer(value.substring(1));

	if (type!='s' && type!='a')
		Log.error("unknown pipe type");

	//EXPECTING MOST STRINGS TO NOT HAVE ESCAPED CHARS
	var output=unPipe(value);
	if (type=='s') return output;

	return output.split("|").map(function(v, i){
		return CNV.Pipe2Value(v);
	});
};//method

CNV.Pipe2Value.pipe = new RegExp("\\\\p", "g");
CNV.Pipe2Value.bs = new RegExp("\\\\\\\\", "g");


CNV.Cube2HTMLTable=function(query){

	//WRITE HEADER

	var header = "";
	if (query.name) header+=wrapWithHtmlTag("h2", query.name);
	var content = "";

	var e=query.edges[0];

	if (query.edges.length==0){
		return CNV.List2HTMLTable(query);
	}else if (query.edges.length==1){
		header += "<td>" + CNV.String2HTML(e.name) + "</td>";

		if (query.select instanceof Array){
			header+=query.select.map(function(s, i){
				return wrapWithHtmlTag("td", s.name);
			}).join("");

			content=e.domain.partitions.map(function(v, i){
				return "<tr>"+
					wrapWithHtmlTag("th", e.domain.end(v))+
					query.select.map(function(s, j){
						return wrapWithHtmlTag("td", query.cube[i][s.name])
					}).join("")+
					"</tr>";
			}).join("\n");
		}else{
			header += wrapWithHtmlTag("th", query.select.name);

			content=e.domain.partitions.map(function(p, i){
				return "<tr>"+wrapWithHtmlTag("th", e.domain.end(p))+wrapWithHtmlTag("td", query.cube[i])+"</tr>";
			}).join("\n");
		}//endif
	}else if (query.edges.length==2){
		if (query.select instanceof Array){
			Log.error("Can not display cube: select clause can not be array, or there can be only one edge");
		}else{

			header+=wrapWithHtmlTag("td", query.edges[1].name);	//COLUMN FOR SECOND EDGE
			e.domain.partitions.forall(function(p, i){
				var name=e.domain.end(p);
				if (name==p && typeof(name)!="string") name=p.name;
				if (p.name!==undefined && p.name!=name)
					Log.error("make sure part.name matches the end(part)=="+name+" codomain");
				header += "<td>" + CNV.String2HTML(name) + "</td>";
			});

			content="";
			query.edges[1].domain.partitions.forall(function(p,r){
				var name=query.edges[1].domain.end(p);
				if (name==p && typeof(name)!="string") name=p.name;
				if (p.name!==undefined && p.name!=name)
					Log.error("make sure part.name matches the end(part)=="+name+" codomain");
				content+="<tr>"+wrapWithHtmlTag("th", name);
				for(var c=0;c<query.cube.length;c++){
					content+=wrapWithHtmlTag("td", query.cube[c][r]);
				}//for
				content+="</tr>";
			});

			if (query.edges[1].allowNulls){
				content+="<tr>"+wrapWithHtmlTag("th", query.edges[1].domain.NULL.name);
				for(var c=0;c<query.cube.length;c++){
					content+=wrapWithHtmlTag("td", query.cube[c][r]);
				}//for
				content+="</tr>";
			}//endif



			//SHOW FIRST EDGE AS ROWS, SECOND AS COLUMNS
//			header+=wrapWithHtmlTag(e.name);	//COLUMN FOR FIRST EDGE
//			query.edges[1].domain.partitions.forall(function(v, i){
//				header += "<td>" + CNV.String2HTML(v.name) + "</td>";
//			});
//
//			content=query.cube.map(function(r, i){
//				return "<tr>"+
//					wrapWithHtmlTag(e.domain.partitions[i].name, "th")+
//					r.map(function(c, j){
//						return wrapWithHtmlTag(c);
//					}).join("")+
//					"</tr>";
//			}).join("");
		}//endif
	}else{
		Log.error("Actual cubes not supported !!")
	}//endif

	return "<table class='table'>" +
		"<thead>" + header + "</thead>\n" +
		"<tbody>" + content + "</tbody>" +
		"</table>"
		;


};//method



CNV.List2HTMLTable = function(data, options){
	if (data.list && data.columns){
		//CONVERT FROM QUERY TO EXPECTED FORM
		options=data;
		data=data.list;
	}//endif


	if (data.length==0){
		return "<table class='table'><tbody><tr><td>no records to show</td></tr></tbody></table>";
	}//endif

	//WRITE HEADER
	var header = "";
	var columns;
	if (options && options.columns){
		columns=options.columns;
	}else{
		columns= Qb.getColumnsFromList(data);
	}//endif
	columns.forall(function(v, i){
		header += wrapWithHtmlTag("td", v.name);
	});
	header = "<thead><tr>" + header + "</tr></thead>";


	var output = "";
	var numRows=data.length;
	if (options!==undefined && options.limit!==undefined && numRows>options.limit) numRows=options.limit;
	//WRITE DATA
	for(var i = 0; i < data.length; i++){
		var row = "";
		for(var c = 0; c < columns.length; c++){
			var value = data[i][columns[c].name];
			row += wrapWithHtmlTag("td", value);
		}//for
		output += "<tr>" + row + "</tr>\n";
	}//for

	return "<table class='table'>" +
		"<thead>" + header + "</thead>\n" +
		"<tbody>" + output + "</tbody>" +
		"</table>"
		;
};//method


wrapWithHtmlTag=function(tagName, value){
	if (tagName===undefined) tagName="td";

	if (value === undefined){
//		return "<"+tagName+">&lt;undefined&gt;</"+tagName+">";
		return "<"+tagName+"></"+tagName+">";
	} else if (value == null){
//		return "<"+tagName+">&lt;null&gt;</"+tagName+">";
		return "<"+tagName+"></"+tagName+">";
	}else if (value instanceof HTML){
		return "<"+tagName+">" + value + "</"+tagName+">";
	} else if (typeof(value)=="string"){
		return "<"+tagName+">" + CNV.String2HTML(value) + "</"+tagName+">";
	} else if (aMath.isNumeric(value)){
		if ((""+value).length==13){
			//PROBABLY A TIMESTAMP
			value=new Date(value);
			if (value.floorDay().getMilli()==value.getMilli()){
				return "<"+tagName+">" + new Date(value).format("dd-NNN-yyyy") + "</"+tagName+">";
			}else{
				return "<"+tagName+">" + new Date(value).format("dd-NNN-yyyy HH:mm:ss") + "</"+tagName+">";
			}//endif
		}else{
			return "<"+tagName+" style='text-align:right;'>" + value + "</"+tagName+">";
		}
	} else if (value.milli){
		//DURATION
		return "<"+tagName+">" + value.toString() + "</"+tagName+">";
	} else if (value.getTime){
		if (value.floorDay().getMilli()==value.getMilli()){
			return "<"+tagName+">" + new Date(value).format("dd-NNN-yyyy") + "</"+tagName+">";
		}else{
			return "<"+tagName+">" + new Date(value).format("dd-NNN-yyyy HH:mm:ss") + "</"+tagName+">";
		}//endif
//	} else if (value.toString !== undefined){
//		return "<"+tagName+">" + CNV.String2HTML(value.toString()) + "</"+tagName+">";
	}//endif

	var json = CNV.Object2JSON(value);
//	if (json.indexOf("\n") == -1){
		return "<"+tagName+">" + CNV.String2HTML(json) + "</"+tagName+">";
//	} else{
//		return "<"+tagName+">&lt;json not included&gt;</"+tagName+">";
//	}//endif
};




///////////////////////////////////////////////////////////////////////////////
// CONVERT TO TAB DELIMITED TABLE
///////////////////////////////////////////////////////////////////////////////
CNV.List2Tab = function(data){
	var output = "";

	//WRITE HEADER
	var columns = Qb.getColumnsFromList(data);
	for(var c = 0; c < columns.length; c++) output += CNV.String2Quote(columns[c].name) + "\t";
	output = output.substring(0, output.length - 1) + "\n";

	//WRITE DATA
	for(var i = 0; i < data.length; i++){
		for(var c = 0; c < columns.length; c++){
			output += CNV.Value2Text(data[i][columns[c].name]) + "\t";
		}//for
		output = output.substring(0, output.length - 1) + "\n";
	}//for
	output = output.substring(0, output.length - 1);

	return output;
};//method


///////////////////////////////////////////////////////////////////////////////
// CONVERT TO TAB DELIMITED TABLE
///////////////////////////////////////////////////////////////////////////////
CNV.Table2List = function(table){
	var output = [];

	//MAP LIST OF NAMES TO LIST OF COLUMN OBJCETS
	if (table.columns[0].substr !== undefined){
		for(var i = 0; i < table.columns.length; i++){
			table.columns[i] = {"name":table.columns[i]};
		}//for
	}//endif


	for(var d = 0; d < table.rows.length; d++){
		var item = {};
		var row = table.rows[d];
		for(var c = 0; c < table.columns.length; c++){
			item[table.columns[c].name] = row[c];
		}//for
		output.push(item);
	}//for
	return output;
};//method


CNV.List2Table = function(list, columnOrder){
	var columns = Qb.getColumnsFromList(list);
	if (columnOrder !== undefined){
		var newOrder = [];
		OO: for(var o = 0; o < columnOrder.length; o++){
			for(var c = 0; c < columns.length; c++){
				if (columns[c].name == columnOrder[o]){
					newOrder.push(columns[c]);
					continue OO;
				}//endif
			}//for
			Log.error("Can not find column by name of '" + columnOrder[o] + "'");
		}//for

		CC: for(var c = 0; c < columns.length; c++){
			for(var o = 0; o < columnOrder.length; o++){
				if (columns[c].name == columnOrder[o]) continue CC;
			}//for
			newOrder.push(columns[c]);
		}//for

		columns = newOrder;
	}//endif

	var data = [];
	for(var i = 0; i < list.length; i++){
		var item = list[i];
		var row = [];
		for(var c = 0; c < columns.length; c++){
			row[c] = nvl(item[columns[c].name], null);
		}//for
		data.push(row);
	}//for
	return {"columns":columns, "data":data};
};//method


CNV.int2hex = function(value, numDigits){
	return ("0000000" + value.toString(16)).right(numDigits);
};//method
CNV.number2hex = CNV.int2hex;


CNV.char2ASCII=function(char){
	return char.charCodeAt(0);
};


CNV.hex2int = function(value){
	return parseInt(value, 16);
};//method


//CONVERT FROM STRING TO SOMETHING THAT CAN BE USED BY $()
CNV.String2JQuery=function(str){
	var output=str.replace(/([ ;&,\.\+\*\~':"\!\^#$%@\[\]\(\)\/=>\|])/g, '\\$1');
//	output=output.replaceAll(" ", "\\ ");
	return output;
};//method


TRUE_FILTER = function(row, i, rows){return true;};
FALSE_FILTER = function(row, i, rows){return false;};

CNV.esFilter2function=function(esFilter){
	if (esFilter === undefined) return TRUE_FILTER;

	var keys = Object.keys(esFilter);
	if (keys.length != 1)
		Log.error("Expecting only one filter aggregate");
	var op = keys[0];
	if (op == "and"){
		var list = esFilter[op];
		if (list.length == 0) return TRUE_FILTER;
		if (list.length == 1) return CNV.esFilter2function(list[0]);

		var tests=list.map(CNV.esFilter2function);
		return function(row, i, rows){
			for(var t = 0; t < tests.length; t++){
				if (!tests[t](row, i, rows)) return false;
			}//for
			return true;
		};
	} else if (op == "or"){
		var list = esFilter[op];
		if (list.length == 0) return FALSE_FILTER;
		if (list.length == 1) return CNV.esFilter2function(list[0]);

		var tests=list.map(CNV.esFilter2function);
		return function(row, i, rows){
			for(var t = 0; t < tests.length; t++){
				if (tests[t](row, i, rows)) return true;
			}//for
			return false;
		};
	} else if (op == "not"){
		var test = CNV.esFilter2function(esFilter[op]);
		return function(row, i, rows){
			return !test(row, i, rows);
		};
	} else if (op == "term"){
		var terms = esFilter[op];
		return function(row, i, rows){
			var variables = Object.keys(terms);
			for(var k = 0; k < variables.length; k++){
				var variable = variables[k];
				var val=terms[variable];
				var row_val=row[variable];
				if (val instanceof Date){
					if (row_val.getTime()!=terms[variable].getTime()) return false;
				}else if (row_val instanceof Array){
					if (!row_val.contains(val)) return false;
				}else{
					if (row_val!=val) return false;
				}//endif
			}//for
			return true;
		};
	} else if (op == "terms"){
		var terms = esFilter[op];
		return function(row, i, rows){
			var variables = Object.keys(terms);
			for(var k = 0; k < variables.length; k++){
				var variable = variables[k];
				if (!terms[variable].contains(row[variable])) return false;
			}//for
			return true;
		};
	}else if (op=="exists"){
		//"exists":{"field":"myField"}
		var field = esFilter[op].field;
		return function(row, i, rows){
			var val =row[field];
			return (val!==undefined && val!=null);
		};
	}else if (op=="missing"){
		var field = esFilter[op].field;
		return function(row, i, rows){
			var val =row[field];
			return (val===undefined || val==null);
		};
	} else if (op == "range"){
		var pair = esFilter[op];
		var variableName = Object.keys(pair)[0];
		var range = pair[variableName];

		return function(row, i, rows){
			if (range.gte !== undefined){
				if (range.gte > row[variableName]) return false;
			} else if (range.gt !== undefined){
				if (range.gt >= row[variableName]) return false;
			}//endif

			if (range.lte !== undefined){
				if (range.lte < row[variableName]) return false;
			} else if (range.lt !== undefined){
				if (range.lt <= row[variableName]) return false;
			}//endif

			return true;
		};
	} else if (op=="script"){
		Log.error("not supported");
	}else if (op=="prefix"){
		var pair = esFilter[op];
		var variableName = Object.keys(pair)[0];
		var prefix = pair[variableName];
		return function(row, i, rows){
			var v = row[variableName];
			return typeof(v)=="string" && v.startsWith(prefix);
		}
	}else if (op=="match_all"){
		return TRUE_FILTER;
	}else if (op=="regexp"){
		var pair = esFilter[op];
		var variableName = Object.keys(pair)[0];
		var regexp = new RegExp(pair[variableName]);
		return function(row, i, rows){
			if (regexp.test(row[variableName])){
				return true;
			}else{
				return false;
			}//endif
		}
	} else{
		Log.error("'" + op + "' is an unknown operation");
	}//endif

	return "";
};//method

//CONVERT ES FILTER TO JAVASCRIPT EXPRESSION
CNV.esFilter2Expression=function(esFilter){
	if (esFilter === undefined) return "true";

	var output = "";

	var keys = Object.keys(esFilter);
	if (keys.length != 1)
		Log.error("Expecting only one filter aggregate");
	var op = keys[0];
	if (op == "and"){
		var list = esFilter[op];
		if (list.length == 0) Log.error("Expecting something in 'and' array");
		if (list.length == 1) return CNV.esFilter2Expression(list[0]);
		for(var i = 0; i < list.length; i++){
			if (output != "") output += " &&\n";
			output += "(" + CNV.esFilter2Expression(list[i]) + ")";
		}//for
		return output;
	} else if (op == "or"){
		var list = esFilter[op];
		if (list.length == 0) Log.error("Expecting something in 'or' array");
		if (list.length == 1) return CNV.esFilter2Expression(list[0]);
		for(var i = 0; i < list.length; i++){
			if (output != "") output += " ||\n";
			output += "(" + CNV.esFilter2Expression(list[i]) + ")";
		}//for
		return output;
	} else if (op == "not"){
		return "!(" + CNV.esFilter2Expression(esFilter[op]) + ")";
	} else if (op == "term"){
		return mapAllKey(esFilter[op], function(variableName, value){
			if (value instanceof Array){
				Log.error("Do not use term filter with array of values ("+CNV.Object2JSON(esFilter)+")");
			}//endif
			return "Array.newInstance(" + variableName + ").contains(" + CNV.Value2Quote(value) + ")";  //ARRAY BASED FOR MULTIVALUED VARIABLES
		}).join(" &&\n");
	} else if (op == "terms"){
		var pair = esFilter[op];
		var variableName = Object.keys(pair)[0];
		var valueList = pair[variableName];
		if (valueList.length == 0)
			Log.error("Expecting something in 'terms' array");
		if (valueList.length == 1) return (variableName) + "==" + CNV.Value2Quote(valueList[0]);
		output += "[" + valueList.map(CNV.String2Quote).join(", ") + "].intersect(Array.newInstance(" + variableName + ")).length > 0";  //ARRAY BASED FOR MULTIVALUED VARIABLES
		return output;
	}else if (op=="exists"){
		var variableName = esFilter[op].field;
		return "(" + variableName + "!==undefined && " + variableName + "!=null)";
	}else if (op=="missing"){
		var variableName =esFilter[op].field;
		return "(" + variableName + "===undefined || " + variableName + "==null)";
	} else if (op == "range"){
		var pair = esFilter[op];
		var variableName = Object.keys(pair)[0];
		var range = pair[variableName];
		var lower = "";
		var upper = "";

		if (!(range.gte === undefined)){
			lower = CNV.Value2Quote(range.gte) + "<=" + (variableName);
		} else if (!(range.gt === undefined)){
			lower = CNV.Value2Quote(range.gt) + "<" + (variableName);
		} else if (!(range.from == undefined)){
			if (range.include_lower == undefined || range.include_lower){
				lower = CNV.Value2Quote(range.from) + "<=" + (variableName);
			} else{
				lower = CNV.Value2Quote(range.from) + "<" + (variableName);
			}//endif
		}//endif

		if (!(range.lte === undefined)){
			upper = CNV.Value2Quote(range.lte) + ">=" + (variableName);
		} else if (!(range.lt === undefined)){
			upper = CNV.Value2Quote(range.lt) + ">" + (variableName);
		} else if (!(range.from == undefined)){
			if (range.include_lower == undefined || range.include_lower){
				upper = CNV.Value2Quote(range.from) + ">=" + (variableName);
			} else{
				upper = CNV.Value2Quote(range.from) + ">" + (variableName);
			}//endif
		}//endif

		if (upper == "" || lower == ""){
			return "(" + upper + lower + ")";
		} else{
			return "(" + upper + ") &&\n(" + lower + ")";
		}//endif
	} else if (op=="script"){
		var script = esFilter[op].script;
		return (script);
	}else if (op=="prefix"){
		var pair = esFilter[op];
		var variableName = Object.keys(pair)[0];
		var value = pair[variableName];
		return "(typeof("+variableName+")==\"string\" && "+variableName+".startsWith(" + CNV.Value2Quote(value)+"))";
	}else if (op=="match_all"){
		return "true"
	}else if (op=="regexp"){
		var pair = esFilter[op];
		var variableName = Object.keys(pair)[0];
		return "(function(){ return new RegExp("+CNV.Value2Quote(pair[variableName])+").test("+variableName+");})()";
	} else{
		Log.error("'" + op + "' is an unknown operation");
	}//endif

	return "";





};//method
