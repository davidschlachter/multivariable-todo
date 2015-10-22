
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

// GET tasktricks page.
router.get('/tasktricks', ensureAuthenticated, function (req, res, next) {
	res.render('tasktricks', {
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
		res.redirect('/multivariable-todo/tasktricks');
	});
router.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/multivariable-todo/');
});

// POST new task
router.post('/addTask', ensureAuthenticated, todoController.addTodo);

// POST to request tasks
router.post('/getTasks', ensureAuthenticated, todoController.getTodos);

// ensureAuthenticated
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/')
}

module.exports = router;