var express = require('express');


var birthdayController = require('./controllers/birthdayController');

var app = express(); 

//template engine set up
app.set('view engine', 'ejs');

//static files
app.use(express.static('./public'));

//fire controllers
birthdayController(app);

//listen to port 
app.listen(3000);
console.log('Listening to port 3000');


