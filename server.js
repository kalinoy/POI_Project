//this is only an example, handling everything is yours responsibilty !
// console.log("bbb");
var express = require('express');
var bodyParser = require('body-parser');
//var squel = require("squel");
//var moment = require('moment');
var path = require('path');

var app = express();
var cors = require('cors');
var jwt=require('jsonwebtoken');
// var DButilsAzure = require('./DButils');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());



// //complete your code here

app.use(express.static(path.join(__dirname, 'dist')));
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname,'dist/index.html'));
});

var users=require('./Server/Users.js');
var points=require('./Server/Points.js')

app.use('/Users',users)
app.use('/Points',points)




var port = 3000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});

