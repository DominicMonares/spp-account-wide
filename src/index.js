const { getAccounts, wotlkrealmdConnect } = require('./db/wotlkrealmd');
const { getCharacters, wotlkcharactersConnect } = require('./db/wotlkcharacters');
const { wotlkmangosConnect } = require('./db/wotlkmangos');
const { closeWindow, error } = require('./utils');
const { transferCredit } = require('./transfers/creditTransfer');
const { transferProgress } = require('./transfers/progressTransfer');

const accountwideAchievements = async () => {
  const wotlkcharacters = await wotlkcharactersConnect().catch(err => error(err));
  const wotlkmangos = await wotlkmangosConnect().catch(err => error(err));
  const wotlkrealmd = await wotlkrealmdConnect().catch(err => error(err));

  const accounts = await getAccounts(wotlkrealmd).catch(err => error(err));
  const characters = await getCharacters(accounts, wotlkcharacters).catch(err => error(err));

  await transferCredit(characters, wotlkcharacters, wotlkmangos)
    .then(res => console.log('Credit successfully transferred!'))
    .catch(async err => await error(err));

  // await transferProgress(a, wotlkcharacters);

  await wotlkcharacters.end();
  await wotlkmangos.end();
  await wotlkrealmd.end();
  console.log('Disconnected from wotlkcharacters, wotlkmangos, and wotlkrealmd...');
  console.log('Successfully completed all transfers!');
  closeWindow(61);
}

// UNCOMMENT FOR PRODUCTION
// accountwideAchievements();

// REMOVE EXPORTS FOR PRODUCTION
module.exports = { 
  accountwideAchievements: accountwideAchievements 
};
