
// Load required packages
var UserModel = require('../models/userModel');

// Send preferences
exports.getPrefs = function (req, res) {
	var auth = getAuth(req);
	UserModel.find(auth)
		.exec(function (err, prefs) {
			// Send any errors returned by the query
			if (err) {
				console.log("getPrefs returned an error: ", err);
				res.send(err);
			} else {
				console.log("Prefs before:", prefs);
				if (prefs[0] == null) { // http://stackoverflow.com/a/2672411/3380815
					prefs[0] = {};
					if (prefs[0].backgroundURL === undefined) prefs[0].backgroundURL = 'https://farm8.staticflickr.com/7788/18388023062_1803b02299_k_d.jpg';
					if (prefs[0].backgroundOpacity === undefined) prefs[0].backgroundOpacity = 0.6;
				}
				console.log("Prefs after:", prefs);
				res.json(prefs);
			}
		});
}

// Update preferences
exports.setPrefs = function (req, res) {
	var auth = getAuth(req);
	BkgURL = cleanHTMLEntities(req.body.BkgURL);
	inputOpacity = cleanHTMLEntities(req.body.inputOpacity);
	UserModel.update(auth, {
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


function getAuth(req) {
	var oauthID, userToken, auth = {};
	if (req.user && req.user.oauthID) {
		auth['oauthID'] = req.user.oauthID;
	} else if (req.cookies && req.cookies.userToken) {
		auth['usertoken'] = req.cookies.userToken;
	} else {
		return undefined;
	}
	return auth;
}
