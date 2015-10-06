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
            console.log(firebase_script.src);
            console.log(document.getElementsByTagName('head')[0]);
            document.getElementsByTagName('head')[0].appendChild(firebase_script);
            var logger = this;
            firebase_script.onload = function() {
                var assignment_code = document.location.pathname.substring(document.location.pathname.lastIndexOf("/"),document.location.pathname.length).replace(/-/g,'');
                console.log(assignment_code);
                _args["firebase_assignment"] = new Firebase("https://crowdworker-logger.firebaseio.com/"+document.location.hostname+"/"+_args["task_id"]+"/"+assignment_code);
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
