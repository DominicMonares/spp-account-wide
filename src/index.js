const mysql = require('mysql2/promise');

const { dbCredentials } = require('./config');
const { getAccounts } = require('./queries/wotlkrealmd');
const { closeWindow, error, faction } = require('./helpers');
const { transfer_credit } = require('./transfers/credit_transfer');
const { transfer_progress } = require('./transfers/progress_transfer');
const { getCharacters } = require('./queries/wotlkcharacters');

const wotlkcharactersConnect = async () => {
  dbCredentials.database = 'wotlkcharacters';
  return mysql.createConnection(dbCredentials)
    .then(res => {
      console.log('Connected to wotlkcharacters...');
      return res;
    })
    .catch(async err => await error(err));
}

const wotlkrealmdConnect = async () => {
  dbCredentials.database = 'wotlkrealmd';
  return mysql.createConnection(dbCredentials)
    .then(res => {
      console.log('Connected to wotlkrealmd...');
      return res;
    })
    .catch(async err => await error(err));
}

const store = {
  accounts: {}
};

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
      gender: c.gender
    })))
    .catch(async err => await error(err));

  const accounts = Object.values(store.accounts);
  console.log('ACC ', accounts)

  for (let account of accounts) {
    await transfer_credit(account.characters, wotlkcharacters)
      .then(res => console.log('Credit successfully transferred!'))
      .catch(async err => await error(err));

    // await transfer_progress(account, wotlkcharacters);

    console.log(`Account ${account.username} complete!`);
  }

  try {
    await wotlkcharacters.end();
    await wotlkrealmd.end();
    console.log('Disconnected from wotlkcharacters and wotlkrealmd...');
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err);
  }

  console.log(
    'Successfully transferred achievement credit and progress between all of your characters!'
  );

  closeWindow(61);
}

transfer_achievements();

// REMOVE EXPORTS FOR PRODUCTION
module.exports = { 
  transfer_achievements: transfer_achievements 
};
