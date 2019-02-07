//FROM git clone git://github.com/harthur/bz.js.git

var BugzillaClient = function(options){
  options = options || {};
  this.username = options.username;
  this.password = options.password;
  this.timeout = options.timeout || 0;
  this.apiUrl = options.url ||
    (options.test ? "https://bugzilla.mozilla.org/bzapi"
      : "https://bugzilla.mozilla.org/bzapi");
  this.apiUrl = this.apiUrl.replace(/\/$/, "");
}

BugzillaClient.prototype = {
  searchBugs: function(params, callback){
    Log.warning("Replace this call with a call to bugzilla rest API: http://bugzilla.readthedocs.io/en/latest/api/core/v1/bug.html#get-bug");

    this.APIRequest('/bug', 'GET', callback, 'bugs', null, params);
  },

  APIRequest: function(path, method, callback, field, body, params){
    var url = this.apiUrl + path;
    if (this.username && this.password){
      params = params || {};
      params.username = this.username;
      params.password = this.password;
    }
    if (params)
      url += "?" + this.urlEncode(params);

    body = JSON.stringify(body);

//    try {
//      XMLHttpRequest = require("xhr").XMLHttpRequest; // Addon SDK
//    }
//    catch(e) {}

    var that = this;
    if (typeof XMLHttpRequest != "undefined"){
      // in a browser
      var req = new XMLHttpRequest();
      req.open(method, url, true);
      req.setRequestHeader("Accept", "application/json");
      if (method.toUpperCase() !== "GET"){
        req.setRequestHeader("content-type", "application/json");
      }
      req.onreadystatechange = function(event){
        if (req.readyState == 4 && req.status != 0){
          that.handleResponse(null, req, callback, field);
        }
      };
      req.timeout = this.timeout;
      req.ontimeout = function(event){
        that.handleResponse('timeout', req, callback);
      };
      req.onerror = function(event){
        that.handleResponse('error', req, callback);
      };
      req.send(body);
    }
    else{
      // node 'request' package
      var request = require("request");
      var requestParams = {
        uri: url,
        method: method,
        body: body,
        headers: {'content-type': 'application/json'}
      };
      if (this.timeout > 0)
        requestParams.timeout = this.timeout;
      request(requestParams, function(err, resp, body){
          that.handleResponse(err, {
            status: resp && resp.statusCode,
            responseText: body
          }, callback, field);
        }
      );
    }
  },

  handleResponse: function(err, response, callback, field){
    var error, json;
    if (err && err.code && (err.code == 'ETIMEDOUT' || err.code == 'ESOCKETTIMEDOUT'))
      err = 'timeout';
    else if (err)
      err = err.toString();
    if (err)
      error = err;
    else if (response.status >= 300 || response.status < 200)
      error = "HTTP status " + response.status;
    else{
      try{
        json = JSON.parse(response.responseText);
      } catch(e){
        error = "Response wasn't valid json: '" + response.responseText + "'";
      }
    }
    if (json && json.error)
      error = json.error.message;
    var ret;
    if (!error){
      ret = field ? json[field] : json;
      if (field == 'ref'){// creation returns API ref url with id of created object at end
        var match = ret.match(/(\d+)$/);
        ret = match ? parseInt(match[0]) : true;
      }
    }
    callback(error, ret);
  },

  urlEncode: function(params){
    var url = [];
    for (var param in params){
      var values = params[param];
      if (!values.forEach)
        values = [values];
      // expand any arrays
      values.forEach(function(value){
        url.push(encodeURIComponent(param) + "=" +
          encodeURIComponent(value));
      });
    }
    return url.join("&");
  }


};
