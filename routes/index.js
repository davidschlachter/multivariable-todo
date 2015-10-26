
var express = require('express'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	todoController = require('../controllers/todo');
var router = express.Router();

// GET home page.
router.get('/', function (req, res, next) {
	res.render('index', {
		title: 'Multivariable Todo'
	});
});

// GET tasks page.
router.get('/tasks', ensureAuthenticated, function (req, res, next) {
	res.render('tasks', {
		title: 'Task Tricks',
		user: req.user
	});
});

// Ping route
router.get('/ping', function (req, res) {
	res.send("pong!", 200);
});

router.get('/auth/facebook',
	passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
	passport.authenticate('facebook', {
		failureRedirect: '/multivariable-todo/'
	}),
	function (req, res) {
		console.log(req.user.displayName + " (" + req.user.id + ") logged in successfully.");
		res.redirect('/multivariable-todo/tasks');
	});
router.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/multivariable-todo/');
});

// POST new task
router.post('/addTask', ensureAuthenticated, todoController.addTodo);

// POST to request tasks
router.post('/getTasks', ensureAuthenticated, todoController.getTodos);

// POST to delete a task
router.post('/deleteTask', ensureAuthenticated, todoController.deleteTask);

// POST to complete a task
router.post('/completeTask', ensureAuthenticated, todoController.completeTask);

// ensureAuthenticated
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/multivariable-todo/')
}

module.exports = router;
