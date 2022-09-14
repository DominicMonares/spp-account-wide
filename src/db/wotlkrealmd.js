const mysql = require('mysql2/promise');

const { dbCredentials } = require('../config');

const wotlkrealmdConnect = () => {
  dbCredentials.database = 'wotlkrealmd';
  return mysql.createConnection(dbCredentials)
    .then(res => {
      console.log('Connected to wotlkrealmd...');
      return res;
    })
    .catch(async err => { throw err});
}

const getAccounts = (wotlkrealmd) => {
  const sql = 'SELECT id FROM account WHERE username NOT LIKE "%RNDBOT%;"';
  return wotlkrealmd.execute(sql)
    .then(accounts => {
      console.log('Account data fetched...');
      return accounts[0].map(a => a.id);
    })
    .catch(err => { throw err });
}

module.exports = {
  wotlkrealmdConnect: wotlkrealmdConnect,
  getAccounts: getAccounts
};
