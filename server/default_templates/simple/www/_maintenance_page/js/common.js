
//
//Requires jQuery
//

//Load message on document load
(function() { get_message() })();

//Get message
function get_message() {
    //Set URL
    let url = "_maintenance_page/api/message";
    let query = {}

    //Set call parameters
    let request = {
		"method":"GET",
		"url":url,
		"query":query,
		"callback":update_message
    }

    //Call request
    new web_connector(request)
}

//Update message
function update_message(response) {
	//Get response text
	let this_message = "";
	if(response.text != "") {
		//Convert carriage returns to html line breaks
		this_message = (response.text).trim();
		this_message = this_message.replaceAll("\\r\\n","<br />");
		this_message = this_message.replaceAll("\\n","<br />");
		
		//Bold emphasized words *bold*
		this_message = this_message.replace(/\*(.*?)\*/gm, "<b>$1</b>")
	}
	
	//Update message
	document.getElementById("message").innerHTML = this_message;
}