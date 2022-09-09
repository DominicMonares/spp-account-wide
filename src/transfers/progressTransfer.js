const { progressAchievements } = require('../data/progressAchievements');
const {
  progressTableExists,
  createProgressTable,
  getEarnedAchievements,
  getProgress,
  getPreviousProgress,
  addPrevious,
  addProgress,
  addNewAchievements
} = require('../db/wotlkcharacters');

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

const progress = {}; // Primary progress store
const chainProgress = {};

const queryAchievments = [];
const queryCriteria = [];
const queryInProgress = [];
const queryPrevious = [];
const queryProgress = [];
const queryNewAchievements = [];

const transferProgress = async (chars, wotlkcharacters) => {
  const char = chars[0]['guid']; // Use first character as base

  // Create character_achievement_shared_progress table if it doesn't exist
  const progressTable = await progressTableExists(wotlkcharacters).catch(err => { throw err });
  if (!progressTable) await createProgressTable(wotlkcharacters).catch(err => { throw err });

  // Check for earned achievements, ignore them when transferring progress
  for (const chain in progressAchievements) {
    Object.keys(progressAchievements[chain]).forEach(a => queryAchievments.push([char, a]));
  }

  await getEarnedAchievements(queryAchievments, wotlkcharacters)
    .then(achieves => storeAchieves(achieves.map(a => a.achievement)))
    .catch(err => { throw err });

  // Get current and previous achievement progress from all chars, add to primary progress pool
  for (const chain in progress) {
    for (const a in progress[chain]) {
      queryInProgress.push(a);
      chars.forEach(c => queryCriteria.push([c.guid, progress[chain][a]['criteria']]));
    }
  }

  const currentProgress = await getProgress(queryCriteria, wotlkcharacters)
    .then(prog => prog)
    .catch(err => { throw err });

  const previousProgress = await getPreviousProgress(queryInProgress, wotlkcharacters)
    .then(prog => prog)
    .catch(err => { throw err });

  storeProgress(currentProgress, previousProgress);

  // Select one achievement from each chain to use as base
  for (const chain in progress) {
    const mainAchieve = Object.values(progress[chain])[0];
    const {char, complete, criteria, ...prog} = mainAchieve;
    chainProgress[chain] = prog;
  }
  
  // Combine progress for each achievement
  for (const chain in chainProgress) {
    const prog = chainProgress[chain];
    const final = combineProgress(prog.entries, prog.previous);
    for (const a in progress[chain]) {
      //console.log('FINAL ', prog)
      queryPrevious.push([a, final[0]]);
      progress[chain][a]['final'] = final;
    }
  }
  
  console.log('PROGRESS ', chainProgress.hk)
  createProgQueries(chars);

  // Add new shared progress, char progress, and achievements to database
  if (queryPrevious.length) {
    await addPrevious(queryPrevious, wotlkcharacters).catch(err => { throw err });
    console.log('Shared progress successfully transferred!');
  }

  if (queryProgress.length) {
    await addProgress(queryProgress, wotlkcharacters).catch(err => { throw err });
    console.log('Individual character progress successfully transferred!');
  }

  if (queryNewAchievements.length) {
    await addNewAchievements(queryNewAchievements, wotlkcharacters).catch(err => { throw err });
    console.log('New achievements successfully transferred!');
  }
}

const storeAchieves = (earned) => {
  // Add related achievement chains to primary progress store, delete earned achievements
  earned.forEach(a => {
    for (const chain in progressAchievements) {
      if (progressAchievements[chain][a]) {
        if (!progress[chain]) {
          progress[chain] = progressAchievements[chain];
          delete progress[chain][a];
          break;
        } else {
          delete progress[chain][a];
          break;
        }
      }
    }
  });
}

const storeProgress = (currentProgress, previousProgress) => {
  for (const chain in progress) {
    for (const a in progress[chain]) {
      currentProgress.forEach(p => {
        const entry = { char: p.guid, counter: p.counter, date: p.date };
        const currentCriteria = progress[chain][a]['criteria'];
        if (currentCriteria === p.criteria) {
          if (!progress[chain][a]['entries']) {
            progress[chain][a]['entries'] = [entry];
          } else {
            progress[chain][a]['entries'].push(entry);
          }
        }
      });

      previousProgress.forEach(p => {
        if (a === p.achievement) progress[chain][a]['previous'] = p.progress;
      });
    }
  }
}


const combineProgress = (entries, previous) => {
  let count = 0, date = 0;
  if (!previous) previous = 0;
  const newEntries = entries.map(e => { 
    return {counter: e.counter - previous, date: e.date} 
  })
  
  newEntries.forEach(e => {
    count += e.counter
    if (e.date > date) date = e.date;
  });


  return [count + previous, date];
}

const createProgQueries = (chars) => {
  // Create final query arrays
  for (const chain in progress) {
    for (const a in progress[chain]) {
      chars.forEach(c => {
        const currentAchieve = progress[chain][a];

        // Add progress
        queryProgress.push([
          c.guid, // guid
          currentAchieve.criteria, // criteria
          currentAchieve['final'][0], // counter
          currentAchieve['final'][1] // date
        ]);

        // Add achievements earned after progress transfer
        if (currentAchieve.final >= currentAchieve.complete) queryNewAchievements.push([
          c.guid, // guid
          a, // achievement
          currentAchieve['final'][1] // date
        ]);
      });
    }
  }
}

module.exports = { transferProgress: transferProgress };
