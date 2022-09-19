// Data
const { factionSpells } = require('../data/factionSpells');

// Database
const { getCharSkills, addSpells } = require('../db/wotlkcharacters');
const { getSpells, getSpellItems } = require('../db/wotlkmangos');


const pets = { A: {}, H: {}, B: {} };
const mounts = { A: {}, H: {}, B: {} };
const spellTemplate = {};

const querySpells = [];

const transferPetsMounts = async (chars, charSpells) => {
  const spellIds = charSpells.map(s => s.spell);
  
  // Get spells from template
  await getSpells(spellIds)
    .then(spells => spells.forEach(s => {
      spellTemplate[s.Id] = { mechanic: s.Mechanic, attributes: s.Attributes };
    }))
    .catch(err => { throw err });
    
  // Get spell requirements from corresponding items
  await getSpellItems(spellIds)
    .then(spells => spells.forEach(s => {
      spellTemplate[s.spellid_2]['class'] = s.AllowableClass;
      spellTemplate[s.spellid_2]['race'] = s.AllowableRace;
      spellTemplate[s.spellid_2]['riding'] = s.RequiredSkillRank;
    }))
    .catch(err => { throw err });

  // Get character skills
  await getCharSkills(Object.keys(chars).map(c => [c, 762]))
    .then(skills => skills.forEach(s => chars[s.guid]['riding'] = s.value))
    .catch(err => { throw err });

  // Sort pets and mounts by faction
  for (const id in spellTemplate) {
    const pet = spellTemplate[id]['attributes'] === 262416 ? true : false;
    const mount = spellTemplate[id]['mechanic'] === 21 ? true : false;
    const charClass = spellTemplate[id]['class'] === -1 ? true : false;
    let faction;
    if (spellTemplate[id]['race'] === 1101) {
      faction = 'A';
    } else if (spellTemplate[id]['race'] === 690) {
      faction = 'H';
    } else if (spellTemplate[id]['race'] === -1) {
      if (!spellTemplate[id]['riding'] && factionSpells[id]) {
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

  // Add opposing faction pets and mounts
  for (const f in pets) addFactionSpells(f, 'pets');
  for (const f in mounts) addFactionSpells(f, 'mounts');
  
  // Run sub-transfer
  transferSpells(chars);

  // Run query
  if (querySpells.length) await addSpells(querySpells).catch(err => { throw err });
}

const addFactionSpells = (f, type) => {
  if (f === 'B') return;
  const typePets = type === 'pets';
  for (const s in typePets ? pets[f] : mounts[f]) {
    if (!factionSpells[s]) continue;
    const oppFaction = factionSpells[s][0];
    const oppSpell = factionSpells[s][1];
    const oppExists = typePets ? pets[oppFaction][oppSpell] : mounts[oppFaction][oppSpell];
    if (!oppExists) {
      const entry = {
        class: -1,
        race: oppFaction === 'A' ? 1101 : 690,
        riding: typePets ? pets[f][s]['riding'] : mounts[f][s]['riding']
      };

      typePets ? pets[oppFaction][oppSpell] = entry : mounts[oppFaction][oppSpell] = entry;
    }
  }
}

const transferSpells = (chars) => {
  for (const c in chars) {
    const faction = chars[c]['faction'];
    const spells = { ...pets[faction], ...pets.B, ...mounts[faction], ...mounts.B };
    for (const s in spells) {
      const hasSkill = chars[c]['riding'] >= spells[s]['riding'];
      if (hasSkill || !spells[s]['riding']) querySpells.push([Number(c), Number(s), 1, 0]);
    }
  }
}

module.exports = {
  transferPetsMounts: transferPetsMounts
};
