const { getAccounts, wotlkrealmdConnect } = require('./db/wotlkrealmd');
const { wotlkmangosConnect, getRewards } = require('./db/wotlkmangos');
const { getCharacters, wotlkcharactersConnect } = require('./db/wotlkcharacters');
const { closeWindow, error, faction } = require('./helpers');
const { transferCredit } = require('./transfers/creditTransfer');
const { transferProgress } = require('./transfers/progressTransfer');

const store = { accounts: {}, rewards: {} };
const transfer_achievements = async () => {
  const wotlkcharacters = await wotlkcharactersConnect();
  const wotlkmangos = await wotlkmangosConnect();
  const wotlkrealmd = await wotlkrealmdConnect();

  await getAccounts(wotlkrealmd)
    .then(accs => accs.forEach(a => store['accounts'][a.id] = {
      username: a.username,
      characters: []
    }))
    .catch(async err => await error(err));
  
  await getCharacters(Object.keys(store.accounts), wotlkcharacters)
    .then(chars => chars.forEach(c => store['accounts'][c.account]['characters'].push({
      guid: c.guid, 
      name: c.name,
      faction: faction(c.race),
      gender: c.gender,
      knownTitles: c.knownTitles
    })))
    .catch(async err => await error(err));

  await getRewards(wotlkmangos)
    .then(rewards => rewards.forEach(r => store['rewards'][r.entry] = r))
    .catch(async err =>  await error(err));

  const accounts = Object.values(store.accounts);
  for (let a of accounts) {
    await transferCredit(a.characters, store.rewards, wotlkcharacters)
      .then(res => console.log('Credit successfully transferred!'))
      .catch(async err => await error(err));

    // await transferProgress(a, wotlkcharacters);

    console.log(`Account ${a.username} complete!`);
  }

  await wotlkcharacters.end();
  await wotlkmangos.end();
  await wotlkrealmd.end();
  console.log('Disconnected from wotlkcharacters, wotlkmangos, and wotlkrealmd...');
  console.log('Successfully completed all transfers!');
  closeWindow(61);
}

transfer_achievements();

// REMOVE EXPORTS FOR PRODUCTION
module.exports = { 
  transfer_achievements: transfer_achievements 
};
