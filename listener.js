var Firebase = require('firebase');
var Ref = new Firebase('https://crowdworker-logger.firebaseio.com/'+"localhost"+'/');
Ref.on('child_changed', function(task_snapshot, prevchildname) {
	var task_reference = Ref.child(task_snapshot.key()+'/logs');
	task_reference.on('child_changed', function(assignment_snapshot, prevchildname){
		console.log(assignment_snapshot.key());
	});
	
});
