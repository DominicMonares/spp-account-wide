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
const { error, faction } = require('../utils');
const { factionAchievements } = require('../data/factionAchievements');
const { titles } = require('../data/titles');

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

const transferCredit = async (chars, wotlkcharacters, wotlkmangos) => {
  // Create achievement store for each character
  chars.forEach(c => charAchievements[c.guid] = {});

  // Get earned achievements from every character
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
  
  // Add item entry to rewards store
  const queryItems = [];
  Object.keys(rewards).forEach(r => { 
    if (rewards[r]['item']) queryItems.push(rewards[r]['item']); 
  });

  // Get topmost item guid
  await getItemGuid(wotlkcharacters)
    .then(guid => itemGuid = guid[0]['guid'] + 40000) // +40k to account for newly created characters
    .catch(err => error(err));

  console.log('GASDF ', itemGuid)

  // Get topmost mail ID
  await getMailIDs(wotlkcharacters)
    .then(mail => { if (mail.length) mailID = mail.pop().id })
    .catch(err => error(err));

  // Add achievement credit and rewards for each character
  for (const c of chars) {
    const charAchieves = { ...achievements };
    charTitles[c.guid] = c.knownTitles;
    for (const a of Object.keys(charAchieves)) {
      const factAchieves = factionAchievements[a];
      const correctFaction = factAchieves && factAchieves.faction === faction(c.race);
      const incorrectFaction = factAchieves && factAchieves.faction !== faction(c.race);

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
  await addAchievements(queryAchieves, wotlkcharacters).catch(err => error(err));
  console.log('Achievement credit successfully transferred!');

  if (queryRewardMail.length) {
    await addRewardMail(queryRewardMail, wotlkcharacters).catch(err => error(err));
    console.log('Achievement mail successfully transferred!');
  }
  
  if (queryMailItems.length) {
    await addRewardItems(queryMailItems, wotlkcharacters).catch(err => error(err));
    console.log('Achievement mail items successfully transferred!');
  }

  if (queryItemInstances.length) {
    await addItemInstances(queryItemInstances, wotlkcharacters).catch(err => error(err));
    console.log('Item instances successfully transferred!');
  }
  
  for (const char of Object.keys(charTitles)) {
    await addRewardTitles(char, charTitles[char], wotlkcharacters).catch(err => error(err));
  }
  console.log('Achievement title rewards successfully transferred!');
}

const handleReward = (char, achievement) => {
  if (charAchievements[char.guid][achievement] || !rewards[achievement]) return;
  charAchievements[char.guid][achievement] = achievements[achievement];
  const rew = rewards[achievement];
  if (rew.sender) addMail(char.guid, rew);
  if (rew.title_A || rew.title_H) addTitle(char.guid, char.gender, faction(char.race), achievement);
}

const addMail = (char, reward) => {
  const date = new Date();
  
  queryRewardMail.push([
    mailID + 1, // id
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

  console.log('REWARD MAIL ', queryRewardMail)
  
  queryMailItems.push([mailID + 1, itemGuid, reward.item, char]);

  queryItemInstances.push([
    itemGuid, // guid
    0, // owner_guid
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
