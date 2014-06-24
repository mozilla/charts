/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


importScript([
		"../../lib/jquery.js",
		"../../lib/jquery-ui/js/jquery-ui-1.10.2.custom.js",
		"../../lib/jquery-ui/css/start/jquery-ui-1.10.2.custom.css"
]);
importScript("aException.js");


var Log = new function(){
};

Log.loggers=[];

Log.addLog=function(logger){
	if (!logger.write) Log.note("Expecting a logger with write() method");
	Log.loggers.push(logger);
};

Log.addLog({"write":function(message){console.info(message);}});

Log.addLogToElement=function(id){
	$("#"+id).html("");
	Log.addLog({
		"write":function(message){
			$("#"+id).append(CNV.String2HTML(message)+"<br>");
		}
	});
};

Log.note = function(message){
	try{
		if (typeof(message)!="string") message=CNV.Object2JSON(message);
	}catch(e){
	}//try
	message=Date.now().addTimezone().format("HH:mm:ss - ")+message;

	Log.loggers.forall(function(v){
		v.write(message);
	});
};//method

//USED AS SIDE-EFFECT BREAK POINTS
Log.debug=function(){
	Log.loggers.forall(function(v){
		v.write("debug message");
	});
};//method

Log.error = function(description, cause, stackOffset){
	var ex=new Exception(description, cause, nvl(stackOffset, 0)+1);

	try{
		var a = generate.error;
	}catch(e){
		var stack = e.stack;
		ex.stack = stack.split("\n").rightBut(nvl(stackOffset, 0)+1)
	}//try


	console.error(ex.toString());
	throw ex;
};//method

Log.warning = function(description, cause){
	var e=new Exception(description, cause);
	console.warn(e.toString());
};//method


Log.gray=function(message, ok_callback, cancel_callback){
	//GRAY OUT THE BODY, AND SHOW ERRO IN WHITE AT BOTTOM
	Log.note(message);

	if (!window.log_alert){
		window.log_alert = true;
		$('body').css({"position":"relative"}).append('<div id="log_alert" style="background-color:rgba(00, 00, 00, 0.5);position:absolute;bottom:0;height:100%;width:100%;vertical-align:bottom;zindex:10"></div>');
	}//endif

	var template = new Template(
		'<div style="width:100%;text-align:center;color:white;position:absolute;bottom:0;">{{message|html}}</div>'
	);

	var html = template.expand({"message":message.replaceAll("\n", " ").replaceAll("\t", " ").replaceAll("  ", " ")});
	$('#log_alert').html(html);
};//method

Log.red=function(message){
	//GRAY OUT THE BODY, AND SHOW ERRO IN WHITE AT BOTTOM
	Log.note(message);

	window.log_alert_till = Date.now().add("20second").getMilli();
	if (!window.log_alert){
		window.log_alert = true;
		$('body').css({"position":"relative"}).append('<div id="log_alert" style="position:absolute;bottom:0;top:0;width:100%;vertical-align:bottom;zindex:10"></div>');
	}//endif

	function erase() {
		var diff = window.log_alert_till - Date.now().add("20second").getMilli();
		if (diff>0){
			setTimeout(erase, diff);
		}else{
			$('#log_alert').html("");
		}//endif
	}//function
	setTimeout(erase, 20000);

	var template = new Template(
		'<div style="{{style}}">{{message|html}}</div>'
	);
	var html = template.expand({
		"style":CNV.Object2CSS({
			"width":"100%",
			"text-align":"center",
			"color":"white",
			"position":"absolute",
			"bottom":0,
			"background-color":Color.red.darker().toHTML()
		}),
		"message":message.replaceAll("\n", " ").replaceAll("\t", " ").replaceAll("  ", " ")
	});
	$('#log_alert').html(html);
};//method

Log.alert=function(message, ok_callback, cancel_callback){
	Log.red(message);
	Log.note(message);
//
//	var d=$('<div>'+message+"</div>").dialog({
//		title:"Alert",
//		draggable: false,
//		modal: true,
//		resizable: false,
//
//		buttons: {
//			"OK": function () {
//					$(this).dialog("close");
//					if (ok_callback) ok_callback();
//				},
//			"Cancel":cancel_callback ? function () {
//					$(this).dialog("close");
//					cancel_callback();
//				} : undefined
//		}
//	});
};//method



//TRACK ALL THE ACTIONS IN PROGRESS
Log.actionStack=[];
Log.action=function(message, waitForDone){
	var action={"message":message, "start":Date.now()};

	if (message.length>30){
		message=message.left(27)+"...";
	}//endif

	Log.actionStack.push(action);
	$("#status").html(message);
	if (message.toLowerCase()=="done"){
		$("#status").html(message);
		return;
	}//endif

	Log.note("start "+message+" "+action.start.format("HH:mm:ss"));

	//JUST SHOW MESSAGE FOR THREE SECONDS
	$("#status").html(message);
	if (!waitForDone) setTimeout(function(){Log.actionDone(action, true);}, 3000);
	return action;		//RETURNED IF YOU WANT TO REMOVE IT SOONER
};//method


Log.actionDone=function(action){
	action.end=Date.now();

	if (Log.actionStack.length==0) {
		$("#status").html("Done");
		return;
	}//endif

	var i=Log.actionStack.indexOf(action);
	if (i>=0) Log.actionStack.splice(i, 1);

	Log.note("done "+action.message+" "+action.end.format("HH:mm:ss")+" ("+action.end.subtract(action.start).floor(Duration.SECOND).toString()+")");

	if (Log.actionStack.length==0){
		$("#status").html("Done");
	}else{
		$("#status").html(Log.actionStack[Log.actionStack.length-1].message);
	}//endif
};//method


ASSERT=function(test, errorMessage){
	if (!test){
		Log.error(errorMessage);
	}//endif
};
ASSERT.hasAttributes=function(obj, keyList){
	A: for(i=0;i<keyList.length;i++){
		if (keyList[i] instanceof Array){
			for(j=0;j<keyList[i].length;j++){
				if (obj[keyList[i][j]]!==undefined) continue A;
			}//for
			Log.error("expecting object to have one of "+CNV.Object2JSON(keyList[i])+" attribute");
		}else{
			if (obj[keyList[i]]===undefined) Log.error("expecting object to have '"+keyList[i]+"' attribute");
		}//endif
	}//for
};







