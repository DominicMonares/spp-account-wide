const mysql = require('mysql2/promise');

const { error } = require('../helpers');

const getCharacters = async (accounts, wotlkcharacters) => {
  let characters;

  try {
    const accountValues = '"' + accounts.join('", "') + '"';
    const accountQuery = `SELECT guid, account, race FROM characters WHERE account IN (${accountValues})`;
    let [rows] = await wotlkcharacters.execute(accountQuery);
    characters = rows;
    console.log('Character data fetched...')
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err);
  }

  return characters;
}

const getAchievements = async (characters) => {
  // let achievements;

  // try {
  //   const characterValues = '"' + accounts.join('", "') + '"';
  //   const accountQuery = `SELECT guid, account FROM character_achievement WHERE account IN (${characterValues})`;
  //   let [rows] = await wotlkcharacters.execute(accountQuery);
  //   characters = rows;
  //   console.log('Achievement data fetched...')
  // } catch (err) {
  //   // native error msg printing after error func for some reason, revisit
  //   await error(err);
  // }

  // return characters;
}

module.exports = {
  getCharacters: getCharacters,
  getAchievements: getAchievements
};
