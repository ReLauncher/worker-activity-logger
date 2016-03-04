var Firebase = require('firebase');
var requestify = require('requestify');


var JOB_TO_BE_PROCESSED = 850870;
var DELAY_QUEUE_TIME = 30000;


var Crowdflower = {
    base: "http://api.crowdflower.com/v1/",
    api_key: process.env.CROWDFLOWER_API_KEY,
    getUnit: function(job_id, unit_id, callback) {
        var cf = Crowdflower;
        var crowdflower_unit_url = cf.base + "/jobs/" + job_id + "/units/" + unit_id + ".json?key=" + cf.api_key;
        console.log(crowdflower_unit_url);
        requestify.get(crowdflower_unit_url, {
                headers: {
                    "Accept": "application/json"
                }
            })
            .then(function(response) {
                var crowdflower_unit = response.getBody();
                callback(crowdflower_unit);
            });
    }
}
var Firebase_urls = {
    base: 'https://crowdworker-logger.firebaseio.com/',
    crowdflower: "taskscrowdflowercom/",
    queue: function() {
        var fb = Firebase_urls;
        return fb.base + "queue/";
    },
    tasks: function() {
        var fb = Firebase_urls;
        var url = fb.base + fb.crowdflower;
        return url;
    },
    assignments: function(job_id) {
        var fb = Firebase_urls;
        var url = fb.base + fb.crowdflower + job_id + "/";
        return url;
    }
}

function getLastLog(logs) {
    if (logs) {
        var last_log_id = Object.keys(logs)[Object.keys(logs).length - 1];
        var last_log = logs[last_log_id];
        return last_log;
    }
    return false;
}


function addToQueue(job_id, unit_id, assignment_id) {
    console.log(DELAY_QUEUE_TIME / 1000 + " seconds passed");
    var assignment_ref = new Firebase(Firebase_urls.queue());
    assignment_ref.push({
        suspect: "abandoned",
        job_id: job_id,
        unit_id: unit_id,
        assignment_id: assignment_id,
        dt: Firebase.ServerValue.TIMESTAMP
    });
    console.log("event is added to the queue");
}

function relaunchUnit(job_id, unit_id) {
    requestify.post("http://localhost:3000/jobs/" + job_id + "/units/" + unit_id + "/relaunch", {
            api_key: Crowdflower.api_key
        }, {
            headers: {
                "Accept": "application/json"
            }
        })
        .then(function(response) {
            var resp = response.getBody();
            console.log(resp);
        });
}

console.log("====================\nStart Logs Monitoring\n====================");

var logs_ref = new Firebase(Firebase_urls.assignments(JOB_TO_BE_PROCESSED));
logs_ref.on('child_changed', function(assignment_snapshot, prevchildname) {
    var job_id = JOB_TO_BE_PROCESSED;

    var assignment_details = assignment_snapshot.val();
    var assignment_id = assignment_snapshot.key();

    var unit_id = assignment_details['unit_id'];
    var logs = assignment_details['logs'];

    if (unit_id) {
        last_log = getLastLog(logs);
        if (last_log && last_log.status == "closed") {
            console.log(unit_id, assignment_id, assignment_details["status"]);
            //add the unit to queue to be processed
            setTimeout(function() {
                addToQueue(job_id, unit_id, assignment_id);
            }, DELAY_QUEUE_TIME);
        }
    }
});





console.log("====================\nStart Queue Monitoring\n====================");
var ref_queue = new Firebase(Firebase_urls.queue());
ref_queue.on('child_added', function(queue_element_snapshot, prevchildname) {
    console.log("processing a queue element");

    var element = queue_element_snapshot.val();
    var unit_id = element['unit_id'];
    var job_id = element['job_id'];
    var assignment_id = element['assignment_id'];
    var assignment_ref = new Firebase(Firebase_urls.assignments(job_id) + assignment_id + '/logs/');

    assignment_ref.orderByChild("dt").limitToLast(1).once("value", function(log_snapshot) {
        var logs = log_snapshot.val();
        var last_log = getLastLog(logs);
        console.log(last_log);
        //        var logs = assignment['logs'];
        //        getLastLog(logs, function(last_log) {
        if (last_log.status == "closed") {
            console.log("check unit state at CrowdFlower");
            setTimeout(function() {
                console.log(DELAY_QUEUE_TIME/1000+" seconds passed");
                Crowdflower.getUnit(job_id, unit_id, function(cf_unit) {
                    console.log(cf_unit['state']);
                    if (cf_unit['state'] == "judging") {
                        console.log("to relaunch the unit");
                        relaunchUnit(job_id, unit_id);
                    }
                });
            }, DELAY_QUEUE_TIME);

        }
    });
    // remove element from queue, because it is checked;
    var queue_element_to_be_deleted = new Firebase(Firebase_urls.queue() + queue_element_snapshot.key());
    queue_element_to_be_deleted.set(null);
    console.log("element " + queue_element_snapshot.key() + " is removed");
});
