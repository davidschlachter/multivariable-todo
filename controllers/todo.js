
// Load required packages
var ToDo = require('../models/todoModel');

// Get list of todos
exports.getTodos = function (req, res) {
	var auth = getAuth(req);
	listTodos(res, auth);
}

// Add a new task
exports.addTodo = function (req, res) {
	var coursecode, task, deadline, weight;
	var query = getAuth(req);

	if (req.body.coursecode && typeof req.body.coursecode === 'string' || req.body.coursecode instanceof String) query['coursecode'] = cleanHTMLEntities(req.body.coursecode);
	if (req.body.task && typeof req.body.task === 'string' || req.body.task instanceof String) query['task'] = cleanHTMLEntities(req.body.task);
	if (req.body.deadline && typeof req.body.deadline === 'string' || req.body.deadline instanceof String) {
		deadline = new Date(req.body.deadline);
		if (deadline === NaN) res.send(error);
		query['deadline'] = deadline
	} else {
		res.send(error);
	}
	if (req.body.weight && req.body.weight >= 0 && req.body.weight <= 1) {
		query['weight'] = req.body.weight;
	} else {
		res.send(error);
	}

	if (coursecode === "" || task === "" || deadline === "" || weight === "") {
		res.send(error);
	}

	// Create a new instance of the todo model
	var todo = new ToDo(query);

	// Save the todo and check for errors
	todo.save(function (err) {
		if (err) {
			res.send(err);
			console.log("Error adding to database was: " + err);
		} else {
			console.log("Task added.");
		}
	});

	listTodos(res, query);

};

// Delete a todo
exports.deleteTask = function (req, res) {
	var query = getAuth(req);
	query['_id'] = cleanHTMLEntities(req.body.delID);
	ToDo.find(query)
		.remove()
		.exec(function (err) {
			// Send any errors returned by the query
			if (err) {
				console.log("Delete action returned an error", err);
				res.send(err);
			} else {
				console.log("Item " + query['_id'] + " was deleted.");
				res.status(200).send("Item " + query['_id'] + " was deleted.");
			}
		});
}

// Complete a todo
exports.completeTask = function (req, res) {
	var query = getAuth(req);
	query['_id'] = cleanHTMLEntities(req.body.complID);
	var rightnow = new Date();
	ToDo.update(query, {
		'completed': rightnow
	}, function (err) {
		// Send any errors returned by the query
		if (err) {
			console.log("Mark completed action returned an error", err);
			res.send(err);
		} else {
			console.log("Item " + query['_id'] + " was marked as completed.");
			res.status(200).send("Item " + query['_id'] + " was marked as completed.");
		}
	});
}


function listTodos(res, auth) {
	ToDo.find(auth)
		.sort({
			completed: -1
		})
		.exec(function (err, todos) {
			// Send any errors returned by the query
			if (err) {
				console.log("Query in listTodos returned an error:", err);
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

function getAuth(req) {
	var oauthID, userToken, auth = {};
	if (req.user && req.user.oauthID) {
		auth['userid'] = req.user.oauthID;
	} else if (req.cookies && req.cookies.userToken) {
		auth['usertoken'] = req.cookies.userToken;
	} else {
		return undefined;
	}
	return auth;
}
