const mysql = require('mysql2/promise');

const { dbCredentials } = require('../config');

let wotlkmangos;

const wotlkmangosConnect = () => {
  dbCredentials.database = 'wotlkmangos';
  return mysql.createConnection(dbCredentials)
    .then(res => {
      console.log('Connected to wotlkmangos...');
      wotlkmangos = res;
    })
    .catch(err => { throw err });
}


/* Credit Transfer */

const getRewards = () => {
  const sql = 'SELECT * FROM achievement_reward';
  return wotlkmangos.execute(sql)
    .then(rewards => {
      console.log('Achievement reward data fetched...');
      return rewards[0];
    })
    .catch(err => { throw err });
}


/* Progress Transfer */

const getQuestZones = (chars) => {
  const charValues = '"' + chars.join('", "') + '"';
  const sql = `
    SELECT entry, ZoneOrSort FROM quest_template
    WHERE entry IN (${charValues})
  `;

  return wotlkmangos.query(sql, [chars])
    .then(achieves => {
      console.log('Quest zone data fetched...');
      return achieves[0];
    })
    .catch(err => { throw err });
}

const wotlkmangosClose = () => {
  return wotlkmangos.end()
    .then(console.log('Disconnected from wotlkmangos...'))
    .catch(err => { throw err });
}

module.exports = {
  wotlkmangosConnect: wotlkmangosConnect,
  getRewards: getRewards,
  getQuestZones: getQuestZones,
  wotlkmangosClose: wotlkmangosClose
};
