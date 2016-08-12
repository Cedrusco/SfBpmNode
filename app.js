/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var path = require('path');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(path.join(__dirname, '/node_modules')));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/client/views')));
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(morgan('dev'));

app.use(cookieParser());
//session enabled to store token data
app.use(session({
    name: 'bpmNodeSession',
    secret: 'bpmNode secret'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api', require('./server/routes'));
app.use('/', require('./server/routes/uiRoutes'));

app.use(function(req, res, next){
    if (path.extname(req.path).length > 0){
        res.status(404).end();
    } else {
        next(null);
    }
});

app.get('/', function(req, res, next){
    res.sendFile(path.join(__dirname, '../client/index.html'));
    //res.render('/index.html');
});

app.use(function(err, req, res, next){
    console.error(err, typeof next);
    console.error(err.stack);
    res.status(err.status || 500).send(err || 'Internal Server Error.');
});

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
