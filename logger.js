// Logs path:
/*
base_url/platform_name/task_id/assignment_code/

{
    key_name: "test_name",
    key_value: "test_value",
    worker_id: 0,
    logs: [
    ]
}

*/

var EDA_LOGGER = EDA_LOGGER || (function() {
    var debug = true;
    var log = function(message){if (debug) console.log("[EDA_LOGGER] LOG: "+message);};
    var _args = {
        key_name: "test_name",
        key_value: "test_value",
        task_id: 0
    }; // private
    return {
        init: function(Args) {
            _args = Args;
            // Include Firebase library
            this.init_firebase();
        },
        init_firebase: function() {
            var firebase_script = document.createElement('script');
            firebase_script.src = "https://cdn.firebase.com/js/client/2.2.9/firebase.js";

            log(firebase_script.src);

            document.getElementsByTagName('head')[0].appendChild(firebase_script);
            var logger = this;
            firebase_script.onload = function() {
                // get the assignment code from the url
                var assignment_code = document.location.pathname.substring(document.location.pathname.lastIndexOf("/"),document.location.pathname.length);
                log(assignment_code);
                // get the platform code from the url
                var platform_code = document.location.hostname.replace(/\./g,'');
                // form the firebase endpoint url
                var firebase_endpoint_url = "https://crowdworker-logger.firebaseio.com/"+platform_code+"/"+_args["task_id"]+assignment_code;
                log(firebase_endpoint_url);

                _args["firebase_assignment"] = new Firebase(firebase_endpoint_url);
                _args["firebase_assignment"].update({
                    key_name: _args.key_name,
                    key_value: _args.key_value,
                });
                _args["firebase_logs"] = _args["firebase_assignment"].child('logs');
                logger.log_event(_args["firebase_logs"]);
            };
        },
        log_event: function(firebase_reference) {
            firebase_reference.push({
                status: 1
            });
        }
    };
}());
