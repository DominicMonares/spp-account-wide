const mysql = require('mysql2/promise');

const getCharacters = (accounts, wotlkcharacters) => {
  const accountValues = '"' + accounts.join('", "') + '"';
  const charactersQuery = `SELECT guid, account, race, gender FROM characters WHERE account IN (${accountValues})`;
  return wotlkcharacters.execute(charactersQuery)
    .then(res => {
      console.log('Character data fetched...');
      return res[0];
    })
    .catch(err => { throw err });
}

const getAchievements = (characters, wotlkcharacters) => {
  const characterValues = '"' + characters.join('", "') + '"';
  const achievementsQuery = `SELECT achievement, date FROM character_achievement WHERE guid IN (${characterValues})`;
  return wotlkcharacters.query(achievementsQuery, [characters])
    .then(res => {
      console.log('Achievement data fetched...');
      return res[0];
    })
    .catch(err => { throw err });
}

const addAchievements = async (achievements, wotlkcharacters) => {
  const achievementsQuery = 'INSERT IGNORE INTO character_achievement (guid, achievement, date) VALUES ?';
  return wotlkcharacters.query(achievementsQuery, [achievements])
    .then(res => {
      console.log('Achievements successfully transferred!');
      return res[0];
    })
    .catch(err => { throw err });
}

module.exports = {
  getCharacters: getCharacters,
  getAchievements: getAchievements,
  addAchievements: addAchievements
};
