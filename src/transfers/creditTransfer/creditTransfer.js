const { 
  getAchievements, 
  addAchievements, 
  addRewardTitles,
  getMailIDs,
  addRewardMail,
  addRewardItems,
  getItemGuid,
  addItemInstances
} = require('../../db/wotlkcharacters');
const { getRewards } = require('../../db/wotlkmangos');
const { getFaction } = require('./utils');
const { factionAchievements } = require('../../data/factionAchievements');
const { titles } = require('../../data/titles');

const achievements = {}; // Primary achievement store
const charAchievements = {}; // Individual achievements
const charTitles = {};
const rewards = {};
let itemGuid;
let mailID = 1; 

const queryAchieves = []; 
const queryRewardMail = [];
const queryMailItems = [];
const queryItemInstances = [];

const transferCredit = async (chars) => {
  // Create achievement store for each character
  chars.forEach(c => charAchievements[c.guid] = {});

  // Get earned achievements from every character
  await getAchievements(chars.map(c => c.guid))
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
    .catch(err => { throw err });

  await getRewards()
    .then(rews => rews.forEach(r => rewards[r.entry] = r))
    .catch(err => { throw err });
  
  // Add item entry to rewards store
  const queryItems = [];
  Object.keys(rewards).forEach(r => { 
    if (rewards[r]['item']) queryItems.push(rewards[r]['item']); 
  });

  // Get topmost item guid
  await getItemGuid()
    .then(guid => itemGuid = guid[0]['guid'] + 1000) // +1000 for newly created characters & overwrites
    .catch(err => { throw err });

  // Get topmost mail ID
  await getMailIDs()
    .then(mail => { if (mail.length) mailID = mail.pop().id + 3 }) // +3 for new char CE mail
    .catch(err => { throw err });

  // Add achievement credit and rewards for each character
  for (const c of chars) {
    const charAchieves = { ...achievements };
    charTitles[c.guid] = c.knownTitles;
    for (const a of Object.keys(charAchieves)) {
      const factAchieves = factionAchievements[a];
      const correctFaction = factAchieves && factAchieves.faction === getFaction(c.race);
      const incorrectFaction = factAchieves && factAchieves.faction !== getFaction(c.race);

      if (correctFaction) {
        // Delete opposing faction version of achievement
        if (charAchieves[factAchieves.alt]) delete charAchieves[factAchieves.alt];

        queryAchieves.push([c.guid, Number(a), charAchieves[a]]);
        handleReward(c, a);
      } else if (incorrectFaction) {
        // Delete opposing faction version of achievement, add correct version
        if (!charAchieves[factAchieves.alt]) charAchieves[factAchieves.alt] = charAchieves[a];
        delete charAchieves[a];

        queryAchieves.push([c.guid, Number(factAchieves.alt), charAchieves[factAchieves.alt]]);
        handleReward(c, factAchieves.alt);
      } else {
        queryAchieves.push([c.guid, Number(a), charAchieves[a]]);
        handleReward(c, a);
      }
    }
  }

  // Add all credit and rewards to database
  if (queryAchieves.length) {
    await addAchievements(queryAchieves).catch(err => { throw err });
  }

  if (queryRewardMail.length) {
    await addRewardMail(queryRewardMail).catch(err => { throw err });
    
  }
  
  if (queryMailItems.length) {
    await addRewardItems(queryMailItems).catch(err => { throw err });
    
  }

  if (queryItemInstances.length) {
    await addItemInstances(queryItemInstances).catch(err => { throw err });
  }
  
  for (const char of Object.keys(charTitles)) {
    await addRewardTitles(char, charTitles[char]).catch(err => { throw err });
  }

  console.log('All achievement title rewards successfully transferred!');
}

const handleReward = (char, achievement) => {
  if (charAchievements[char.guid][achievement] || !rewards[achievement]) return;
  charAchievements[char.guid][achievement] = achievements[achievement];
  const rew = rewards[achievement];
  if (rew.sender) createMailQuery(char.guid, rew);
  if (rew.title_A || rew.title_H) createTitleQuery(char.guid, char.gender, getFaction(char.race), achievement);
}

const createMailQuery = (char, reward) => {
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
    date.getTime()/1000 + 7776000, // expire_time | 7776000 = 90 days
    date.getTime()/1000, // deliver_time
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

const createTitleQuery = (char, gender, faction, achievement) => {
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
