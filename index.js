const mysql = require('mysql');

const db = mysql.createConnection({
  host: "127.0.0.1",
  port: 3310,
  user: "root",
  password: "123456",
  database: "wotlkcharacters"
});

db.connect(err => {
  if (err) { return res.sendStatus(400).send(err) };
  console.log('Connected to DB!');
});

const getCheevos = 'SELECT * FROM character_achievement WHERE guid=4501;';
db.query(getCheevos, (err, data, fields) => {
  if (err) console.error(err);
  console.log('DATA ', data);
});
