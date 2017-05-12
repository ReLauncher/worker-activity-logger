var Firebase = require('firebase');
var requestify = require('requestify');
var firebase_base_url = 'https://crowdworker-logger.firebaseio.com/' + "taskscrowdflowercom" + '/';
var Ref = new Firebase(firebase_base_url);
var CROWDFLOWER_API_KEY = process.env.CROWDFLOWER_API_KEY;

Ref.on('child_changed', function(task_snapshot, prevchildname) {
    var task_id = task_snapshot.key();
    console.log(task_id);
    var task_reference = Ref.child(task_id);

    task_reference.on('child_added', function(assignment_snapshot, prevchildname) {
        var assignment_details = assignment_snapshot.val();
        var unit_id = assignment_details['unit_id'];
        if (unit_id == undefined) {
            var key_name = assignment_details['key_name'];
            var unit_key = {
                'name': assignment_details['key_name'],
                'value': assignment_details['key_value']
            };
            console.log(unit_key);
            var units_url = "http://api.crowdflower.com/v1/jobs/" + task_id + "/units/?key=" + CROWDFLOWER_API_KEY;
            console.log(units_url);

            requestify.get(units_url, {
                    headers: {
                        "Accept": "application/json"
                    }
                })
                .then(function(response) {
                    var units = response.getBody();
                    //console.log(units);
                    for (var key in units) {
                        if (units[key][unit_key["name"]] == unit_key["value"]) {
                            task_reference.child(assignment_snapshot.key()).update({
                                unit_id: key
                            });
                        }
                        // do something with key
                    }
                });

        }
    });
});
