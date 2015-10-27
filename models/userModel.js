
// Load required packages
var mongoose = require('mongoose');

// Define the todo schema
var userSchema = new mongoose.Schema({
	oauthID: String,
	authProvider: String,
	displayName: String,
	backgroundURL: String,
	backgroundOpacity: {
		type: Number,
		max: 1,
		min: 0
	}
});

// Export the Mongoose model
module.exports = mongoose.model('userModel', userSchema);