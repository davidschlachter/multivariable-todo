
// Load required packages
var mongoose = require('mongoose');

// Define the todo schema
var userSchema = new mongoose.Schema({
	oauthID: String,
	authProvider: String,
	displayName: String,
	backgroundURL: {
		type: String,
		default: "https://farm8.staticflickr.com/7788/18388023062_1803b02299_k_d.jpg"
	},
	backgroundOpacity: {
		type: Number,
		max: 1,
		min: 0,
		default: 0.6
	},
	usertoken: String,
	needsMigration: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('userModel', userSchema);
