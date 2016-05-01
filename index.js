var fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var validator = require('validator');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
var expressBrute = require('express-brute');

var config = JSON.parse(fs.readFileSync('config.json', 'UTF-8'));
var transporter = nodemailer.createTransport(config.mail.transport);

var con = mysql.createConnection(config.db);
con.connect();

var bruteStore = new expressBrute.MemoryStore();
var bruteProtect = new expressBrute(bruteStore, {
    freeRetries: 1,
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

app.get('/v1/course/:id/:type', function(req, res) {
    var id = req.params.id;
    var type = req.params.type;

    // verify that id is actually a positive integer
    if (!validator.isInt(id))
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

	con.query('SELECT e.id, t.name as type, e.date, l.name as lecturer '
		+ 'FROM exam AS e '
		+ 'JOIN type AS t ON t.id = e.typeID '
		+ 'JOIN lecturer AS l ON l.id = e.lecturerID '
		+ 'WHERE e.courseID = ?', [id], function(err, rows, fields) {
	    if (err)
		return res.status(500).end();

	    rows.forEach(function(row) {
		if (type && type == row.type) {
		    course.documents.push({
			id: row.id,
			type: row.type,
			date: row.date,
			lecturer: row.lecturer
		    });
		}
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
    if (!validator.isEmail(req.body.mail)
	|| !Array.isArray(req.body.documents))
	res.status(400).end();

    req.body.documents.forEach(function(id) {
        if ((!isNaN(id) && parseInt(Number(id)) == id && !isNaN(parseInt(id, 10))) === false)
	    if (!validator.isInt(id))
		res.status(400).end();
    });

    con.query('SELECT e.id, t.name as type, e.date, l.name as lecturer '
	    + 'FROM exam AS e '
	    + 'JOIN type AS t ON t.id = e.typeID '
	    + 'JOIN lecturer AS l ON l.id = e.lecturerID '
	    + 'WHERE e.id IN (?)', [req.body.documents], function(err, rows, fields) {
	if (err)
	    return res.status(500).end();

	transporter.sendMail({
	    from: config.mail.sender,
	    replyTo: req.body.mail,
	    to: config.mail.recipient,
	    subject: 'Online-Bestellung von "' + req.body.name + '"',
	    text: rows.map(function(row) {
		return ' * ' + [
		    row.id,
		    row.type,
		    row.date,
		    row.lecturer
		].join(' ');
	    }).join("\n")
	}, function(err, info) {
	    if (err)
		return res.status(500).end();

	    console.log('Message sent: ' + info.response);
	});

	res.status(201).end();
    });
});

app.listen(config.port, function() {
    console.log('Magic happens on port ' + config.port);
});
