const mysql = require('mysql2/promise');

const { dbCredentials } = require('../config');

let wotlkrealmd;

const wotlkrealmdConnect = () => {
  dbCredentials.database = 'wotlkrealmd';
  return mysql.createConnection(dbCredentials)
    .then(res => {
      console.log('Connected to wotlkrealmd...');
      wotlkrealmd = res;
    })
    .catch(async err => { throw err});
}

const getAccounts = () => {
  const sql = 'SELECT id FROM account WHERE username NOT LIKE "%RNDBOT%;"';
  return wotlkrealmd.query(sql)
    .then(accounts => {
      console.log('Account data fetched...');
      return accounts[0].map(a => a.id);
    })
    .catch(err => { throw err });
}

const wotlkrealmClose = () => {
  return wotlkrealmd.end()
    .then(console.log('Disconnected from wotlkrealmd...'))
    .catch(err => { throw err });
}

module.exports = {
  wotlkrealmdConnect: wotlkrealmdConnect,
  getAccounts: getAccounts,
  wotlkrealmClose: wotlkrealmClose
};
