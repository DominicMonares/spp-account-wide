const { getAccounts, wotlkrealmdConnect } = require('./db/wotlkrealmd');
const { getCharacters, wotlkcharactersConnect } = require('./db/wotlkcharacters');
const { closeWindow, error, faction } = require('./helpers');
const { transfer_credit } = require('./transfers/credit_transfer');
const { transfer_progress } = require('./transfers/progress_transfer');

const store = { accounts: {} };
const transfer_achievements = async () => {
  const wotlkcharacters = await wotlkcharactersConnect();
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

  const accounts = Object.values(store.accounts);
  for (let a of accounts) {
    await transfer_credit(a.characters, wotlkcharacters)
      .then(res => console.log('Credit successfully transferred!'))
      .catch(async err => await error(err));

    // await transfer_progress(a, wotlkcharacters);

    console.log(`Account ${a.username} complete!`);
  }

  await wotlkcharacters.end();
  await wotlkrealmd.end();
  console.log('Disconnected from wotlkcharacters and wotlkrealmd...');
  console.log('Successfully completed all transfers!');
  closeWindow(61);
}

transfer_achievements();

// REMOVE EXPORTS FOR PRODUCTION
module.exports = { 
  transfer_achievements: transfer_achievements 
};
