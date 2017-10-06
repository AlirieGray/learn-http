//**** dependencies ****//
const express = require('express');
const app = express();
const hb = require('express-handlebars');
const bodyParser = require('body-parser');

//**** middleware ****//
app.use(bodyParser.urlencoded({ extended: true }));

// an object that holds the http status codes
const statusCodes = [
  {code: 100, def: "Continue"},
  {code: 200, def: "OK"},
  {code: 403, def: "Forbidden"},
  {code: 404, def: "Not Found"},
  {code: 401, def: "Unauthorized"},
  {code: 423, def: "Locked"},
  {code: 500, def: "Internal Server Error"},
  {code: 504, def: "Gateway Timeout"},
  {code: 511, def: "Network Authentication Required"}
];

app.engine('handlebars', hb({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

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

  res.render('home', {correctCode: correct.code, choices: answers});
});

app.post('/', function(req, res) {
  // check if answer is correct
  var answer;
  if (req.body.userAnswer == req.body.correctAnswer) {
    answer = "Correct!"
  } else {
    answer = "Incorrect! The correct answer was: " + req.body.correctDef;
  }
  // then get new question and display it to the user
  var correct = getCorrect();
  var answers = getChoices(correct);
  res.render('home', {correctCode: correct.code, correctDef: correct.def, choices: answers, isCorrect: answer})
});

app.listen(3000, function(req, res) {
  console.log("listening on port 3000!");
});
