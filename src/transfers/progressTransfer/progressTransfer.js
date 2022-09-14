const progress = require('../../data/progress');
const { zones } = require('../../data/zones');
const { getFaction } = require('../../utils.js');
const { 
  latestDate, 
  combineProgress,
  combineLoremaster,
  correctFaction
} = require('./utils.js');
const {
  progressTableExists,
  createProgressTable,
  getSharedProgress,
  getCurrentProgress,
  addSharedProgress,
  getQuests,
  addNewProgress,
  addAchievements,
  addHonorKills
} = require('../../db/wotlkcharacters');
const { getQuestZones } = require('../../db/wotlkmangos');

const previousProgress = {}; // Uses achievement index
const currentProgress = {}; // Uses criteria index
const loremasterProgress = {A: {0: [], 1: []}, H: {0: [], 1: []}}; // Faction: EK, Kalimdor
const characters = {}; // Only used for Loremaster
let completedQuests;

const queryCriteria = [];
const queryQuestZones = {};
const queryNewShared = [];
const queryNewProgress = [];
const queryNewAchieves = [];
const queryNewHK = [];

const transferProgress = async (chars, wotlkcharacters, wotlkmangos) => {
  if (!chars.length) return;
  chars.forEach(c => characters[c.guid] = c);
  
  // Create character_achievement_shared_progress table if it doesn't exist
  const progressTable = await progressTableExists(wotlkcharacters).catch(err => { throw err });
  if (!progressTable) await createProgressTable(wotlkcharacters).catch(err => { throw err });

  // Get previous progress for all shared achievements
  await getSharedProgress(wotlkcharacters)
    .then(prog => prog.forEach(p => {
      previousProgress[p.achievement] = p.progress;
    }))
    .catch(err => { throw err });

  // Create criteria query
  for (const chain in progress) {
    if (chain === 'bg' || chain === 'lmA' || chain === 'lmH') {
      for (const sub in progress[chain]) {
        const criteria = Object.values(progress[chain][sub])[0]['criteria'];
        chars.forEach(c => queryCriteria.push([c.guid, criteria]));
      }
    } else {
      Object.values(progress[chain]).forEach(a => {
        chars.forEach(c => queryCriteria.push([c.guid, a.criteria]));
      });
    }
  }

  // Get current progress for all shared achievements
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
    .then(quests => {
      completedQuests = quests;

      // Add completed quests for Blood Elves and Draenei, used for Loremaster
      chars.forEach(c => {
        if (c.race === 10 || c.race === 11) quests.forEach(q => {
          if (c.guid === q.guid) {
            if (!characters[c.guid]['questCount']) {
              characters[c.guid]['questCount'] = 1;
            } else {
              characters[c.guid]['questCount']++;
            }
          };
        });
      });
    })
    .catch(err => { throw err });

  // Get quest zones before storing
  const questZones = {};
  completedQuests.forEach(q => { if (!queryQuestZones[q.quest]) queryQuestZones[q.quest] = 1 });
  await getQuestZones(Object.keys(queryQuestZones), wotlkmangos)
    .then(qs => qs.forEach(q => questZones[q.entry] = q.ZoneOrSort))
    .catch(err => { throw err });

  // Store quests by faction and continent
  completedQuests.forEach(q => {
    if (questZones[q.quest] < 0) return;
    const charFaction = getFaction(characters[q.guid]['race']);
    const continent = zones[questZones[q.quest]];
    if (continent !== 0 && continent !== 1) return;
    loremasterProgress[charFaction][continent].push(q);
  });

  // Run sub-transfers
  transferGold(chars);
  transferEmblems(chars);
  transferArena(chars);
  transferBG(chars);
  transferHK(chars);
  transferDailies(chars);
  transferQuests(chars);
  transferLoremaster(chars);
  
  // Run Queries
  if (queryNewShared.length) {
    await addSharedProgress(queryNewShared, wotlkcharacters).catch(err => { throw err });
  }

  if (queryNewProgress.length) {
    await addNewProgress(queryNewProgress, wotlkcharacters).catch(err => { throw err });
  }

  if (queryNewAchieves.length) {
    await addAchievements(queryNewAchieves, wotlkcharacters).catch(err => { throw err });
  }

  if (queryNewHK.length) {
    await addHonorKills(queryNewHK, wotlkcharacters).catch(err => { throw err });
  }
}

const transferGold = (chars) => {
  // Works using achievement count
  // Get total amount of gold looted, use 1181 (25k Gold Looted) for counter
  const previous = previousProgress[1181] || 0;
  const goldProgress = currentProgress[progress['gold'][1181]['criteria']] || [];
  const currentGold = goldProgress.map(e => e.counter);
  const newProgress = combineProgress(currentGold, previous);
  const newDate = latestDate(goldProgress);
  createQueries(chars, 'gold', previous, newProgress, newDate);
}

