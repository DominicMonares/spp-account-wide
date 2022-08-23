const mysql = require('mysql2/promise');

const { error } = require('../helpers');

const getCharacters = async (accounts, wotlkcharacters) => {
  let characters;

  try {
    const accountValues = '"' + accounts.join('", "') + '"';
    const charactersQuery = `SELECT guid, account, race FROM characters WHERE account IN (${accountValues})`;
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
    let [rows] = await wotlkcharacters.execute(achievementsQuery);
    achievements = rows;
    console.log('Achievement data fetched...');
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err);
  }

  return achievements;
}

module.exports = {
  getCharacters: getCharacters,
  getAchievements: getAchievements
};
