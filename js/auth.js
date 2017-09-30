var clientid = '706092088663-1ur3mt6607aabki0lggij9ad9gt06r6d.apps.googleusercontent.com';
var apikey = 'AIzaSyDHRk9uzGCpQVBAK8iwP2JYouXfzN_EKcw';
var scopes = 'https://www.googleapis.com/auth/drive';
var gauth;
			
function clientLoadAuth() {
	gapi.load('client:auth2', clientInitAuth);
}
			
function clientInitAuth() {
	var discoverydoc = 'https://www.googleapis.com/discovery/v1/apis/drive/v2/rest';
	gapi.client.init({
		'apiKey': apikey,
		'discoveryDocs': [discoverydoc],
		'clientId': clientid,
		'scope': scopes
	}).then(function() {
		gauth = gapi.auth2.getAuthInstance();
					
					//Can figure out more advanced signin stuff later
					
		if(!gauth.isSignedIn.get()) {
			gauth.signIn();
		}
	});
}