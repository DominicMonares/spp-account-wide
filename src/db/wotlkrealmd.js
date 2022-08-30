const mysql = require('mysql2/promise');

const { dbCredentials } = require('../config');

const wotlkrealmdConnect = async () => {
  dbCredentials.database = 'wotlkrealmd';
  return mysql.createConnection(dbCredentials)
    .then(res => {
      console.log('Connected to wotlkrealmd...');
      return res;
    })
    .catch(async err => await error(err));
}

const getAccounts = (wotlkrealmd) => {
  const sql = 'SELECT id, username FROM account WHERE username NOT LIKE "%RNDBOT%"';
  return wotlkrealmd.execute(sql)
    .then(accounts => {
      console.log('Account data fetched...');
      return accounts[0]}
    )
    .catch(err => { throw err });
}

module.exports = {
  wotlkrealmdConnect: wotlkrealmdConnect,
  getAccounts: getAccounts
};
