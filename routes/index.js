var express = require('express'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	todoController = require('../controllers/todo');
var router = express.Router();

// GET home page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// GET tasktricks page.
router.get('/tasktricks', function(req, res, next) {
  res.render('tasktricks', { title: 'Task Tricks' });
});

// POST new task
router.post('/addTask', todoController.addTodo);

// POST to request tasks
router.post('/getTasks', todoController.getTodos);

module.exports = router;