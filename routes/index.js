
var express = require('express'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	todoController = require('../controllers/todo'),
	userController = require('../controllers/user');
var router = express.Router();

// GET home page.
router.get('/', function (req, res, next) {
	res.render('index', {
		title: 'Multivariable Todo'
	});
});

// GET tasks page.
router.get('/tasks', needsCookie, function (req, res, next) {
	res.render('tasks', {
		title: 'Task Tricks',
		user: req.user
	});
});

// Session routes
router.get('/auth/facebook',
	passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
	passport.authenticate('facebook', {
		failureRedirect: '/multivariable-todo/'
	}),
	function (req, res) {
		console.log(req.user.displayName + " (" + req.user.oauthID + ") logged in successfully.");
		res.redirect('/multivariable-todo/tasks');
	});
router.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/multivariable-todo/');
});

// POST new task
router.post('/addTask', needsCookie, todoController.addTodo);

// POST to request tasks
router.post('/getTasks', needsCookie, todoController.getTodos);

// POST to delete a task
router.post('/deleteTask', needsCookie, todoController.deleteTask);

// POST to complete a task
router.post('/completeTask', needsCookie, todoController.completeTask);

// POST to get user preferences
router.post('/getPrefs', needsCookie, userController.getPrefs);

// POST to set user preferences
router.post('/setPrefs', needsCookie, userController.setPrefs);

// ensureAuthenticated
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/multivariable-todo/auth/facebook')
}

// If not authenticated, check for and assign a userToken
function needsCookie(req, res, next) {
	var cookie = req.cookies.userToken;
	if (!req.isAuthenticated() && cookie === undefined) {
		var cookiedate = new Date();
		cookiedate.setTime(+ cookiedate + (365 * 86400000)); // One year
		randomNumber=Math.random().toString();
		randomNumber=randomNumber.substring(2,randomNumber.length);
		res.cookie('userToken',randomNumber, { expires: cookiedate, httpOnly: true });
		console.log('cookie created successfully');
	}
	return next();
}

module.exports = router;
