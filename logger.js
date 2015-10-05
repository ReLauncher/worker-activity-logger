// settings 
var LOGGER = {
	'firebase':{
		'base': "https://cdn.firebase.com/",
		'version':"2.2.9",
		'bucket':"crowdworker-logger",
		getScriptURL: function(){
			return LOGGER.firebase.base+"js/client/"+LOGGER.firebase.version+"/firebase.js";
		},
		getBucketURL: function(){
			return "https://"+LOGGER.firebase.bucket+".firebaseio.com/";
		}
	}
}

var isActive;

window.onfocus = function() {
    isActive = true;
};

window.onblur = function() {
    isActive = false;
};
// Include Firebase library
var firebase_script = document.createElement('script');
firebase_script.src = LOGGER.firebase.getScriptURL();
document.getElementsByTagName('head')[0].appendChild(firebase_script);

// when Firebase library is loaded - initialize and use it
firebase_script.onload = function() {
    var firebase_reference = new Firebase(LOGGER.firebase.getBucketURL()+"trials");
    // Log event to Firebase bucket
    firebase_reference.push({
        pathname: document.location.pathname,
        search: document.location.search,
        hostname: document.location.hostname,
        hash: document.location.hash
    });

    // test
    setInterval(function() {
        console.log(window.isActive ? 'active' : 'inactive');
    }, 1000);
};
