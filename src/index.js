const mysql = require('mysql2/promise');

const { dbCredentials } = require('./config');
const { getAccounts } = require('./queries/wotlkrealmd');
const { closeWindow, faction } = require('./helpers');
const { transfer_credit } = require('./credit/transfer');
const { transfer_progress } = require('./progress/transfer');
const { getCharacters } = require('./queries/wotlkcharacters');

const wotlkcharactersConnect = async () => {
  dbCredentials.database = 'wotlkcharacters';
  let connection;

  try {
    connection = await mysql.createConnection(dbCredentials);
    console.log('Connected to wotlkcharacters...');
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err); 
  }

  return connection;
}

const wotlkrealmdConnect = async () => {
  dbCredentials.database = 'wotlkrealmd';
  let connection;

  try {
    connection = await mysql.createConnection(dbCredentials);
    console.log('Connected to wotlkrealmd...');
  } catch (err) {
    // native error msg printing after error func for some reason, revisit
    await error(err); 
  }

  return connection;
}

const store = {
  accounts: {}
};

const transfer_achievements = async () => {
  const wotlkcharacters = await wotlkcharactersConnect();
  const wotlkrealmd = await wotlkrealmdConnect();

  const accounts = await getAccounts(wotlkrealmd);
  accounts.forEach(a => store['accounts'][a.id] = []);
  
  const characters = await getCharacters(Object.keys(store.accounts), wotlkcharacters);
  characters.forEach(c => store['accounts'][c.account].push({
    id: c.guid, 
    faction: faction(c.race)
  }));

  Object.values(store.accounts).forEach(async account => {
    await transfer_credit(account);
    await transfer_progress(account);
  });

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
