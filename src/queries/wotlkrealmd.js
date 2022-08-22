const mysql = require('mysql2/promise');

const { error } = require('./helpers');

const getAccounts = async () => {
  let accounts, wotlkrealmd;

  try {
    wotlkrealmd = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3310,
      user: "root",
      password: "123456",
      database: "wotlkrealmd"
    });
    console.log('Connected to wotlkrealmd!');
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err); 
  }

  try {
    const accountQuery = `SELECT id FROM account WHERE username NOT LIKE '%RNDBOT%'`;
    let [rows] = await wotlkrealmd.execute(accountQuery);
    accounts = rows;
    console.log('Account data fetched!')
  } catch (err) {
    await error(err);
  }

  try {
    await wotlkrealmd.end();
    console.log('Disconnected from wotlkrealmd!')
  } catch (err) {
    await error(err);
  }

  return accounts;
}

module.exports = {
  getAccounts: getAccounts
};
