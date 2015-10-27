
// Load required packages
var ToDo = require('../models/todoModel');

// Get list of todos
exports.getTodos = function (req, res) {
	listTodos(res, req.user.oauthID);
}

// Create endpoint /api/recording for POSTS
exports.addTodo = function (req, res) {
	var coursecode, task, deadline, weight;

	if (req.body.coursecode && typeof req.body.coursecode === 'string' || req.body.coursecode instanceof String) coursecode = cleanHTMLEntities(req.body.coursecode);
	if (req.body.task && typeof req.body.task === 'string' || req.body.task instanceof String) task = cleanHTMLEntities(req.body.task);
	if (req.body.deadline && typeof req.body.deadline === 'string' || req.body.deadline instanceof String) {
		deadline = new Date(req.body.deadline);
		if (deadline === NaN) res.send(error);
	} else {
		res.send(error);
	}
	if (req.body.weight && req.body.weight >= 0 && req.body.weight <= 1) {
		weight = req.body.weight;
	} else {
		res.send(error);
	}

	if (coursecode === "" || task === "" || deadline === "" || weight === "") {
		res.send(error);
	}

	// Create a new instance of the todo model
	var todo = new ToDo();

	// Set the todo properties that came from the POST data
	todo.coursecode = coursecode;
	todo.task = task;
	todo.deadline = deadline;
	todo.weight = weight;
	todo.userid = req.user.oauthID;

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

	listTodos(res, req.user.oauthID);

};

// Delete a todo
exports.deleteTask = function (req, res) {
	delID = cleanHTMLEntities(req.body.delID);
	ToDo.find({
			'userid': req.user.oauthID,
			'_id': delID
		})
		.remove()
		.exec(function (err) {
			// Send any errors returned by the query
			if (err) {
				console.log("Delete action returned an error", err);
				res.send(err);
			} else {
				console.log("Item " + delID + " was deleted.");
				res.status(200).send("Item " + delID + " was deleted.");
			}
		});
}

// Complete a todo
exports.completeTask = function (req, res) {
	complID = cleanHTMLEntities(req.body.complID);
	var rightnow = new Date();
	ToDo.update({
		'userid': req.user.oauthID,
		'_id': complID
	}, {
		'completed': rightnow
	}, function (err) {
		// Send any errors returned by the query
		if (err) {
			console.log("Mark completed action returned an error", err);
			res.send(err);
		} else {
			console.log("Item " + complID + " was marked as completed.");
			res.status(200).send("Item " + complID + " was marked as completed.");
		}
	});
}


function listTodos(res, userid) {
	ToDo.find({
			'userid': userid
		})
		.sort({
			completed: -1
		})
		.exec(function (err, todos) {
			// Send any errors returned by the query
			if (err) {
				console.log("Analysis page query returned an error: ", err);
				res.send(err);
			} else {
				res.json(todos);
			}
		});
}

function cleanHTMLEntities(rawinput) {
	var output;
	if (typeof rawinput === 'string' || rawinput instanceof String) {
		output = rawinput.replace(/&/gi, '&amp;').replace(/</gi, '&lt;').replace(/>/gi, '&gt;');
		return output;
	} else {
		return "";
	}
}