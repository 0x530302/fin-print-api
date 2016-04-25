var fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');

var config = JSON.parse(fs.readFileSync('config.json', 'UTF-8'));
var transporter = nodemailer.createTransport(config.mail.transport);

//var con = mysql.createConnection(config.db);
//con.connect();
//
//con.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
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

    con.query('SELECT c.id, c.name, COUNT(*) AS count FROM course AS c LEFT JOIN exam AS e ON c.id = e.courseID GROUP BY c.id, c.name', function(err, rows, fields) {
	if (err)
	    return console.log(err);

	console.log(rows);
    });

    res
	.set('Content-Type', 'text/json')
	.send(JSON.stringify(courses))
	.status(200)
	.end();
});

app.get('/v1/course/:id', function(req, res) {
    var id = req.params.id;

    //TODO: verify that id is an actual integer
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

    con.query('SELECT id, name FROM course WHERE id = ?', [id], function(err, rows, fields) {
	if (err)
	    return console.log(err);

	con.query('SELECT e.id, t.name, date, l.name '
		+ 'FROM exam AS e '
		+ 'JOIN type AS t ON t.id = e.typeID '
		+ 'JOIN lecturer AS l ON l.id = e.lecturerID '
		+ 'WHERE e.courseID = ?', [id], function(err, rows, fields) {
	    if (err)
		return console.log(err);

	    console.log(rows);
	});

	console.log(rows);
    });

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

    transporter.sendMail({
	from: config.mail.sender,
	to: config.mail.recipient,
	subject: '',
	text: ''
    }, function(err, info) {
	if (err)
	    return console.log(err);

	console.log('Message sent: ' + info.response);
    });

    res
	.status(201)
	.end();
});

app.listen(config.port, function() {
    console.log('Magic happens on port ' + config.port);
});