const transferEmblems = (chars) => {
  // Works using achievement count
  // Get total amount of emblems looted, use 4316 (2500 Emblems Looted) for counter
  const previous = previousProgress[4316] || 0;
  const emblemProgress = currentProgress[progress['emblems'][4316]['criteria']] || [];
  const currentEmblems = emblemProgress.map(e => e.counter);
  const newProgress = combineProgress(currentEmblems, previous);
  const newDate = latestDate(emblemProgress);
  createQueries(chars, 'emblems', previous, newProgress, newDate);
}

const transferArena = (chars) => {
  // Works using achievement count
  // Get total amount of rated arena wins, use 876 (300 Rated Arena Wins) for counter
  const previous = previousProgress[876] || 0;
  const arenaProgress = currentProgress[progress['arena'][876]['criteria']] || [];
  const currentWins = arenaProgress.map(e => e.counter);
  const newProgress = combineProgress(currentWins, previous);
  const newDate = latestDate(arenaProgress);
  createQueries(chars, 'arena', previous, newProgress, newDate);
}

const transferBG = (chars) => {
  // Works using achievement count
  // Get total amount of battleground wins and their counters
  for (const m in progress.bg) {
    const map = progress['bg'][m];
    const achieve = Object.keys(map)[0];
    const previous = previousProgress[achieve] || 0;
    const bgProgress = currentProgress[map[achieve]['criteria']] || [];
    const currentWins = bgProgress.map(e => e.counter);
    const newProgress = combineProgress(currentWins, previous);
    const newDate = latestDate(bgProgress);
    createQueries(chars, 'bg', previous, newProgress, newDate, m);
  }
}

const transferHK = (chars) => {
  // Only works if kills themselves are shared between chars, cannot use achievement count
  // Get total number of kills, use 870 (100k Honorable Kills) for counter
  const previous = previousProgress[870] || 0;
  const newProgress = combineProgress(chars.map(c => c.totalKills), previous);
  const newDate = latestDate(currentProgress[progress['hk'][870]['criteria']] || []);
  chars.forEach(c => queryNewHK.push([c.guid, newProgress])); // Create HK queries
  createQueries(chars, 'hk', previous, newProgress, newDate);
}

const transferDailies = (chars) => {
  // Works using achievement count
  // Get total number of kills, use 977 (1000 Daily Quests) for counter
  const previous = previousProgress[977] || 0;
  const dailyProgress = currentProgress[progress['daily'][977]['criteria']] || [];
  const currentDailies = dailyProgress.map(e => e.counter);
  const newProgress = combineProgress(currentDailies, previous);
  const newDate = latestDate(currentDailies);
  createQueries(chars, 'daily', previous, newProgress, newDate);
}

const transferLoremaster = (chars) => {
  // Get total amount of quests by faction and continent
  for (const faction in loremasterProgress) {
    for (const continent in loremasterProgress[faction]) {
      const chain = `lm${faction}`;
      const achieve = Object.keys(progress[chain][continent])[0];
      const previous = previousProgress[achieve] || 0;
      const lmProgress = loremasterProgress[faction][continent];
      const newProgress = combineLoremaster(lmProgress);
      const newDate = latestDate(lmProgress);
      const factionChars = chars.filter(c => getFaction(c.race) === faction ? true : false);
      createQueries(factionChars, chain, previous, newProgress, newDate, continent);
    }
  }
}

const transferQuests = (chars) => {
  // Only works by checking earned quests, in-game counter doesn't work properly
  // Unable to add to char achieves without cluttering/messing character_queststatus table up
  // Get total number of kills, use 978 (3000 Quests) for counter
  const previous = previousProgress[978] || 0;
  const newProgress = completedQuests.length;
  const newDate = latestDate(completedQuests);
  createQueries(chars, 'quest', previous, newProgress, newDate);
}

const createQueries = (chars, chain, previous, newProgress, newDate, sub) => {

  const progChain = sub ? progress[chain][sub] : progress[chain];
  for (let a in progChain) {
    a = Number(a);
    chars.forEach(c => {
      const complete = progChain[a]['complete'];

      // Add new shared progress
      queryNewShared.push([a, newProgress]);
      
      // Update new progress if greater than achievement completion criteria
      let validProgress = newProgress;
      const achieveEarned = validProgress > complete;
      if (achieveEarned) validProgress = complete;
      
      // Subtract quests completed by Blood Elves and Draenei characters for Loremaster
      const loremaster = chain === 'lmA' || chain === 'lmH';
      const bcChar = c.race === 10 || c.race === 11;
      if (loremaster && bcChar && !achieveEarned)  {
        let questCount = characters[c.guid]['questCount'];
        if (!questCount) questCount = 0;
        validProgress -= questCount;
      };
      
      // Add all new progress
      queryNewProgress.push([
        c.guid, // guid
        progChain[a]['criteria'], // criteria
        validProgress, // counter
        newDate // date
      ]);

      // Add new achievements if any were earned after sharing
      if (previous < complete && newProgress > complete) {
        // Ensure faction is correct if Loremaster is earned
        if (chain === 'lmA' || chain === 'lmH') {
          a = correctFaction(getFaction(c.race), a);
        }

        queryNewAchieves.push([c.guid, a, newDate]);
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
