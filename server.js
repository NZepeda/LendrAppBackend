var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport	= require('passport');
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/user'); // get the mongoose model
var port        = process.env.PORT || 8080;
var jwt         = require('jwt-simple');

// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());

// demo Route (GET http://localhost:8080)
app.get('/', function(req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});

mongoose.connect(config.database);

// pass passport for configuration
require('./config/passport')(passport);

// bundle our routes
var apiRoutes = express.Router();

// create a new user account (POST http://localhost:8080/api/signup)
apiRoutes.post('/register', function(req, res) {

  if (!req.body.firstName || !req.body.lastName || !req.body.email ||!req.body.password) {
    res.json({success: false, msg: 'Please pass name and password.'});
  }
  else {
    var newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password
    });
    User.find({email:newUser.email}, function(err, users){
      if(!err){
        if(users.length > 0){
          // A user was found so don't create another account
          res.json({success: false, msg:'User already exists'});
        }
        else{
          newUser.save(function(error){
            if(!error){
              res.json({success: true, msg:'User successfully created'});
            }
            else{
              res.json({success: false, msg:'Error in creating the user: ' + error});
            }
          });
        }
      }
      else{
        console.log(err);
        res.json({success: false, msg:'There was an error in handling your request: ' + err});
      }
    });
  }
});

// connect the api routes under /api/*
app.use('/api', apiRoutes);

// Start the server
app.listen(port);
console.log('Listening on  http://localhost:' + port);
