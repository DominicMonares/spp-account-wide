var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "mangos",
  password: "mangos",
  database: "wotlkcharacters"
});

module.exports = {
  con: con
}
