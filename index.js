/* TODO: fix style
 * TODO: user authentication **
 * TODO: display detail property of statusCode obj
 *   - on Hover? when correct answer displayed?
*/

//**** dependencies ****//
const express = require('express');
const app = express();
const hb = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

//**** middleware ****//
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// user database model
var User = require('./user-model');

// check that a user is logged in
var checkAuth = function (req, res, next) {
  console.log("Checking authentication");
  // make sure the user has a JWT cookie
  if (typeof req.cookies.nToken === 'undefined' || req.cookies.nToken === null) {
    req.user = null;
    console.log("no user");
  } else {
    // if the user has a JWT cookie, decode it and set the user
    var token = req.cookies.nToken;
    var decodedToken = jwt.decode(token, { complete: true }) || {};
    req.user = decodedToken.payload;
    console.log(req.user);
  }
  // console.log(req.user);
  next();
}
app.use(checkAuth);

/***** set up mongoose *****/
mongoose.promise = global.promise;
mongoose.connect('mongodb://localhost/learn');

// set up handlebars
app.engine('handlebars', hb({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// an array that holds the http status codes as JSON objects
const statusCodes = require("./statusCodes.json");

// randomly select an HTTP status code object and return it
var getCorrect = () => {
  var index = Math.floor(Math.random() * statusCodes.length);
  return statusCodes[index];
}

var shuffle = (arr) => {
  // go through each element
  for (var i = arr.length - 1; i > 0; i--) {
    // get a random index in the range
    var j = Math.floor(Math.random() * (i + 1));
    // swap the element at that index with the current element
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

// returns an array of four HTTP status code objects that
// includes the correct answer (passed in as an argument)
var getChoices = (correct) => {
  // randomly pick four answers to display as multiple choice
  // make sure it includes the correct answer
  var answers = [];
  answers.push(correct);
  while(answers.length < 4) {
    var index = Math.floor(Math.random() * statusCodes.length);
    var nextChoice = statusCodes[index];
    if (!answers.includes(nextChoice)) {
      answers.push(nextChoice);
    }
  }
  return shuffle(answers);
}

//**** routes ****//
app.get('/', function(req, res) {
  var correct = getCorrect();
  var answers = getChoices(correct);

  res.render('home', {correctCode: correct.code, choices: answers, currentUser: req.user});
});

app.get('/sign-up', function(req, res) {
  res.render('sign-up');
});

app.post('/', function(req, res) {
  // check if answer is correct
  var answerText;
  var correctAnswer = req.body.correctAnswer;
  if (req.body.userAnswer == correctAnswer) {
    answerText = "Correct!"
  } else {
    var correctDef = statusCodes.filter(function (statusObj) {
      if (statusObj.code == correctAnswer) {
        return statusObj;
      }
    })
    correctDef = correctDef[0].def;
    answerText = "Incorrect! The correct answer was: " + correctDef;
  }
  // then get new question and display it to the user
  var correct = getCorrect();
  var answers = getChoices(correct);
  res.render('home', {correctCode: correct.code, choices: answers, isCorrect: answerText})
});

// authentication controller
require('./auth.js')(app);

app.listen(3000, function(req, res) {
  console.log("listening on port 3000!");
});
