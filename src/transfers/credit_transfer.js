const { getAchievements, addAchievements } = require('../db/wotlkcharacters');
const { factionAchievements } = require('../data/factionAchievements');

let achievements = {};

const transfer_credit = async (chars, wotlkcharacters) => {
  if (Object.keys(achievements).length) { achievements = {} }
  
  const allAchieves = await getAchievements(chars.map(c => c.guid), wotlkcharacters);
  allAchieves.forEach(a => {
    if (!achievements[a.achievement]) return achievements[a.achievement] = a.date;
    if (a.date < achievements[a.achievement]) achievements[a.achievement] = a.date; 
  });
  
  for (const c of chars) {
    const charAchieves = { ...achievements };
    const queryAchieves = [];
  
    // Handle faction-specific achievements
    for (const a in charAchieves) {
      const factionAchieves = factionAchievements[a];
      if (factionAchieves && factionAchieves.faction === c.faction) {
        // Remove opposing faction version of this achievement
        if (charAchieves[factionAchieves.alt]) delete charAchieves[factionAchieves.alt];
        queryAchieves.push([c.guid, Number(a), charAchieves[a]]);
      } else if (factionAchieves && factionAchieves.faction !== c.faction) {
        // Add correct faction version if it doesn't exist, remove this version
        if (!charAchieves[factionAchieves.alt]) charAchieves[factionAchieves.alt] = charAchieves[a];
        delete charAchieves[a];
        queryAchieves.push([c.guid, Number(factionAchieves.alt), charAchieves[factionAchieves.alt]]);
      } else {
        queryAchieves.push([c.guid, Number(a), charAchieves[a]]);
      }
    }
  
    await addAchievements(queryAchieves, c.name, wotlkcharacters);
    // add rewards
  }
}

module.exports = {
  transfer_credit: transfer_credit
};
