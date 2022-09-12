const progress = require('../../data/progress');
const {
  progressTableExists,
  createProgressTable,
  getSharedProgress,
  getCurrentProgress,
  addSharedProgress,
  addNewProgress,
  addAchievements,
  addHonorKills,
  getQuests
} = require('../../db/wotlkcharacters');
const {
  latestDate,
  combineProgress
} = require('./utils.js');

const previousProgress = {}; // Uses achievement index
const currentProgress = {}; // Uses criteria index
const completedQuests = {};
let rawQuests; // Needed to get latest date for quests

const queryCriteria = [];
const queryNewShared = [];
const queryNewProgress = [];
const queryNewAchieves = [];
const queryNewHK = [];

const transferProgress = async (chars, wotlkcharacters) => {
  // Create character_achievement_shared_progress table if it doesn't exist
  const progressTable = await progressTableExists(wotlkcharacters).catch(err => { throw err });
  if (!progressTable) await createProgressTable(wotlkcharacters).catch(err => { throw err });

  // Get previous progress for all shared achievements
  await getSharedProgress(wotlkcharacters)
    .then(prog => prog.forEach(p => {
      previousProgress[p.achievement] = p.progress;
    }))
    .catch(err => { throw err });

  // Get current progress for all shared achievements
  for (const chain in progress) {
    Object.values(progress[chain]).forEach(a => {
      chars.forEach(c => queryCriteria.push([c.guid, a.criteria]));
    });
  }

  if (queryCriteria.length) {
    await getCurrentProgress(queryCriteria, wotlkcharacters)
      .then(prog => prog.forEach(p => {
        const { criteria, ...crit } = p;
        if (!currentProgress[p.criteria]) {
          currentProgress[p.criteria] = [crit];
        } else {
          currentProgress[p.criteria].push(crit); 1
        }
      }))
      .catch(err => { throw err });
  }

  // Get completed quests from all characters
  await getQuests(chars.map(c => [c.guid, 1]), wotlkcharacters)
    .then(qs => {
      rawQuests = qs;
      qs.forEach(q => {
        const { guid, ...quest } = q;
        if (!completedQuests[q.guid]) {
          completedQuests[q.guid] = [quest];
        } else {
          completedQuests[q.guid].push(quest);
        }
      });
    })
    .catch(err => { throw err });

  // Begin sub-transfers
  transferGold(chars);
  transferEmblems(chars);
  // ARENA
  // BATTLEGROUNDS
  transferHK(chars);
  transferDailies(chars);
  transferQuests(chars); // NEED TO FIGURE DATA STRUCTURE OUT
  // LOREMASTER


  // Run Queries
  if (queryNewShared.length) {
    await addSharedProgress(queryNewShared, wotlkcharacters).catch(err => { throw err });
    console.log('Shared progress successfully updated!');
  }

  if (queryNewProgress.length) {
    await addNewProgress(queryNewProgress, wotlkcharacters).catch(err => { throw err });
    console.log('Progress successfully updated for all characters!');
  }

  if (queryNewAchieves.length) {
    await addAchievements(queryNewAchieves, wotlkcharacters).catch(err => { throw err });
  }

  if (queryNewHK.length) {
    await addHonorKills(queryNewHK, wotlkcharacters).catch(err => { throw err });
  }
}

const transferGold = (chars) => {
  // Get total amount of gold looted, use 1181 (25k Gold Looted) for counter
  const previous = previousProgress[1181] || 0;
  const goldProgress = currentProgress[progress['gold'][1181]['criteria']] || [];
  const currentGold = goldProgress.map(e => e.counter);
  const newProgress = combineProgress(currentGold, previous);
  const newDate = latestDate(goldProgress);
  createQueries(chars, 'gold', previous, newProgress, newDate);
}

const transferEmblems = (chars) => {
  // Get total amount of emblems looted, use 4316 (2500 Emblems Looted) for counter
  const previous = previousProgress[4316] || 0;
  const emblemProgress = currentProgress[progress['emblems'][4316]['criteria']] || [];
  const currentEmblems = emblemProgress.map(e => e.counter);
  const newProgress = combineProgress(currentEmblems, previous);
  const newDate = latestDate(emblemProgress);
  createQueries(chars, 'emblems', previous, newProgress, newDate);
}

const transferHK = (chars) => {
  // Get total number of kills, use 870 (100k Honorable Kills) for counter
  const previous = previousProgress[870] || 0;
  const newProgress = combineProgress(chars.map(c => c.totalKills), previous);
  const newDate = latestDate(currentProgress[progress['hk'][870]['criteria']] || []);
  chars.forEach(c => queryNewHK.push([c.guid, newProgress])); // Create HK queries
  createQueries(chars, 'hk', previous, newProgress, newDate);
}

const transferDailies = (chars) => {
  // Get total number of kills, use 977 (1000 Daily Quests) for counter
  const previous = previousProgress[977] || 0;
  const dailyProgress = currentProgress[progress['daily'][977]['criteria']] || [];
  const currentDailies = dailyProgress.map(e => e.counter);
  const newProgress = combineProgress(currentDailies, previous);
  const newDate = latestDate(currentDailies);
  createQueries(chars, 'daily', previous, newProgress, newDate);
}

const transferQuests = (chars) => {
  // Get total number of kills, use 978 (3000 Quests) for counter
  const previous = previousProgress[978] || 0;
  const newProgress = rawQuests.length;
  const newDate = latestDate(rawQuests);
  createQueries(chars, 'quest', previous, newProgress, newDate);
}

const createQueries = (chars, chain, previous, newProgress, newDate) => {
  for (const a in progress[chain]) {
    chars.forEach(c => {
      const complete = progress[chain][a]['complete'];

      // Add new shared progress
      queryNewShared.push([a, newProgress]);

      // Add all new progress
      let validProgress = newProgress;
      if (validProgress > complete) validProgress = complete;
      queryNewProgress.push([
        c.guid, // guid
        progress[chain][a]['criteria'], // criteria
        validProgress, // counter
        newDate // date
      ]);

      // Add new achievements if any were earned after sharing
      if (previous < complete && newProgress > complete) {
        queryNewAchieves.push([c.guid, Number(a), newDate]);
      }
    });
  }
}

module.exports = { transferProgress: transferProgress };

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
