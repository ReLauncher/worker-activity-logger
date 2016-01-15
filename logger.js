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
    var settings = {
            debug: true,
            firebase: {
                bucket: "crowdworker-logger"
            }
        }
        // A log function which can be easily turned of using debug variable
    var log = function(message) {
        if (settings.debug) console.log("[EDA_LOGGER] LOG: " + message);
    };

    function isPageHidden() {
        return document.hidden || document.msHidden || document.webkitHidden || document.mozHidden;
    }

    var _args = {
        key_name: "test_name",
        key_value: "test_value",
        task_id: 0
    }; // private
    return {
        init: function(Args) {
            _args = Args;
            // Include Firebase library
            var logger = this;
            logger.init_firebase(function() {
                logger.init_events_capturing();
            });
        },
        init_firebase: function(callback) {
            var firebase_script = document.createElement('script');
            firebase_script.src = "https://cdn.firebase.com/js/client/2.2.9/firebase.js";

            log(firebase_script.src);

            document.getElementsByTagName('head')[0].appendChild(firebase_script);
            var logger = this;
            firebase_script.onload = function() {
                // get the assignment code from the url
                var assignment_code = document.location.pathname.substring(document.location.pathname.lastIndexOf("/"), document.location.pathname.length);
                log(assignment_code);
                // get the platform code from the url
                var platform_code = document.location.hostname.replace(/\./g, '');
                // form the firebase endpoint url
                var firebase_endpoint_url = "https://" + settings.firebase.bucket + ".firebaseio.com/" + platform_code + "/" + _args["task_id"] + assignment_code;
                log(firebase_endpoint_url);

                _args["firebase_assignment"] = new Firebase(firebase_endpoint_url);
                _args["firebase_assignment"].update({
                    key_name: _args.key_name,
                    key_value: _args.key_value,
                    unit_id:_args.key_value
                });
                _args["firebase_logs"] = _args["firebase_assignment"].child('logs');
                callback();
            };
        },
        init_events_capturing: function() {
            var logger = this;
            // Log the task was opened by the worker
            logger.log_event(_args["firebase_logs"], "opened");
            // Log the task page was closed by the worker
            window.onbeforeunload = function() {
                logger.log_event(_args["firebase_logs"], "closed");
            };
            logger.init_visibility_changes();
        },
        init_visibility_changes: function() {
            var hidden, visibilityChange;
            if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
                hidden = "hidden";
                visibilityChange = "visibilitychange";
            } else if (typeof document.mozHidden !== "undefined") {
                hidden = "mozHidden";
                visibilityChange = "mozvisibilitychange";
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
            }
            var logger = this;

            function handleVisibilityChange() {
                if (document[hidden]) {
                    logger.log_event(_args["firebase_logs"], "hidden");
                } else {
                    logger.log_event(_args["firebase_logs"], "active");
                }
            }
            // Warn if the browser doesn't support addEventListener or the Page Visibility API
            if (typeof document.addEventListener === "undefined" ||
                typeof document[hidden] === "undefined") {
                //alert("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
            } else {
                // Handle page visibility change   
                document.addEventListener(visibilityChange, handleVisibilityChange, false);
            }
        },
        log_event: function(firebase_reference, status) {
            firebase_reference.push({
                status: status,
                dt: Firebase.ServerValue.TIMESTAMP
            });
        }
    };
}());
