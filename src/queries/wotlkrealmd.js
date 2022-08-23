const mysql = require('mysql2/promise');

const { error } = require('../helpers');

const getAccounts = async (wotlkrealmd) => {
  let accounts;

  try {
    const accountQuery = `SELECT id FROM account WHERE username NOT LIKE '%RNDBOT%'`;
    let [rows] = await wotlkrealmd.execute(accountQuery);
    accounts = rows;
    console.log('Account data fetched...')
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err);
  }

  return accounts;
}

module.exports = {
  getAccounts: getAccounts
};
