const mysql = require('mysql2/promise');

const { error } = require('../helpers');

const getCharacters = async (accounts, wotlkcharacters) => {
  let characters;

  try {
    const accountValues = '"' + accounts.join('", "') + '"';
    const charactersQuery = `SELECT guid, account, race, gender FROM characters WHERE account IN (${accountValues})`;
    let [rows] = await wotlkcharacters.execute(charactersQuery);
    characters = rows;
    console.log('Character data fetched...')
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err);
  }

  return characters;
}

const getAchievements = async (characters, wotlkcharacters) => {
  let achievements;

  try {
    const characterValues = '"' + characters.join('", "') + '"';
    const achievementsQuery = `SELECT achievement, date FROM character_achievement WHERE guid IN (${characterValues})`;
    let [rows] = await wotlkcharacters.query(achievementsQuery, [characters]);
    achievements = rows;
    console.log('Achievement data fetched...');
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err);
  }

  return achievements;
}

const addAchievements = async (achievements, wotlkcharacters) => {
  let response;
  
  try {
    const achievementsQuery = `INSERT IGNORE INTO character_achievement (guid, achievement, date) VALUES ?`;
    let res = await wotlkcharacters.query(achievementsQuery, [achievements]);
    response = res;
    console.log('Achievements successfully transferred!');
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err);
  }
  
  return response;
}

module.exports = {
  getCharacters: getCharacters,
  getAchievements: getAchievements,
  addAchievements: addAchievements
};
