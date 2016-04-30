var fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
var expressBrute = require('express-brute');

var config = JSON.parse(fs.readFileSync('config.json', 'UTF-8'));
var transporter = nodemailer.createTransport(config.mail.transport);

var con = mysql.createConnection(config.db);
con.connect();

var bruteStore = new expressBrute.MemoryStore();
var bruteProtect = new expressBrute(bruteStore, {
    freeRetries: 2,
    minWait: 30*60*1000,
    maxWait: 60*60*1000
});

var app = express();
app.use(bodyParser.json());

app.get('/v1/course', function(req, res) {
    var courses = [];

    con.query('SELECT c.id, c.name, COUNT(*) AS count FROM course AS c LEFT JOIN exam AS e ON c.id = e.courseID GROUP BY c.id, c.name', function(err, rows, fields) {
	if (err)
	    return res.status(500).end();

	rows.forEach(function(row) {
	    courses.push({
		id: row.id,
		name: row.name,
		count: row.count
	    });
	});

	res
	    .set('Content-Type', 'text/json')
	    .send(JSON.stringify(courses))
	    .status(200)
	    .end();
    });
});

app.get('/v1/course/:id', function(req, res) {
    var id = req.params.id;

    // verify that id is actually a positive integer
    if (!id.match(/[1-9][0-9]*/))
	res.status(400).end();

    con.query('SELECT id, name FROM course WHERE id = ?', [id], function(err, rows, fields) {
	if (err)
	    return res.status(500).end();

	if (!rows || !(rows.length > 0))
	    return res.status(404).end();

	var course = {
	    id: rows[0].id,
	    name: rows[0].name,
	    documents: []
	};

	con.query('SELECT e.id, t.name, date, l.name '
		+ 'FROM exam AS e '
		+ 'JOIN type AS t ON t.id = e.typeID '
		+ 'JOIN lecturer AS l ON l.id = e.lecturerID '
		+ 'WHERE e.courseID = ?', [id], function(err, rows, fields) {
	    if (err)
		return res.status(500).end();

	    rows.forEach(function(row) {
		course.documents.push({
		    id: row.id,
		    type: row.type,
		    date: row.date,
		    lecturer: row.lecturer
		});
	    });

	    res
		.set('Content-Type', 'text/json')
		.send(JSON.stringify(course))
		.status(200)
		.end();
	});
    });
});

app.post('/v1/order', bruteProtect.prevent, function(req, res) {
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

    res.status(201).end();
});

app.listen(config.port, function() {
    console.log('Magic happens on port ' + config.port);
});
