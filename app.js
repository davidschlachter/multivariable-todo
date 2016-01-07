
"use strict";

require('cache-require-paths');
var express = require('express'),
	path = require('path'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	compression = require('compression'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	session = require('express-session'),
	MongoStore = require('connect-mongo')(session),
	FacebookStrategy = require('passport-facebook').Strategy,
	User = require('./models/userModel'),
	ToDo = require('./models/todoModel'),
	minify = require('express-minify'),
	bodyParser = require('body-parser');

var routes = require('./routes/index');
var mongooseconfig = require('./config/mongoose');
var oaconfig = require('./config/oauth.js');

mongoose.connect("mongodb://127.0.0.1:27017/multitodo", mongooseconfig.options);
var db = mongoose.connection;
db.on('error', function (err) {
	console.log('Connection error to MongoDB database ', err);
});
db.once('open', function () {
	console.log('Connected to the MongoDB database.');
});

// serialize and deserialize
passport.serializeUser(function (user, done) {
	done(null, user);
});
passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

// config
passport.use(new FacebookStrategy({
		clientID: oaconfig.facebook.clientID,
		clientSecret: oaconfig.facebook.clientSecret,
		callbackURL: oaconfig.facebook.callbackURL,
		enableProof: true,
		passReqToCallback: true
	},
	function (req, accessToken, refreshToken, profile, done) {
		User.findOne({
			oauthID: profile.id,
			authProvider: "Facebook"
		}, function (err, user) {
			if (err) {
				console.log(err);
			}
			if (!err && user != null) {
				done(null, user);
			} else {
				var user = new User({
					oauthID: profile.id,
					authProvider: "Facebook",
					displayName: profile.displayName,
					needsMigration: true
				});
				user.save(function (err) {
					if (err) {
						console.log(err);
					} else {
						console.log("Added new user", profile.displayName);
						done(null, user);
					};
				});
			};
		});
	}
));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(compression());
app.use(minify({cache: __dirname + '/cache'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser(oaconfig.passportsecret));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(session({
	secret: oaconfig.passportsecret,
	cookie: {maxAge: 86400 * 180 * 1000}, // Session cookie lasts six months
	store: new MongoStore({
		mongooseConnection: db,
		touchAfter: 8 * 3600 // Don't update session entry more than once in 8 hrs
	}),
	resave: false, // Don't save session if unmodified
	saveUninitialized: false // Don't create session until something stored
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
