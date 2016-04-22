var fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');

var config = JSON.parse(fs.readFileSync('config.json', 'UTF-8'));

//var con = mysql.createConnection(config.db);
//con.connect();
//
//connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
//    if (err)
//	throw err;
//
//    console.log('The solution is: ', rows[0].solution);
//});
//
//con.end();

var app = express();
app.use(bodyParser.json());

app.get('/v1/course', function(req, res) {
    //TODO: retrieve courses from db
    var courses = [
	{
	    id: 512,
	    name: "Example Course",
	    count: 1
	}
    ];

    res.set('Content-Type', 'text/json')
	.send(JSON.stringify(courses))
	.status(200)
	.end();
});

app.get('/v1/course/:id', function(req, res) {
    var id = req.params.id;

    //TODO: retrieve course from db

    var course = {
	id: id,
	name: "Example Course",
	documents: [
	    {
		id: 111,
		type: "Klausur",
		date: "2000-03-21",
		lecturer: "Example Lecturer"
	    }
	]
    };

    if (course)
	res
	    .set('Content-Type', 'text/json')
	    .send(JSON.stringify(course))
	    .status(200)
	    .end();
    else
	res
	    .status(404)
	    .end();
});

app.post('/v1/order', function(req, res) {
    console.log(req.body);

    //TODO: validate body
    //TODO: send mail

    res
	.status(201)
	.end();
});

app.listen(config.port);
console.log('Magic happens on port ' + config.port);
