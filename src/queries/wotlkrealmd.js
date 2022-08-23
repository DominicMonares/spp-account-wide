const mysql = require('mysql2/promise');

const { dbCredentials } = require('../config');
const { error } = require('./helpers');

const getAccounts = async () => {
  let accounts, wotlkrealmd;
  dbCredentials.database = 'wotlkrealmd';

  try {
    wotlkrealmd = await mysql.createConnection(dbCredentials);
    console.log('Connected to wotlkrealmd...');
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err); 
  }

  try {
    const accountQuery = `SELECT id FROM account WHERE username NOT LIKE '%RNDBOT%'`;
    let [rows] = await wotlkrealmd.execute(accountQuery);
    accounts = rows;
    console.log('Account data fetched...')
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err);
  }

  try {
    await wotlkrealmd.end();
    console.log('Disconnected from wotlkrealmd...')
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err);
  }

  return accounts;
}

module.exports = {
  getAccounts: getAccounts
};
