// Data
const { factionAchievements } = require('../data/factionAchievements');
const { titles } = require('../data/titles');

// Database
const {
  getAchievements,
  addAchievements,
  addRewardTitles,
  getMailIDs,
  addRewardMail,
  addRewardItems,
  getItemGuid,
  addItemInstances
} = require('../db/wotlkcharacters');
const { getRewards } = require('../db/wotlkmangos');

// Utils
const { getFaction } = require('./utils');


let chars;
const achievements = {}; // Primary achievement store
const charAchievements = {}; // Individual achievements
const charTitles = {};
const rewards = {};
let itemGuid = 1;
let mailID = 1;

const queryAchieves = [];
const queryRewardMail = [];
const queryMailItems = [];
const queryItemInstances = [];

const transferCredit = async (characters) => {
  chars = characters;
  chars.forEach(c => charAchievements[c.guid] = {});

  await getAchievements(chars.map(c => c.guid))
    .then(achieves => achieves.forEach(a => {
      charAchievements[a.guid][a.achievement] = a.date;
      if (!achievements[a.achievement] || a.date < achievements[a.achievement]) {
        achievements[a.achievement] = a.date;
      }
    }))
    .catch(err => { throw err });

  await getRewards()
    .then(rews => rews.forEach(r => rewards[r.entry] = r))
    .catch(err => { throw err });

  // Get topmost item guid & mail ID
  await getItemGuid()
    .then(guid => itemGuid = guid[0]['guid'] + 1000) // +1000 to buffer overwrites
    .catch(err => { throw err });

  await getMailIDs()
    .then(mail => mailID = mail[0]['id'] + 3 ) // +1000 to buffer overwrites
    .catch(err => { throw err });

  // Run sub-transfers
  transferAchievements();

  // Run all database queries
  if (queryAchieves.length) await addAchievements(queryAchieves).catch(err => { throw err });
  if (queryRewardMail.length) await addRewardMail(queryRewardMail).catch(err => { throw err });
  if (queryMailItems.length) await addRewardItems(queryMailItems).catch(err => { throw err });
  if (queryItemInstances.length) await addItemInstances(queryItemInstances).catch(err => { throw err });
  await addRewardTitles(charTitles).catch(err => { throw err });
}

const transferAchievements = () => {
  // Add achievement credit and rewards for each character
  chars.forEach(c => {
    const charAchieves = { ...achievements };
    charTitles[c.guid] = c.knownTitles;
    Object.keys(charAchieves).forEach(a => {
      const factAchieves = factionAchievements[a];
      const correctFaction = factAchieves && factAchieves.faction === getFaction(c.race);
      const incorrectFaction = factAchieves && factAchieves.faction !== getFaction(c.race);
      if (correctFaction) {
        // Delete opposing faction version of achievement, add current version 
        if (charAchieves[factAchieves.alt]) delete charAchieves[factAchieves.alt];
  
        queryAchieves.push([c.guid, Number(a), charAchieves[a]]);
        transferReward(c, a);
      } else if (incorrectFaction) {
        // Delete opposing faction version of achievement, add correct version
        if (!charAchieves[factAchieves.alt]) charAchieves[factAchieves.alt] = charAchieves[a];
        delete charAchieves[a];
  
        queryAchieves.push([c.guid, Number(factAchieves.alt), charAchieves[factAchieves.alt]]);
        transferReward(c, factAchieves.alt);
      } else {
        queryAchieves.push([c.guid, Number(a), charAchieves[a]]);
        transferReward(c, a);
      }
    });
  });
}

const transferReward = (char, achievement) => {
  const rew = rewards[achievement];
  const alreadyEarned = charAchievements[char.guid][achievement];
  const noReward = !rew && !titles[achievement];
  if (alreadyEarned || noReward) return;
  charAchievements[char.guid][achievement] = achievements[achievement];
  const faction = getFaction(char.race);
  if (rew && rew.sender) transferMail(char.guid, rew);
  if (titles[achievement]) transferTitle(char.guid, char.gender, faction, achievement);
}

const transferMail = (char, reward) => {
  const date = new Date();
  queryRewardMail.push([
    mailID, // id
    3, // messageType
    41, // stationery
    0, // mailTemplateId
    reward.sender, // sender
    char, // receiver
    reward.subject, // subject
    reward.text, // body
    1, // has_items
    date.getTime() / 1000 + 7776000, // expire_time | 7776000 = 90 days
    date.getTime() / 1000, // deliver_time
    0, // money
    0, // cod
    0, // checked
  ]);

  queryMailItems.push([mailID, itemGuid, reward.item, char]);
  queryItemInstances.push([
    itemGuid, // guid
    char, // owner_guid
    reward.item, // itemEntry
    0, // creatorGuid
    0, // giftCreatorGuid
    1, // count
    0, // duration
    '0 0 0 0 0', // charges
    0, // flags
    '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ', // enchantments
    0, // randomPropertyId
    0, // durability
    0, // playedTime
    '' // text
  ]);

  itemGuid++;
  mailID++;
}

const transferTitle = (char, gender, faction, achievement) => {
  const knownTitles = charTitles[char].split(' ').map(t => Number(t));
  let id = titles[achievement]['TitleID'];
  let order = titles[achievement]['IGO'];

  // Remove last value if char titles never transferred, an extra gets added due to extra space
  if (knownTitles.length === 7) knownTitles.pop();

  // Handle unique titles
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
