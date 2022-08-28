const mysql = require('mysql2/promise');

const { dbCredentials } = require('../config');

const wotlkcharactersConnect = async () => {
  dbCredentials.database = 'wotlkcharacters';
  return mysql.createConnection(dbCredentials)
    .then(res => {
      console.log('Connected to wotlkcharacters...');
      return res;
    })
    .catch(async err => await error(err));
}

const getCharacters = (accounts, wotlkcharacters) => {
  const accountVals = '"' + accounts.join('", "') + '"';
  const sql = `
    SELECT guid, name, account, race, gender, knownTitles FROM characters 
    WHERE account IN (${accountVals})
  `;
  
  return wotlkcharacters.execute(sql)
    .then(chars => {
      console.log('Character data fetched...');
      return chars[0];
    })
    .catch(err => { throw err });
}

const getAchievements = (chars, wotlkcharacters) => {
  const charValues = '"' + chars.join('", "') + '"';
  const sql = `
    SELECT achievement, date FROM character_achievement 
    WHERE guid IN (${charValues})
  `;
  
  return wotlkcharacters.query(sql, [chars])
    .then(achieves => {
      console.log('Achievement data fetched...');
      return achieves[0];
    })
    .catch(err => { throw err });
}

const addAchievements = (achieves, char, wotlkcharacters) => {
  const sql = 'INSERT IGNORE INTO character_achievement (guid, achievement, date) VALUES ?';
  return wotlkcharacters.query(sql, [achieves])
    .then(res => {
      console.log(`Achievement credit successfully transferred for ${char}!`);
      return res[0];
    })
    .catch(err => { throw err });
}

module.exports = {
  wotlkcharactersConnect: wotlkcharactersConnect,
  getCharacters: getCharacters,
  getAchievements: getAchievements,
  addAchievements: addAchievements
};
