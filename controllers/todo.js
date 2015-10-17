
// Load required packages
var ToDo = require('../models/todoModel');

// Get list of todos
exports.getTodos = function (req, res) {
	listTodos(res);
}

// Create endpoint /api/recording for POSTS
exports.addTodo = function (req, res) {
	var coursecode, task, deadline, weight;
	
	coursecode = cleanInput(req.body.coursecode);
	task = cleanInput(req.body.task);
	deadline = cleanInput(req.body.deadline);
	weight = cleanInput(req.body.weight);

	// Create a new instance of the todo model
	var todo = new ToDo();

	// Set the todo properties that came from the POST data
	todo.coursecode = coursecode;
	todo.task = task;
	todo.deadline = deadline;
	todo.weight = weight;
	//todo.userid = req.user.id;

	// Save the todo and check for errors
	todo.save(function (err) {
		if (err) {
			res.send(err);
			console.log("Error adding to database was: " + err);
		} else {
			//console.log("Recording added from user " + req.user.displayName + ": ", post_text);
			console.log("Task added.");
		}
	});
	
	// Send the todos back to client
	listTodos(res);

	function cleanInput(rawinput) {
		var output;
		if (typeof rawinput === 'string' || rawinput instanceof String) {
			output = rawinput.replace(/[\${}\[\]&\0";\\]/gi, '');
			return output;
		} else {
			return "";
		}
	}

};

function listTodos(res) {
	ToDo.find({
		//'userid': req.user.id,
	})
	.sort({ weight: -1 })
	.exec(function (err, todos) {
		// Send any errors returned by the query
		if (err) {
			console.log("Analysis page query returned an error: ", err);
			res.send(err);
		} else {
			console.log("Length of todos was", todos.length);
			//console.log("Todos were", todos);
			res.json(todos);
		}
	});
}