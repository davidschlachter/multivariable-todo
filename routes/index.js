
var express = require('express'),
	mongoose = require('mongoose'),
	uglifycss = require('uglifycss'),
	UglifyJS = require("uglify-js"),
	oaconfig = require('../config/oauth.js'),
	crypto = require('crypto'),
	passport = require('passport'),
	ToDo = require('../models/todoModel'),
	UserModel = require('../models/userModel'),
	todoController = require('../controllers/todo'),
	userController = require('../controllers/user');
var router = express.Router();
var path = oaconfig.fullpath;

// Compress assets
var clientCSS = uglifycss.processFiles(
    [ path + '/public/stylesheets/style.css', path + '/public/stylesheets/jquery.datetimepicker.css', path + '/public/stylesheets/font-awesome.min.css' ],
    { expandVars: true }
);
var clientJS = UglifyJS.minify([ path + "/public/javascripts/jquery.min.js", path + "/public/javascripts/jquery.datetimepicker.full.min.js", path + "/public/javascripts/moment.min.js", path + "/public/javascripts/main.js" ]).code;

// GET home page.
router.get('/', checkAuth, function (req, res, next) {
	res.render('tasks', {
		title: 'Multivariable Todo List',
		user: req.user,
		clientCSS: clientCSS,
		clientJS: clientJS
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
		res.redirect('/multivariable-todo/');
	});
router.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/multivariable-todo/');
});

// POST new task
router.post('/addTask', checkAuth, todoController.addTodo);

// POST to request tasks
router.post('/getTasks', checkAuth, todoController.getTodos);

// POST to delete a task
router.post('/deleteTask', checkAuth, todoController.deleteTask);

// POST to complete a task
router.post('/completeTask', checkAuth, todoController.completeTask);

// POST to get user preferences
router.post('/getPrefs', checkAuth, userController.getPrefs);

// POST to set user preferences
router.post('/setPrefs', checkAuth, userController.setPrefs);

// GET to create user account
router.get('/signup', checkAuth, newAccount);

// newAccount
function newAccount(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/multivariable-todo/auth/facebook');
}

// If not authenticated, check for and assign a userToken
function checkAuth(req, res, next) {
	var cookie = req.cookies.userToken;
	if (!req.isAuthenticated() && cookie === undefined) {
		var cookiedate = new Date();
		cookiedate.setTime(+ cookiedate + (365 * 86400000)); // One year
		var randomNumber = crypto.randomBytes(32).toString('hex');
		res.cookie('userToken',randomNumber, { expires: cookiedate, httpOnly: true, path: '/multivariable-todo' });
		console.log('cookie created successfully');
	}
	if (req.isAuthenticated() && req.user.needsMigration === true) importTasks(req);
	return next();
}

// Import tasks if new user
function importTasks(req) {
	console.log("Updating with", req.cookies.userToken, req.user.oauthID);
	// Transfer tasks
	ToDo.update({
		'usertoken': req.cookies.userToken
	}, {
		'userid': req.user.oauthID,
		'usertoken': ''
	}, function (err) {
		// Send any errors returned by the query
		if (err) {
			console.log("Import returned an error:", err);
		} else {
			console.log("Import successful.");
		}
	});
	// Un-set needsImport flag
	UserModel.update({
		oauthID: req.user.oauthID
	}, {
		needsMigration: false
	}, function (err) {
		// Send any errors returned by the query
		if (err) {
			console.log("needsImport returned an error", err);
		}
	});
}

module.exports = router;
