
/*

MIT License

Copyright (c) 2023 Cliff Sandford [cliffsandford1@gmail.com]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

//Set response data
var _response = {
    "status_code":200,
    "headers":{
        "Content-Type":"application/json"
    },
    "body":null
}

//Module request
exports.request = async function(params={}) {
    //Set const
    const _env = params._server.environment;
    const _server = params._server;
    const _client = params._client;
    const _headers = params._headers;
    const _request = params._request;
    const _query = params._query;

	//Get query string
    if(_request.method == undefined) { _error("Method undefined"); return _response; }
    if(_request.method != "GET") {     _error("Method invalid"); return _response; }
	if(_query.action == undefined) {   _error("Missing API request"); return _response; }

    //Get properties
	let user_cookie = _client.cookie;
    let user_agent = _client.user_agent;
	let user_ip = _client.remote_ip;
	if(_client.remote_ip_xff) {
		user_ip = _client.remote_ip_xff;
	}
	
    //Imports
    const path = require("path");
	const class_manage = path.join(path.dirname(path.dirname(__dirname)),"class","manage_server.js");

    //Define classes
    var manage_server = require(class_manage);

	//Define auth objects
	var mgmt = new manage_server(user_cookie, user_agent, user_ip);

	//Response
	let api_response = null;
	let response = {
		"error":"",
		"state":"unauthenticated",
		"authenticated":false,
		"data":{}
	}

	//Do action
	switch(_query.action) {
		//Get server mapping
		case "get_server_url_mapping":
			api_response = mgmt.admin_get_server_url_mapping(_query);
		break;
		case "test_server_url_mapping":
			api_response = mgmt.admin_test_server_url_mapping(_query);
		break;

		//Get configs
		case "users_get":
			api_response = mgmt.admin_users_get();
			if(api_response.data != undefined) {
				response.data = api_response.data;
			}
		break;
		case "user_groups":
			api_response = mgmt.admin_user_groups_get(_query);
			if(api_response.data != undefined) {
				response.data = api_response.data;
			}
		break;

		//Manage user
		case "user_add":
			api_response = mgmt.admin_user_add(_query);
		break;
		case "user_delete":
			api_response = mgmt.admin_user_delete(_query);
		break;
		case "user_unlock":
			api_response = mgmt.admin_user_unlock(_query);
		break;
		case "user_state":
			api_response = mgmt.admin_user_state(_query);
		break;
		case "user_group_member":
			api_response = mgmt.admin_user_group_member(_query);
		break;
		case "user_details":
			api_response = mgmt.admin_user_details(_query);
		break;
		case "user_password_set":
			api_response = mgmt.admin_user_password_set(_query);
		break;

		//Default mismatch action
		default:
			response.error = `Invalid request action [${_query.action}]`
	}

	//Handle API response
	if(api_response != null) {
		if(response.error != undefined) {
			if(api_response.error != "") {
				response.error = api_response.error;
			}
		}
		if(response.state != undefined) {
			response.state = api_response.state;
		}
		if(response.authenticated != undefined) {
			response.authenticated = api_response.authenticated;
		}
	}

    //Return response
    _return(api_response);
    return _response;
}

///////////////////////////////////////////
//Default function
///////////////////////////////////////////

function _error(out, status_code=200) {
    //Default content type
    if(status_code != 200) {
        _response["status_code"] = status_code;
    }
    _response["body"] = JSON.stringify({"error":out});
}
function _return(out) {
    //Default content type
    let content_type = "application/json";
    let content = {}
	
	//Set response type
	switch(typeof(out)) {
		case "object":
			content_type = "application/json";
			try {
				content = JSON.stringify(out);
			}catch{
				content_type = "text/html";
				content = out;
			}
		break;
        default:
			content_type = "text/html";
			content = out;
	}

    //Set response
    _response["headers"]["Content-Type"] = content_type;
    _response["body"] = content;
}
