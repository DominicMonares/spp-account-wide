const mysql = require('mysql2/promise');

const { dbCredentials } = require('../config');
const { error } = require('./helpers');

const getAccounts = async () => {
  let accounts, wotlkcharacters;
  dbCredentials.database = 'wotlkcharacters';

  try {
    wotlkcharacters = await mysql.createConnection(dbCredentials);
    console.log('Connected to wotlkcharacters!');
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err); 
  }

  try {
    const accountQuery = `SELECT id FROM account WHERE username NOT LIKE '%RNDBOT%'`;
    let [rows] = await wotlkcharacters.execute(accountQuery);
    accounts = rows;
    console.log('Account data fetched!')
  } catch (err) {
    await error(err);
  }

  try {
    await wotlkcharacters.end();
    console.log('Disconnected from wotlkcharacters!')
  } catch (err) {
    await error(err);
  }

  return accounts;
}

module.exports = {
  getAccounts: getAccounts
};
