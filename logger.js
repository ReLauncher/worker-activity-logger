var EDA_LOGGER = EDA_LOGGER || (function() {
    var _args = {
        key_name: "test_name",
        key_value: "test_value"
    }; // private
    return {
        init: function(Args) {
            _args = Args;
            // Include Firebase library
            connect_firebase();
            // some other initializing
            // when Firebase library is loaded - initialize and use it
            firebase_script.onload = function() {
                var firebase_reference = new Firebase(LOGGER.firebase.getBucketURL() + "trials");
                // Log event to Firebase bucket
            };
        },
        init_firebase: function() {
            var firebase_script = document.createElement('script');
            firebase_script.src = "https://cdn.firebase.com/js/client/2.2.9/firebase.js";
            document.getElementsByTagName('head')[0].appendChild(firebase_script);
            firebase_script.onload = function() {
                _args["firebase_instance"] = new Firebase("https://crowdworker-logger.firebaseio.com/trials");
                log_event(_args["firebase_instance"]);
            };
        },
        log_event: function(firebase_reference) {
            firebase_reference.push({
                pathname: document.location.pathname,
                search: document.location.search,
                hostname: document.location.hostname,
                hash: document.location.hash,
                key_name: _args.key_name,
        		key_value: _args.key_value
            });
        }
    };
}());