//**** dependencies ****//
const express = require('express');
const app = express();
const hb = require('express-handlebars');

// an object that holds the http status codes
const statusCodes = [
  {code: 200, def: "OK"},
  {code: 403, def: "Forbidden"},
  {code: 404, def: "Not Found"},
  {code: 500, def: "Internal Server Error"},
  {code: 504, def: "Gateway Timeout"}
];

app.engine('handlebars', hb({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//**** routes ****//
app.get('/', function(req, res) {
  // randomly select an HTTP status code and display it to the user
  var index = Math.floor(Math.random() * statusCodes.length);
  var codeObj = statusCodes[index];
  // randomly pick four answers to display as multiple choice
  // make sure it includes the correct answer
  var answers = [];
  while(answers.length < 4) {
    var index = Math.floor(Math.random() * statusCodes.length);
    var nextChoice = statusCodes[index];
    if (!answers.includes(nextChoice)) {
      answers.push(nextChoice);
      console.log(nextChoice);
    }
  }
  res.render('home', {code: codeObj.code, choices: answers});
})

app.listen(3000, function(req, res) {
  console.log("listening on port 3000!");
})
