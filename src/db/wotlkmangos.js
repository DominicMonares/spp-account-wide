const mysql = require('mysql2/promise');

const { dbCredentials } = require('../config');
const { cutTitles } = require('../data/cutTitles');
const { quoteJoin } = require('../utils');

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


/* Cut Content */

const cutTitlesExist = () => {
  const sql = 'SELECT * FROM achievement_reward WHERE entry=457';
  return wotlkmangos.query(sql)
    .then(res => {
      if (!res[0].length) console.log('Cut title content does not exist!');
      return res[0].length ? true : false;
    })
    .catch(err => { throw err });
}

const addCutTitles = () => {
  const titles = [];
  for (const a in cutTitles) {
    titles.push([
      a, // entry
      2, // gender
      cutTitles[a]['title_A'], // title_A
      cutTitles[a]['title_H'], // title_H
      0, // item
      0, // sender
      null, // subject
      null // text
    ]);
  }

  const sql = 'INSERT IGNORE INTO achievement_reward VALUES ?';
  return wotlkmangos.query(sql, [titles])
    .then(console.log('Cut item content successfully restored!'))
    .catch(err => { throw err });
}


/* Credit Transfer */

const getRewards = () => {
  const sql = 'SELECT * FROM achievement_reward';
  return wotlkmangos.query(sql)
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


/* Pet & Mount Transfer */

const getSpells = (spells) => {
  const sql = `
    SELECT Id, Mechanic, Attributes FROM spell_template 
    WHERE Id IN (${quoteJoin(spells)})
  `;

  return wotlkmangos.query(sql, [spells])
    .then(spells => {
      console.log('Spell template data fetched...');
      return spells[0];
    })
    .catch(err => { throw err });
}

const getSpellItems = (spells) => {
  const sql = `
    SELECT 
      AllowableClass, 
      AllowableRace, 
      RequiredSkillRank, 
      spellid_2 
    FROM item_template 
    WHERE spellid_2 IN (${quoteJoin(spells)})
  `;

  return wotlkmangos.query(sql, [spells])
    .then(spells => {
      console.log('Item template data fetched...');
      return spells[0];
    })
    .catch(err => { throw err });
}


const wotlkmangosClose = () => {
  return wotlkmangos.end()
    .then(console.log('Disconnected from wotlkmangos...'))
    .catch(err => { throw err });
}

module.exports = {
  cutTitlesExist: cutTitlesExist,
  addCutTitles: addCutTitles,
  wotlkmangosConnect: wotlkmangosConnect,
  getRewards: getRewards,
  getQuestZones: getQuestZones,
  getSpells: getSpells,
  getSpellItems: getSpellItems,
  wotlkmangosClose: wotlkmangosClose
};
