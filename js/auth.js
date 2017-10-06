var clientid = '706092088663-1ur3mt6607aabki0lggij9ad9gt06r6d.apps.googleusercontent.com';
var apikey = 'AIzaSyDHRk9uzGCpQVBAK8iwP2JYouXfzN_EKcw';
var scopes = 'https://www.googleapis.com/auth/drive';
var gauth;
			
function clientLoadAuth() {
	gapi.load('client:auth2', clientInitAuth);
    
}
			
function clientInitAuth() {
    console.log("load function");
	var discoverydoc = 'https://www.googleapis.com/discovery/v1/apis/drive/v2/rest';
	gapi.client.init({
		'apiKey': apikey,
		'discoveryDocs': [discoverydoc],
		'clientId': clientid,
		'scope': scopes
	}).then(function() {
        console.log("init function");
		gauth = gapi.auth2.getAuthInstance();
					
					//Can figure out more advanced signin stuff later
					
		if(!gauth.isSignedIn.get()) {
			gauth.signIn();
            console.log("Signed in");
		}
	}, function(error) {
        console.log(error);
    });
}

function identityAuth() {
    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
        if(chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
        }
        else {
            console.log("Token: " + token);
            
            // Test code, not my own
            /*var x = new XMLHttpRequest();
            x.open('GET', 'https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=' + token);
            x.onload = function() {
                console.log(x.response);
            };
            x.send(); */
            
            
            return token;
        }
    });
}

tok = identityAuth();
var xhr = new XMLHttpRequest();
xhr.open('GET', "https://www.googleapis.com/drive/v2/files/" + "1GDoJXHzDnPKo4IV1PBZDViLv3dDLCqf1IYN9yTYGhAk");
xhr.setRequestHeader('Authorization', 'Bearer ' + tok);
xhr.onload = function() {
    console.log(xhr.response);
};
xhr.onerror = function() {
    console.log(xhr.response);
}
xhr.send();
//clientLoadAuth();
//setupOverDrive();