const mysql = require('mysql');

const wotlkcharacters = mysql.createConnection({
  host: "127.0.0.1",
  port: 3310,
  user: "root",
  password: "123456",
  database: "wotlkcharacters"
});

wotlkcharacters.connect(err => {
  if (err) console.error(err);
  console.log('Connected to wotlkcharacters!');
});

// const charAchieves = `
//   INSERT INTO character_achievement (guid, achievement, date)
//   VALUES (4501, 9, 1660987033); 
// `;

// wotlkcharacters.query(charAchieves, (err, data, fields) => {
//   if (err) console.error(err);
//   console.log('DATA ', data);
// });

wotlkcharacters.end();
