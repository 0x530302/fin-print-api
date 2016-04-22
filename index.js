var fs = require('fs');
var mysql = require("mysql");

var config = JSON.parse(fs.readFileSync('config.json', 'UTF-8'));

var con = mysql.createConnection(config.db);

con.connect();

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
    if (err)
	throw err;

    console.log('The solution is: ', rows[0].solution);
});

con.end();
