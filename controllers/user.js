
// Load required packages
var UserModel = require('../models/userModel');

// Send preferences
exports.getPrefs = function (req, res) {
	UserModel.find({
			'oauthID': req.user.oauthID
		})
		.exec(function (err, prefs) {
			// Send any errors returned by the query
			if (err) {
				console.log("getPrefs returned an error: ", err);
				res.send(err);
			} else {
				res.json(prefs);
			}
		});
}

// Update preferences
exports.setPrefs = function (req, res) {
	BkgURL = cleanHTMLEntities(req.body.BkgURL);
	inputOpacity = cleanHTMLEntities(req.body.inputOpacity);
	UserModel.update({
		'oauthID': req.user.oauthID
	}, {
		'backgroundURL': BkgURL,
		'backgroundOpacity': inputOpacity
	}, function (err) {
		// Send any errors returned by the query
		if (err) {
			console.log("Preferences update returned an error", err);
			res.send(err);
		} else {
			res.status(200).send("Preferences successfully updated");
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