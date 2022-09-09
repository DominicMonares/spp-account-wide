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

// Credit Transfer

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
  const sql = 'INSERT IGNORE INTO character_achievement VALUES ?';
  return wotlkcharacters.query(sql, [achieves])
    .then(res => res[0])
    .catch(err => { throw err });
}

const addRewardTitles = (char, titles, wotlkcharacters) => {
  const sql = `UPDATE characters SET knownTitles='${titles}' WHERE guid=${char}`;
  return wotlkcharacters.query(sql)
    .then(res => res[0])
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
  const sql = 'INSERT IGNORE INTO mail VALUES ?';
  return wotlkcharacters.query(sql, [mail])
    .then(res => res[0])
    .catch(err => { throw err });
}

const addRewardItems = (items, wotlkcharacters) => {
  const sql = 'INSERT IGNORE INTO mail_items VALUES ?';
  return wotlkcharacters.query(sql, [items])
    .then(res => res[0])
    .catch(err => { throw err });
}

const getItemGuid = (wotlkcharacters) => {
  const sql = 'SELECT guid FROM item_instance ORDER BY guid DESC LIMIT 1';
  return wotlkcharacters.query(sql)
  .then(res => {
    console.log('Item guid data fetched...');
    return res[0];
  })
    .catch(err => { throw err });
}

const addItemInstances = (instances, wotlkcharacters) => {
  const sql = 'INSERT IGNORE INTO item_instance VALUES ?';
  return wotlkcharacters.query(sql, [instances])
    .then(res => res[0])
    .catch(err => { throw err });
}

// Progress Transfer

const progressTableExists = (wotlkcharacters) => {
  const sql = 'SHOW TABLES LIKE "character_achievement_shared_progress"';
  return wotlkcharacters.query(sql)
    .then(res => res[0].length ? true : false)
    .catch(err => { throw err });
}

const createProgressTable = (wotlkcharacters) => {
  const sql = `
    CREATE TABLE character_achievement_shared_progress (
      achievement INT NOT NULL,
      progress INT DEFAULT 0,
      PRIMARY KEY (achievement)
    )
  `;
  return wotlkcharacters.query(sql)
    .then(res => console.log('Table character_achievement_shared_progress successfully created!'))
    .catch(err => { throw err });
}

const getEarnedAchievements = (achieves, wotlkcharacters) => {
  const achieveVals = '(' + achieves.map(a => a.join(', ')).join('), (') + ')';
  const sql = `
    SELECT achievement FROM character_achievement
    WHERE (guid, achievement) IN (${achieveVals})
  `;
  return wotlkcharacters.query(sql)
  .then(res => {
    console.log('Earned progress achievements fetched...');
    return res[0];
  })
  .catch(err => { throw err });
}

const getProgress = (criteria, wotlkcharacters) => {
  const criteriaVals = '(' + criteria.map(c => c.join(', ')).join('), (') + ')';
  const sql = `
    SELECT * FROM character_achievement_progress
    WHERE (guid, criteria) IN (${criteriaVals})
  `;
  return wotlkcharacters.query(sql)
  .then(res => {
    console.log('Achievement progress fetched...');
    return res[0];
  })
  .catch(err => { throw err });
}

const getPreviousProgress = (achieves, wotlkcharacters) => {
  const achieveVals = '"' + achieves.join('", "') + '"';
  const sql = `
    SELECT * FROM character_achievement_shared_progress
    WHERE achievement IN (${achieveVals})
  `;
  return wotlkcharacters.query(sql)
  .then(res => {
    console.log('Previous achievement progress fetched...');
    return res[0];
  })
  .catch(err => { throw err });
}

const addPrevious = (previous, wotlkcharacters) => {
  const sql = `
    INSERT INTO character_achievement_shared_progress VALUES ?
      ON DUPLICATE KEY UPDATE progress=VALUES(progress)
  `;
  return wotlkcharacters.query(sql, [previous])
    .then(res => res[0])
    .catch(err => { throw err });
}

const addProgress = (progress, wotlkcharacters) => {
  const sql = `
    INSERT INTO character_achievement_progress VALUES ?
      ON DUPLICATE KEY UPDATE counter=VALUES(counter), date=VALUES(date)
  `;
  return wotlkcharacters.query(sql, [progress])
    .then(res => res[0])
    .catch(err => { throw err });
}

const addNewAchievements = (achieves, wotlkcharacters) => {
  const sql = 'INSERT IGNORE INTO character_achievement VALUES ?';
  return wotlkcharacters.query(sql, [achieves])
    .then(res => res[0])
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
  getEarnedAchievements: getEarnedAchievements,
  getProgress: getProgress,
  getPreviousProgress: getPreviousProgress,
  addPrevious: addPrevious,
  addProgress: addProgress,
  addNewAchievements: addNewAchievements
};
