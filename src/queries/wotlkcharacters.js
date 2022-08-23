const mysql = require('mysql2/promise');

const { dbCredentials } = require('../config');
const { error } = require('./helpers');

const getCharacters = async (accounts) => {
  let characters, wotlkcharacters;
  dbCredentials.database = 'wotlkcharacters';

  try {
    wotlkcharacters = await mysql.createConnection(dbCredentials);
    console.log('Connected to wotlkcharacters...');
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err); 
  }

  try {
    const accountValues = '"' + accounts.join('", "') + '"';
    const accountQuery = `SELECT guid, account FROM characters WHERE account IN (${accountValues})`;
    let [rows] = await wotlkcharacters.execute(accountQuery);
    characters = rows;
    console.log('Character data fetched...')
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err);
  }

  try {
    await wotlkcharacters.end();
    console.log('Disconnected from wotlkcharacters...')
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err);
  }

  return characters;
}

module.exports = {
  getCharacters: getCharacters
};
