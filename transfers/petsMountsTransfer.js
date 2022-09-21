// Data
const { factionSpells } = require('../data/factionSpells');

// Database
const {
  getCharSpells,
  getCharSkills,
  addSpells,
  getMailItems
} = require('../db/wotlkcharacters');
const { getSpells } = require('../db/wotlkmangos');


const pets = { A: {}, H: {}, B: {} };
const mounts = { A: {}, H: {}, B: {} };
const spellTemplate = {};
const mailItems = {};

const querySpells = [];
const queryNewsSpells = [];

const transferPetsMounts = async (chars) => {
  console.log('Pet & Mount transfer started...');

  // Get all known spells
  await getCharSpells(Object.keys(chars))
    .then(spells => spells.forEach(s => {
      querySpells.push(s.spell);
      if (factionSpells[s.spell]) querySpells.push(factionSpells[s.spell][1]);
    }))
    .catch(err => { throw err });

  // Get character skills
  await getCharSkills(Object.keys(chars).map(c => [c, 762]))
    .then(skills => skills.forEach(s => chars[s.guid]['RequiredSkillRank'] = s.value))
    .catch(err => { throw err });

  // Get spell templates for owned pets/mounts and their faction opposites
  await getSpells(querySpells)
    .then(spells => spells.forEach(s => {
      const { Id, ...spell } = s;
      spellTemplate[Id] = spell;
    }))
    .catch(err => { throw err });

  // Get mail items
  await getMailItems(Object.keys(chars))
    .then(items => items.forEach(i => {
      if (!mailItems[i.receiver]) mailItems[i.receiver] = {};
      mailItems[i.receiver][i.item_template] = 1;
    }))
    .catch(err => { throw err });

  // Sort pets and mounts by faction
  for (const id in spellTemplate) {
    const pet = spellTemplate[id]['Attributes'] === 262416 ? true : false;
    const mount = spellTemplate[id]['Mechanic'] === 21 ? true : false;
    const charClass = spellTemplate[id]['AllowableClass'] === -1 ? true : false;
    let faction;
    // Specify Mountain o' Mounts dragonhawks, not faction specific in db
    if (spellTemplate[id]['AllowableRace'] === 1101 || id === '61996') {
      faction = 'A';
    } else if (spellTemplate[id]['AllowableRace'] === 690 || id === '61997') {
      faction = 'H';
    } else if (spellTemplate[id]['AllowableRace'] === -1) {
      if (pet && factionSpells[id]) {
        faction = factionSpells[id][0] === 'H' ? 'A' : 'H';
      } else {
        faction = 'B' // Both
      }
    }

    if (pet && charClass) {
      pets[faction][id] = spellTemplate[id];
    } else if (mount && charClass) {
      mounts[faction][id] = spellTemplate[id];
    }
  }
  
  // Run sub-transfer
  transferSpells(chars);

  // Run query
  if (queryNewsSpells.length) await addSpells(queryNewsSpells).catch(err => { throw err });
}

const transferSpells = (chars) => {
  // Add new spells to all characters where eligible
  for (const c in chars) {
    const faction = chars[c]['faction'];
    const spells = { ...pets[faction], ...pets.B, ...mounts[faction], ...mounts.B };
    for (const s in spells) {
      const hasSkill = chars[c]['RequiredSkillRank'] >= spells[s]['RequiredSkillRank'];
      const item = spells[s]['entry'];
      const charMail = mailItems[c];
      if (!charMail) mailItems[c] = {};
      const inMail = charMail[item];
      const eligibleSpell = hasSkill || !spells[s]['RequiredSkillRank'];
      if (!inMail && eligibleSpell) queryNewsSpells.push([Number(c), Number(s), 1, 0]);
    }
  }
}

module.exports = { transferPetsMounts: transferPetsMounts };
