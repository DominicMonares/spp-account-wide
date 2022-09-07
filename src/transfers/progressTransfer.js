const { progressAchievements } = require('../data/progressAchievements');
const { 
  progressTableExists,
  createProgressTable,
  getProgAchievements,
  getProgress
} = require('../db/wotlkcharacters');
const { error } = require('../utils');

/*
690 = H
1101 = A

// SEPARATE, MORE SPECIFIC
// Loremaster of Eastern Kingdoms
// Loremaster of Kalimdor

Query db to get quests completed from all characters
Query db to get all quests
Filter by faction similar to achievements
if faction matches and quest is non class specific, add to progress
*/

const queryProgress = [];

const transferProgress = async (chars, wotlkcharacters) => {
  // Create character_achievement_shared_progress table if it doesn't exist
  const progressTable = await progressTableExists(wotlkcharacters).catch(err => error(err));
  if (!progressTable) await createProgressTable(wotlkcharacters).catch(err => error(err));

  // Check for earned achievements, ignore them when transferring progress
  const achievments = [];
  for (const category in progressAchievements) {
    Object.keys(progressAchievements[category]).forEach(a => achievments.push([chars[0]['guid'], a]));
  }


  const progAchieves = {...progressAchievements}; // CHANGE TO ONLY INCLUDE EARNED CRITERIA
  const earned = await getProgAchievements(achievments, wotlkcharacters).catch(err => error(err));
  for (const category in progAchieves) {
    earned.forEach(a => { 
      if (progAchieves[category][a.achievement]) {
        delete progAchieves[category][a.achievement];
      };
    });
  }

  // Get current progress from all characters
  const progress = {};
  const criteria = [];
  for (const category in progAchieves) {
    Object.values(progAchieves[category]).forEach(a => criteria.push([chars[0]['guid'], a.criteria]));
  }

  await getProgress(criteria, wotlkcharacters)
    .then(prog => console.log('BABABABABA ', prog))
    .catch(err => error(err));

  // console.log('ACHIEVES: ', progAchieves.hk);
  // check to see which achievements have already been earned
  // check to see if achievement already earned
  // add progress
  


}

module.exports = { transferProgress: transferProgress };
