var requestify = require('requestify');
var fs = require('fs');


var firebase_base_url = 'https://crowdworker-logger.firebaseio.com/' + "taskscrowdflowercom" + '/';
var task_id = 836250;
var firebase_target_url = firebase_base_url + task_id + ".json";
var folder = "logs/";
var filename = folder + task_id + "_logs.csv";

fs.createWriteStream(filename);
fs.truncate(filename, 0, function() {
    console.log('file ' + filename + ' was cleaned up.')
});
fs.appendFile(filename, 'unit_id, assignment_id, worker_id, dt_start, dt_end, status\n', function(err) {});

var Logs = [];
// -------------------------------------------------------
// Convert log object into a string
// -------------------------------------------------------
function stringify(log_array) {
    for (var i = 0; i < log_array.length; i++) {
        log_array[i]['string'] = "";
        log_array[i]['string'] += log_array[i].unit_id + ", ";
        log_array[i]['string'] += log_array[i].assignment_id + ", ";
        log_array[i]['string'] += log_array[i].worker_id + ", ";
        log_array[i]['string'] += log_array[i].dt_start + ", ";
        log_array[i]['string'] += log_array[i].dt_end + ", ";
        log_array[i]['string'] += log_array[i].status;
    }
    return log_array;
}
// -------------------------------------------------------
// Collect data for a given Job and make a plain Array of log objects
// -------------------------------------------------------
requestify.get(firebase_target_url, {
        headers: {
            "Accept": "application/json"
        }
    })
    .then(function(response) {
        var assignments = response.getBody();
        for (var a_id in assignments) {
            var a = assignments[a_id];
            if (a_id != "editor_preview" && a.unit_id != undefined) {
                for (var l_id in a.logs) {
                    var l = a.logs[l_id];
                    var log_record = {
                        'unit_id': a.unit_id,
                        'assignment_id': a_id,
                        'worker_id': a.worker_id,
                        'dt_start': l.dt,
                        'status': l.status
                    }
                    Logs.push(log_record);
                }
            } else {
                console.log("PROBLEMATIC ASSIGNMENT", a);
            }
        }
        // -------------------------------------------------------
        // Add end events to log objects
        // -------------------------------------------------------
        for (var i = 0; i < Logs.length; i++) {
            if (Logs[i].status != 'closed') {
                if (i < (Logs.length - 1) && Logs[i].assignment_id == Logs[i + 1].assignment_id) {
                    Logs[i]['dt_end'] = Logs[i + 1]['dt_start'];
                }
            }
            if (Logs[i]['dt_end'] == undefined) {
                Logs[i]['dt_end'] = Logs[i]['dt_start'] + 1000;
            }

        }
        // -------------------------------------------------------
        // Convert each object in array into string and save it into the log file
        // -------------------------------------------------------
        Logs = stringify(Logs);
        for (var i = 0; i < Logs.length; i++) {
            console.log(Logs[i]['string']);
            fs.appendFile(filename, Logs[i]['string'] + '\n', function(err) {});
        }
        console.log(firebase_target_url);
    });
