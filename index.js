const mysql = require('mysql');
const nexe = require('nexe');

// get all non-bot accounts
// go through each account and:
  // get each character guid
  // create object to track achievements on account
  // if timestamp of current achievement is older, replace in obj
  // once every character's achievements have been added:
    // go through every player again and for each player:
      // go through achievements and check to see if current character has it
      // add it if not

// NEED TO ACCOUNT FOR FACTION SPECIFIC ACHIEVEMENTS

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

// const charAchieves = 'SELECT * FROM character_achievement WHERE guid=10001;';
// const charAchieves = `
//   INSERT INTO character_achievement (guid, achievement, date)
//   VALUES (4501, 9, 1660987033); 
// `;
// wotlkcharacters.query(charAchieves, (err, data, fields) => {
//   if (err) console.error(err);
//   console.log('DATA ', data);
// });

console.log('NEXE ', nexe);
process.exit(1);

wotlkcharacters.end();

// bat path
// Server/Tools/spp-achievements.exe
