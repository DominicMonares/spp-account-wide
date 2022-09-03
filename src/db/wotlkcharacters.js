const mysql = require('mysql2/promise');

const { dbCredentials } = require('../config');

const wotlkcharactersConnect = async () => {
  dbCredentials.database = 'wotlkcharacters';
  return mysql.createConnection(dbCredentials)
    .then(res => {
      console.log('Connected to wotlkcharacters...');
      return res;
    })
    .catch(async err => { throw err });
}

const getCharacters = (accounts, wotlkcharacters) => {
  const accountVals = '"' + accounts.join('", "') + '"';
  const sql = `
    SELECT guid, name, race, gender, knownTitles FROM characters 
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
    SELECT * FROM character_achievement 
    WHERE guid IN (${charValues})
  `;
  
  return wotlkcharacters.query(sql, [chars])
    .then(achieves => {
      console.log('Achievement data fetched...');
      return achieves[0];
    })
    .catch(err => { throw err });
}

const addAchievements = (achieves, wotlkcharacters) => {
  const sql = 'INSERT IGNORE INTO character_achievement (guid, achievement, date) VALUES ?';
  return wotlkcharacters.query(sql, [achieves])
    .then(res => res[0])
    .catch(err => { throw err });
}

const addRewardTitles = (char, titles, wotlkcharacters) => {
  const sql = `UPDATE characters SET knownTitles = '${titles}' WHERE guid = ${char}`;
  return wotlkcharacters.query(sql)
    .then(res => res[0])
    .catch(err => { throw err });
}

const getRewardItems = (items, wotlkcharacters) => {
  const itemValues = '"' + items.join('", "') + '"';
  // console.log('ITEMS ', itemValues)
  const sql = `SELECT guid, itemEntry FROM item_instance WHERE itemEntry IN (${itemValues})`;
  return wotlkcharacters.query(sql)
    .then(res => {
      console.log('Reward item data fetched...');
      return res[0];
    })
    .catch(err => { throw err });
}

const getMailIDs = (wotlkcharacters) => {
  const sql = 'SELECT id FROM mail';
  return wotlkcharacters.query(sql)
    .then(res => {
      console.log('Mail data fetched...');
      return res[0];
    })
    .catch(err => { throw err });
}

const addRewardMail = (mail, wotlkcharacters) => {
  const fields = '(id, messageType, stationery, mailTemplateId, sender, receiver, subject, body, has_items, expire_time, deliver_time, money, cod, checked)';
  const sql = `INSERT IGNORE INTO mail ${fields} VALUES ?`;
  return wotlkcharacters.query(sql, [mail])
    .then(res => res[0])
    .catch(err => { throw err });
}

const addRewardItems = (items, wotlkcharacters) => {
  const sql = 'INSERT IGNORE INTO mail_items (mail_id, item_guid, item_template, receiver) VALUES ?';
  return wotlkcharacters.query(sql, [items])
    .then(res => res[0])
    .catch(err => { throw err });
}

module.exports = {
  wotlkcharactersConnect: wotlkcharactersConnect,
  getCharacters: getCharacters,
  getAchievements: getAchievements,
  addAchievements: addAchievements,
  addRewardTitles: addRewardTitles,
  getRewardItems: getRewardItems,
  getMailIDs: getMailIDs,
  addRewardMail: addRewardMail,
  addRewardItems: addRewardItems
};
