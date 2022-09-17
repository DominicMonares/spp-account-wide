// Data
const { factionAchievements } = require('../data/factionAchievements');

// Database
const {
  getAchievements,
  addAchievements
} = require('../db/wotlkcharacters');

// Transfers
const { transferRewards } = require('./rewardsTransfer');

// Utils
const { getFaction } = require('./utils');


let chars;
const achievements = {}; // Primary achievement store
const charAchievements = {}; // Individual earned achievements
const earnedAchievements = [];

const queryAchieves = [];

const transferCredit = async (characters) => {
  console.log('Achievement credit transfer started!');
  
  chars = characters;
  chars.forEach(c => charAchievements[c.guid] = {});

  // Get achievement progress for all characters, store by character
  await getAchievements(chars.map(c => c.guid))
    .then(achieves => achieves.forEach(a => {
      charAchievements[a.guid][a.achievement] = a.date;
      if (!achievements[a.achievement] || a.date < achievements[a.achievement]) {
        achievements[a.achievement] = a.date;
      }
    }))
    .catch(err => { throw err });


  // Run sub-transfers
  transferAchievements();
  await transferRewards(earnedAchievements).catch(err => { throw err });

  // Run database query
  if (queryAchieves.length) await addAchievements(queryAchieves).catch(err => { throw err });
}

const transferAchievements = () => {
  // Add achievement credit and rewards for each character
  chars.forEach(c => {
    const charAchieves = { ...achievements };
    Object.keys(charAchieves).forEach(a => {
      a = Number(a);
      const factAchieves = factionAchievements[a];
      const correctFaction = factAchieves && factAchieves.faction === getFaction(c.race);
      const incorrectFaction = factAchieves && factAchieves.faction !== getFaction(c.race);
      if (correctFaction) {
        // Delete opposing faction version of achievement, add current version 
        if (charAchieves[factAchieves.alt]) delete charAchieves[factAchieves.alt];
  
        if (!charAchievements[c.guid][a]) {
          queryAchieves.push([c.guid, a, charAchieves[a]]);
          earnedAchievements.push([c, a]);
        }
      } else if (incorrectFaction) {
        // Delete opposing faction version of achievement, add correct version
        if (!charAchieves[factAchieves.alt]) charAchieves[factAchieves.alt] = charAchieves[a];
        delete charAchieves[a];
  
        if (!charAchievements[c.guid][a]) {
          queryAchieves.push([c.guid,factAchieves.alt, charAchieves[factAchieves.alt]]);
          earnedAchievements.push([c, factAchieves.alt]);
        }
      } else {
        if (!charAchievements[c.guid][a]) {
          queryAchieves.push([c.guid, a, charAchieves[a]]);
          earnedAchievements.push([c, a]);
        }
      }
    });
  });
}

module.exports = {
  transferCredit: transferCredit
};
