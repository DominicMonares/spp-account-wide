const mysql = require('mysql2/promise');

const { dbCredentials } = require('../config');

let wotlkcharacters;

const wotlkcharactersConnect = () => {
  dbCredentials.database = 'wotlkcharacters';
  return mysql.createConnection(dbCredentials)
    .then(res => {
      console.log('Connected to wotlkcharacters...');
      wotlkcharacters = res;
    })
    .catch(async err => { throw err });
}


/* Credit Transfer */

const getCharacters = (accounts) => {
  const accountVals = '"' + accounts.join('", "') + '"';
  const sql = `
    SELECT guid, name, race, gender, totalKills, knownTitles FROM characters 
    WHERE account IN (${accountVals})
  `;

  return wotlkcharacters.execute(sql)
    .then(chars => {
      console.log('Character data fetched...');
      return chars[0];
    })
    .catch(err => { throw err });
}

const getAchievements = (chars) => {
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

const addAchievements = (achieves) => {
  const sql = 'INSERT IGNORE INTO character_achievement VALUES ?';
  return wotlkcharacters.query(sql, [achieves])
    .then(console.log('Achievement credit successfully transferred!'))
    .catch(err => { throw err });
}

const addRewardTitles = (charTitles) => {
  let sql = '';
  for (const char in charTitles) {
    sql += `UPDATE characters SET knownTitles='${charTitles[char]}' WHERE guid=${char};`
  }

  return wotlkcharacters.query(sql)
    .then(console.log(`Achievement title rewards successfully transferred!`))
    .catch(err => { throw err });
}

const getMailIDs = () => {
  const sql = 'SELECT id FROM mail';
  return wotlkcharacters.query(sql)
    .then(mail => {
      console.log('Mail data fetched...');
      return mail[0];
    })
    .catch(err => { throw err });
}

const addRewardMail = (mail) => {
  const sql = 'INSERT IGNORE INTO mail VALUES ?';
  return wotlkcharacters.query(sql, [mail])
    .then(console.log('Achievement mail successfully transferred!'))
    .catch(err => { throw err });
}

const addRewardItems = (items) => {
  const sql = 'INSERT IGNORE INTO mail_items VALUES ?';
  return wotlkcharacters.query(sql, [items])
    .then(console.log('Achievement mail items successfully transferred!'))
    .catch(err => { throw err });
}

const getItemGuid = () => {
  const sql = 'SELECT guid FROM item_instance ORDER BY guid DESC LIMIT 1';
  return wotlkcharacters.query(sql)
    .then(item => {
      console.log('Item guid data fetched...');
      return item[0];
    })
    .catch(err => { throw err });
}

const addItemInstances = (instances) => {
  const sql = 'INSERT IGNORE INTO item_instance VALUES ?';
  return wotlkcharacters.query(sql, [instances])
    .then(console.log('Item instances successfully transferred!'))
    .catch(err => { throw err });
}


/* Progress Transfer */

const progressTableExists = () => {
  const sql = 'SHOW TABLES LIKE "character_achievement_shared_progress"';
  return wotlkcharacters.query(sql)
    .then(res => {
      console.log('Progress table does not exist!')
      return res[0].length ? true : false;
    })
    .catch(err => { throw err });
}

const createProgressTable = () => {
  const sql = `
    CREATE TABLE character_achievement_shared_progress (
      achievement INT NOT NULL,
      progress INT DEFAULT 0,
      PRIMARY KEY (achievement)
    )
  `;

  return wotlkcharacters.query(sql)
    .then(console.log('Table character_achievement_shared_progress successfully created!'))
    .catch(err => { throw err });
}

const getSharedProgress = () => {
  const sql = 'SELECT * FROM character_achievement_shared_progress';
  return wotlkcharacters.query(sql)
    .then(progress => {
      console.log('Previous achievement progress fetched...');
      return progress[0];
    })
    .catch(err => { throw err });
}

const getCurrentProgress = (criteria) => {
  const criteriaVals = '(' + criteria.map(c => c.join(', ')).join('), (') + ')';
  const sql = `
    SELECT * FROM character_achievement_progress
    WHERE (guid, criteria) IN (${criteriaVals})
  `;

  return wotlkcharacters.query(sql)
    .then(progress => {
      console.log('Current achievement progress fetched...');
      return progress[0];
    })
    .catch(err => { throw err });
}

const getQuests = (chars) => {
  const questVals = '(' + chars.map(c => c.join(', ')).join('), (') + ')';
  const sql = `
    SELECT guid, quest, status, timer FROM character_queststatus
    WHERE (guid, status) IN (${questVals})
  `
  return wotlkcharacters.query(sql)
    .then(quests => {
      console.log('Completed quests fetched...');
      return quests[0];
    })
    .catch(err => { throw err });
}

const addSharedProgress = (progress) => {
  const sql = `
    INSERT INTO character_achievement_shared_progress VALUES ?
      ON DUPLICATE KEY UPDATE progress=VALUES(progress)
  `;

  return wotlkcharacters.query(sql, [progress])
    .then(console.log('Shared progress successfully updated!'))
    .catch(err => { throw err });
}

const addNewProgress = (progress) => {
  const sql = `
    INSERT INTO character_achievement_progress VALUES ?
      ON DUPLICATE KEY UPDATE counter=VALUES(counter), date=VALUES(date)
  `;

  return wotlkcharacters.query(sql, [progress])
    .then(console.log('Progress successfully updated for all characters!'))
    .catch(err => { throw err });
}

const addHonorKills = (chars) => {
  let sql = '';
  chars.forEach(c => {
    sql += `UPDATE characters SET totalKills=${c[1]} WHERE guid=${c[0]};`
  });

  return wotlkcharacters.query(sql)
    .then(console.log('Honorable kills successfully updated!'))
    .catch(err => { throw err });
}

const wotlkcharactersClose = () => {
  return wotlkcharacters.end()
    .then(console.log('Disconnected from wotlkmangos...'))
    .catch(err => { throw err });
}

module.exports = {
  wotlkcharactersConnect: wotlkcharactersConnect,
  getCharacters: getCharacters,
  getAchievements: getAchievements,
  addAchievements: addAchievements,
  addRewardTitles: addRewardTitles,
  getMailIDs: getMailIDs,
  addRewardMail: addRewardMail,
  addRewardItems: addRewardItems,
  getItemGuid: getItemGuid,
  addItemInstances: addItemInstances,
  progressTableExists: progressTableExists,
  createProgressTable: createProgressTable,
  getSharedProgress: getSharedProgress,
  getCurrentProgress: getCurrentProgress,
  getQuests: getQuests,
  addSharedProgress: addSharedProgress,
  addNewProgress: addNewProgress,
  addHonorKills: addHonorKills,
  wotlkcharactersClose: wotlkcharactersClose
};
