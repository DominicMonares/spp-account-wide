const { 
  getAchievements, 
  addAchievements, 
  addTitleReward 
} = require('../db/wotlkcharacters');
const { getRewards } = require('../db/wotlkmangos');
const { error, faction } = require('../utils');
const { factionAchievements } = require('../data/factionAchievements');
const { titles } = require('../data/titles');

const achievements = {}; // Primary achievement store
const charAchievements = {};
const charTitles = {};
const rewards = {};

const queryAchieves = [];
const queryRewardMail = [];
const queryRewardTitle = [];

const transferCredit = async (chars, wotlkcharacters, wotlkmangos) => {
  chars.forEach(c => charAchievements[c.guid] = {});

  await getAchievements(chars.map(c => c.guid), wotlkcharacters)
    .then(achieves => achieves.forEach(a => {
      // Add to primary achievements to pool
      if (!achievements[a.achievement]) {
        achievements[a.achievement] = a.date;
      } else if (a.date < achievements[a.achievement]) {
        achievements[a.achievement] = a.date;
      }
      
      // Add to character achievements pool
      charAchievements[a.guid][a.achievement] = a.date;
    }))
    .catch(err => error(err));

  await getRewards(wotlkmangos)
    .then(rews => rews.forEach(r => rewards[r.entry] = r))
    .catch(err => error(err));

  for (const c of chars) {
    const charAchieves = { ...achievements };
    charTitles[c.guid] = c.knownTitles;
    for (const a in charAchieves) {
      const factAchieves = factionAchievements[a];
      const correctFaction = factAchieves && factAchieves.faction === faction(c.race);
      const incorrectFaction = factAchieves && factAchieves.faction !== faction(c.race);

      if (correctFaction) {
        if (charAchieves[factAchieves.alt]) delete charAchieves[factAchieves.alt];
        queryAchieves.push([c.guid, Number(a), charAchieves[a]]);
        await handleReward(c, a).catch(err => error(err));
      } else if (incorrectFaction) {
        if (!charAchieves[factAchieves.alt]) charAchieves[factAchieves.alt] = charAchieves[a];
        delete charAchieves[a];
        queryAchieves.push([c.guid, Number(factAchieves.alt), charAchieves[factAchieves.alt]]);
        await handleReward(c, factAchieves.alt).catch(err => error(err));
      } else {
        queryAchieves.push([c.guid, Number(a), charAchieves[a]]);
        await handleReward(c, a).catch(err => error(err));
      }
    }
  }

  await addAchievements(queryAchieves, wotlkcharacters).catch(err => error(err));

  const charTitleKeys = Object.keys(charTitles);
  for (const char of charTitleKeys) {
    await addTitleReward(char, charTitles[char], wotlkcharacters).catch(err => error(err));
  }
  console.log('Achievement title rewards successfully transferred!');

  // Execute mail query here
}

const handleReward = async (char, achievement) => {
  if (charAchievements[char.guid][achievement] || !rewards[achievement]) return;
  const rew = rewards[achievement];
  if (rew.sender) addMail(char.guid, achievement);
  if (rew.title_A || rew.title_H) addTitle(char.guid, char.gender, faction(char.race), achievement);
}

const addMail = (char, achievement) => {

}

const addTitle = (char, gender, faction, achievement) => {
  const knownTitles = charTitles[char].split(' ').map(t => Number(t));
  if (knownTitles.length === 7) knownTitles.pop();

  let id = titles[achievement]['TitleID'];
  let order = titles[achievement]['IGO'];

  if (achievement === '870') { // of the Alliance | of the Horde
    id = faction === 'A' ? id[0] : id[1];
    order = faction === 'A' ? order[0] : order[1];
  } else if (achievement === '1793') { // Patron | Matron
    id = gender === 0 ? id[0] : id[1];
    order = gender === 0 ? order[0] : order[1];
  } 

  const titleIndex = Number((order / 32).toString()[0]);
  const bit = 2 ** (order % 32);
  knownTitles[titleIndex] = knownTitles[titleIndex] + bit;
  charTitles[char] = knownTitles.join(' ');
}

module.exports = {
  transferCredit: transferCredit
};
