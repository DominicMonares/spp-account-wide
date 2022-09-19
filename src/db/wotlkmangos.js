const mysql = require('mysql2/promise');

const { dbCredentials } = require('../config');
const { cutTitles } = require('../data/cutTitles');
const { quoteJoin } = require('../utils');

let wotlkmangos;

/* Open Connection */

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

/* Reward Transfer */

const getRewards = () => {
  const sql = 'SELECT * FROM achievement_reward';
  return wotlkmangos.query(sql)
    .then(rewards => {
      console.log('Achievement reward data fetched...');
      return rewards[0];
    })
    .catch(err => { throw err });
}

const getItemTypes = (items) => {
  const sql = `
    SELECT 
      spell_template.Id, 
      spell_template.Mechanic, 
      spell_template.Attributes,
      item_template.entry,
      item_template.AllowableClass,
      item_template.AllowableRace,
      item_template.RequiredSkillRank
    FROM spell_template 
    INNER JOIN item_template ON spell_template.Id=item_template.spellid_2 
    WHERE spell_template.Id IN (${quoteJoin(items)})
  `;

  return wotlkmangos.query(sql, [items])
    .then(items => {
      console.log('Item type data fetched...');
      return items[0];
    })
    .catch(err => { throw err });
}


/* Pet & Mount Transfer */

const getSpells = (spells) => {
  const sql = `
    SELECT 
      spell_template.Id, 
      spell_template.Mechanic, 
      spell_template.Attributes,
      item_template.entry,
      item_template.AllowableClass,
      item_template.AllowableRace,
      item_template.RequiredSkillRank
    FROM spell_template 
    INNER JOIN item_template ON spell_template.Id=item_template.spellid_2 
    WHERE spell_template.Id IN (${quoteJoin(spells)})
  `;

  return wotlkmangos.query(sql, [spells])
    .then(spells => {
      console.log('Spell template data fetched...');
      return spells[0];
    })
    .catch(err => { throw err });
}


/* Close Connection */

const wotlkmangosClose = () => {
  return wotlkmangos.end()
    .then(console.log('Disconnected from wotlkmangos...'))
    .catch(err => { throw err });
}

module.exports = {
  wotlkmangosConnect: wotlkmangosConnect,
  cutTitlesExist: cutTitlesExist,
  addCutTitles: addCutTitles,
  getQuestZones: getQuestZones,
  getRewards: getRewards,
  getItemTypes: getItemTypes,
  getSpells: getSpells,
  wotlkmangosClose: wotlkmangosClose
};
