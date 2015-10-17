
// Load required packages
var mongoose = require('mongoose');

// Define the todo schema
var ToDoSchema = new mongoose.Schema({
	coursecode: String,
	task: String,
	deadline: {
		type: Date,
		default: Date.now
	},
	weight: {
		type: Number,
		max: 1,
		min: 0
	},
	userid: String
});

// Export the Mongoose model
module.exports = mongoose.model('todoModel', ToDoSchema);