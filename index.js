var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');

var port = process.env.PORT || 8080;

mongoose.connect(
  'mongodb+srv://vabshere:_UTR6eVzSWL7e_b@cluster0-3tkqs.mongodb.net/test?retryWrites=true&w=majority',
  {
    useUnifiedTopology: true,
    useNewUrlParser: true
  }
);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public'));

require('./routes')(app);

app.listen(port);

console.log('Using ' + port);

exports = module.exports = app;
