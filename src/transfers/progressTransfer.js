const { progressAchievements } = require('../data/progressAchievements');
const {
  progressTableExists,
  createProgressTable,
  getEarnedAchievements,
  getProgress,
  getPreviousProgress
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
  const progress = {}; // Primary progress store
  const char = chars[0]['guid'];

  // Create character_achievement_shared_progress table if it doesn't exist
  const progressTable = await progressTableExists(wotlkcharacters).catch(err => error(err));
  if (!progressTable) await createProgressTable(wotlkcharacters).catch(err => error(err));

  // Check for earned achievements, ignore them when transferring progress
  const queryAchievments = [];
  for (const category in progressAchievements) {
    Object.keys(progressAchievements[category]).forEach(a => queryAchievments.push([char, a]));
  }

  const earned = await getEarnedAchievements(queryAchievments, wotlkcharacters)
    .then(achieves => achieves.map(a => a.achievement))
    .catch(err => error(err));

  // Add related categories and delete earned achievements
  const unearned = [];
  for (const achievement of earned) {
    for (const category in progressAchievements) {
      if (progressAchievements[category][achievement]) {
        if (!progress[category]) {
          progress[category] = progressAchievements[category];
          delete progress[category][achievement];
          break;
        } else {
          delete progress[category][achievement];
          break;
        }
      }
    }
  }

  for (const category in progress) {
    Object.keys(progress[category]).forEach(a => unearned.push(a));
  }
  console.log('WWFASDFASD ', progress)
  
  // Get current and previous progress from all characters
  const queryCriteria = [];
  for (const category in progressAchievements) {
    // REEVALUATE
    unearned.forEach(a => {
      const achievement = progressAchievements[category][a];
      if (achievement) {
        for (const cat in progress) {
          Object.keys(progress[cat]).forEach(p => { if (p === a) progress[cat][p]['entries'] = [] });
        }
        chars.forEach(c => queryCriteria.push([c.guid, achievement.criteria]));
      }
    });
  }
  

  await getProgress(queryCriteria, wotlkcharacters)
    .then(prog => prog.forEach(p => {
      const progEntry = { char: p.guid, counter: p.counter, date: p.date };
      for (const a in progress) {
        if (progress[a]['criteria'] === p.criteria) progress[a]['entries'].push(progEntry);
      }
    }))
    .catch(err => error(err));

  await getPreviousProgress(Object.keys(progress), wotlkcharacters)
    .then(prog => prog.forEach(p => progress[p.achievement]['previous'] = p.progress))
    .catch(err => error(err));



  // Combine achievement progress
  for (const category in updatedProgress) {
    const catAchieves = Object.keys(updatedProgress[category]);


  }

  console.log('BABABABABA ', updatedProgress);

}

module.exports = { transferProgress: transferProgress };
