const progress = require('../../data/progress');
const {
  progressTableExists,
  createProgressTable,
  getSharedProgress,
  getEarnedAchievements,
  getProgress,
  addPrevious,
  addProgress,
  addNewAchievements
} = require('../../db/wotlkcharacters');
const {
  combineHK
} = require('./utils.js');

const progressStore = {}; // Primary progress store
const sharedProgress = {};

const queryHK = [];

const transferProgress = async (chars, wotlkcharacters) => {
  // Create character_achievement_shared_progress table if it doesn't exist
  const progressTable = await progressTableExists(wotlkcharacters).catch(err => { throw err });
  if (!progressTable) await createProgressTable(wotlkcharacters).catch(err => { throw err });

  // Get previous progress for all shared achievements
  await getSharedProgress(wotlkcharacters)
    .then(prog => prog.forEach(p => {
      sharedProgress[p.achievement] = {progress: p.progress, date: p.date};
    }))
    .catch(err => { throw err });

  transferHK(chars);



}

const transferHK = (chars) => {
  // get hk from all chars
  // get total, minus previous from last achievement in chain
  // update hk achievement progress
  // update character hk for all

  // Get total number of kills, use 870 (100k Honorable Kills) for counter
  const previous = sharedProgress[870] ? sharedProgress[870]['progress'] : 0;
  const newProgress = combineHK(chars.map(c => c.totalKills), previous);
  chars.forEach(c => queryHK.push([c.guid, newProgress]));


  console.log('PROG ', newProgress);


  
}



module.exports = { transferProgress: transferProgress };

///////////////////////////////////
/////////////// OLD ///////////////
///////////////////////////////////

// const chainProgress = {};

// const queryAchievments = [];
// const queryCriteria = [];
// const queryInProgress = [];
// const queryPrevious = [];
// const queryProgress = [];
// const queryNewAchievements = [];

// const char = chars[0]['guid']; // Use first character as base


// // Check for earned achievements, ignore them when transferring progress
// for (const chain in progressAchievements) {
//   Object.keys(progressAchievements[chain]).forEach(a => queryAchievments.push([char, a]));
// }

// await getEarnedAchievements(queryAchievments, wotlkcharacters)
//   .then(achieves => storeAchieves(achieves.map(a => a.achievement)))
//   .catch(err => { throw err });

// // Get current and previous achievement progress from all chars, add to primary progress pool
// for (const chain in progress) {
//   for (const a in progress[chain]) {
//     queryInProgress.push(a);
//     chars.forEach(c => queryCriteria.push([c.guid, progress[chain][a]['criteria']]));
//   }
// }

// const currentProgress = await getProgress(queryCriteria, wotlkcharacters)
//   .then(prog => prog)
//   .catch(err => { throw err });

// const previousProgress = await getPreviousProgress(queryInProgress, wotlkcharacters)
//   .then(prog => prog)
//   .catch(err => { throw err });

// storeProgress(currentProgress, previousProgress);

// // Select one achievement from each chain to use as base
// for (const chain in progress) {
//   const mainAchieve = Object.values(progress[chain])[0];
//   const {char, complete, criteria, ...prog} = mainAchieve;
//   chainProgress[chain] = prog;
// }

// // Combine progress for each achievement
// for (const chain in chainProgress) {
//   const prog = chainProgress[chain];
//   const final = combineProgress(prog.entries, prog.previous);
//   for (const a in progress[chain]) {
//     //console.log('FINAL ', prog)
//     queryPrevious.push([a, final[0]]);
//     progress[chain][a]['final'] = final;
//   }
// }

// console.log('PROGRESS ', chainProgress.hk)
// createProgQueries(chars);

// // Add new shared progress, char progress, and achievements to database
// if (queryPrevious.length) {
//   await addPrevious(queryPrevious, wotlkcharacters).catch(err => { throw err });
//   console.log('Shared progress successfully transferred!');
// }

// if (queryProgress.length) {
//   await addProgress(queryProgress, wotlkcharacters).catch(err => { throw err });
//   console.log('Individual character progress successfully transferred!');
// }

// if (queryNewAchievements.length) {
//   await addNewAchievements(queryNewAchievements, wotlkcharacters).catch(err => { throw err });
//   console.log('New achievements successfully transferred!');
// }

// const storeAchieves = (earned) => {
//   // Add related achievement chains to primary progress store, delete earned achievements
//   earned.forEach(a => {
//     for (const chain in progressAchievements) {
//       if (progressAchievements[chain][a]) {
//         if (!progress[chain]) {
//           progress[chain] = progressAchievements[chain];
//           break;
//         }
//       }
//     }
//   });
// }

// const storeProgress = (currentProgress, previousProgress) => {
//   for (const chain in progress) {
//     for (const a in progress[chain]) {
//       currentProgress.forEach(p => {
//         const entry = { char: p.guid, counter: p.counter, date: p.date };
//         const currentCriteria = progress[chain][a]['criteria'];
//         if (currentCriteria === p.criteria) {
//           if (!progress[chain][a]['entries']) {
//             progress[chain][a]['entries'] = [entry];
//           } else {
//             progress[chain][a]['entries'].push(entry);
//           }
//         }
//       });

//       previousProgress.forEach(p => {
//         if (Number(a) === p.achievement) progress[chain][a]['previous'] = p.progress;
//       });
//     }
//   }
// }

// const combineProgress = (entries, previous) => {
//   let count = 0, date = 0;
//   if (!previous) previous = 0;
//   entries.forEach(e => { 
//     if (e.date > date) date = e.date;
//     if (e.counter - previous < 0) {
//       count += e.counter;
//     } else {
//       count += e.counter - previous;
//     }
//   });

//   return [count + previous, date];
// }

// const createProgQueries = (chars) => {
//   // Create final query arrays
//   for (const chain in progress) {
//     for (const a in progress[chain]) {
//       chars.forEach(c => {
//         const currentAchieve = progress[chain][a];
//         // Add progress
//         let counter;
//         if (currentAchieve['final'][0] >= currentAchieve.complete) {
//           counter = currentAchieve.complete;
//         } else {
//           counter = currentAchieve['final'][0];
//         }

//         queryProgress.push([
//           c.guid, // guid
//           currentAchieve.criteria, // criteria
//           counter, // counter
//           currentAchieve['final'][1] // date
//         ]);

//         // Add achievements earned after progress transfer
//         if (currentAchieve.final >= currentAchieve.complete) queryNewAchievements.push([
//           c.guid, // guid
//           a, // achievement
//           currentAchieve['final'][1] // date
//         ]);
//       });
//     }
//   }
// }



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
