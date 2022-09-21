// Data
const { titles } = require('../data/titles');

// Database
const {
  addRewardTitles,
  getMailIDs,
  addRewardMail,
  addRewardItems,
  getItemGuid,
  addItemInstances
} = require('../db/wotlkcharacters');
const { getRewards, getItemCharges } = require('../db/wotlkmangos');

// Utils
const { getFaction } = require('./utils');


let itemGuid = 1, mailID = 1;
const rewards = {};
const itemCharges = {};

const queryCharTitles = {};
const queryItemTypes = {};
const queryRewardMail = [];
const queryMailItems = [];
const queryItemInstances = [];

const transferRewards = async (achievements) => {
  console.log('Achievement reward transfer started!');

  // Store known titles
  achievements.forEach(a => {
    if (!queryCharTitles[a[0]['guid']]) {
      queryCharTitles[a[0]['guid']] = a[0]['knownTitles'];
    }
  });

  // Get all rewards from world database
  await getRewards()
    .then(rews => rews.forEach(r => {
      const { entry, ...rew } = r;
      rewards[entry] = rew;
      if (r.item && !queryItemTypes[r.item]) queryItemTypes[r.item] = 1;
    }))
    .catch(err => { throw err });

  // Get item charges to ensure mounts and pets work correctly
  await getItemCharges(Object.keys(queryItemTypes))
    .then(items => items.forEach(i => itemCharges[i.entry] = i.spellcharges_1))
    .catch(err => { throw err });

  // Get topmost item guid & mail ID
  await getItemGuid()
    .then(guid => itemGuid = guid[0]['guid'] + 10000) // +10000 to buffer overwrites
    .catch(err => { throw err });
    
  await getMailIDs()
    .then(mail => mailID = mail[0]['id'] + 10000) // +10000 to buffer overwrites
    .catch(err => { throw err });

  // Run sub-transfer
  achievements.forEach(a => transferReward(a[0], a[1]));

  // Run database queries
  const newCharTitles = Object.keys(queryCharTitles).length;
  if (newCharTitles) await addRewardTitles(queryCharTitles).catch(err => { throw err });
  if (queryItemInstances.length) await addItemInstances(queryItemInstances).catch(err => { throw err });
  if (queryMailItems.length) await addRewardItems(queryMailItems).catch(err => { throw err });
  if (queryRewardMail.length) await addRewardMail(queryRewardMail).catch(err => { throw err });
}

const transferReward = (char, achievement) => {
  const rew = rewards[achievement];
  if (!rew && !titles[achievement]) return;
  const faction = getFaction(char.race);
  if (rew && rew.sender) transferMail(char.guid, rew);
  if (titles[achievement]) transferTitle(char.guid, char.gender, faction, achievement);
}

const transferMail = (char, rew) => {
  const date = new Date();
  queryRewardMail.push([
    mailID, // id
    3, // messageType
    41, // stationery
    0, // mailTemplateId
    rew.sender, // sender
    char, // receiver
    rew.subject, // subject
    rew.text, // body
    1, // has_items
    date.getTime() / 1000 + 7776000, // expire_time | 7776000 = 90 days
    date.getTime() / 1000, // deliver_time
    0, // money
    0, // cod
    0, // checked
  ]);
  
  if (rew.item) {
    queryMailItems.push([mailID, itemGuid, rew.item, char]);
    queryItemInstances.push([
      itemGuid, // guid
      char, // owner_guid
      rew.item, // itemEntry
      0, // creatorGuid
      0, // giftCreatorGuid
      1, // count
      0, // duration
      `${itemCharges[rew.item]} 0 0 0 0`, // charges
      0, // flags
      '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ', // enchantments
      0, // randomPropertyId
      0, // durability
      0, // playedTime
      '' // text
    ]);
  }
  
  itemGuid++;
  mailID++;
}

const transferTitle = (char, gender, faction, achievement) => {
  const knownTitles = queryCharTitles[char].split(' ').map(t => Number(t));
  let id = titles[achievement]['TitleID'];
  let order = titles[achievement]['IGO'];

  // Remove last value if char titles never transferred, an extra gets added due to extra space
  if (knownTitles.length === 7) knownTitles.pop();

  // Handle unique titles
  if (achievement === 870) { // of the Alliance | of the Horde
    id = faction === 'A' ? id[0] : id[1];
    order = faction === 'A' ? order[0] : order[1];
  } else if (achievement === 1793) { // Patron | Matron
    id = gender === 0 ? id[0] : id[1];
    order = gender === 0 ? order[0] : order[1];
  }

  const titleIndex = Number((order / 32).toString()[0]);
  const bit = 2 ** (order % 32);
  knownTitles[titleIndex] = knownTitles[titleIndex] + bit;
  queryCharTitles[char] = knownTitles.join(' ');
}

module.exports = { transferRewards: transferRewards };
