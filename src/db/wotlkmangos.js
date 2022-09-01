const mysql = require('mysql2/promise');

const { dbCredentials } = require('../config');

const wotlkmangosConnect = async () => {
  dbCredentials.database = 'wotlkmangos';
  return mysql.createConnection(dbCredentials)
    .then(res => {
      console.log('Connected to wotlkmangos...');
      return res;
    })
    .catch(err => { throw err });
}

const getRewards = (wotlkmangos) => {
  const sql = 'SELECT * FROM achievement_reward';
  return wotlkmangos.execute(sql)
    .then(rewards => {
      console.log('Achievement reward data fetched...');
      return rewards[0]}
    )
    .catch(err => { throw err });
}

module.exports = {
  wotlkmangosConnect: wotlkmangosConnect,
  getRewards: getRewards
};
