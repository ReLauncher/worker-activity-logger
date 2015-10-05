var isActive;

window.onfocus = function() {
    isActive = true;
};

window.onblur = function() {
    isActive = false;
};
// Include Firebase library
var firebase_script = document.createElement('script'); firebase_script.src = 'https://cdn.firebase.com/js/client/2.2.9/firebase.js'; document.head.appendChild(firebase_script);

var firebase_reference = new Firebase("https://crowdworker-logger.firebaseio.com/trials");
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