const { 
  wotlkrealmdConnect, 
  getAccounts, 
  wotlkrealmClose 
} = require('./db/wotlkrealmd');
const { 
  wotlkcharactersConnect, 
  getCharacters, 
  wotlkcharactersClose 
} = require('./db/wotlkcharacters');
const { wotlkmangosConnect, wotlkmangosClose } = require('./db/wotlkmangos');
const { closeWindow, error } = require('./utils');
const { transferCredit } = require('./transfers/creditTransfer/creditTransfer');
const { transferProgress } = require('./transfers/progressTransfer/progressTransfer');

const accountwideAchievements = async () => {
  await wotlkcharactersConnect().catch(err => error(err));
  await wotlkmangosConnect().catch(err => error(err));
  await wotlkrealmdConnect().catch(err => error(err));

  const accounts = await getAccounts().catch(err => error(err));
  const characters = await getCharacters(accounts).catch(err => error(err));

  await transferCredit(characters)
    .then(() => console.log('Credit successfully transferred!'))
    .catch(err => error(err));

  await transferProgress(characters)
    .then(() => console.log('Progress successfully transferred!'))
    .catch(err => error(err));

  await wotlkcharactersClose().catch(err => error(err));
  await wotlkmangosClose().catch(err => error(err));
  await wotlkrealmClose().catch(err => error(err));
  console.log('Disconnected from wotlkcharacters, wotlkmangos, and wotlkrealmd...');
  console.log('Successfully completed all transfers!');
  closeWindow(1);
}

// UNCOMMENT FOR PRODUCTION
// accountwideAchievements();

// REMOVE EXPORTS FOR PRODUCTION
module.exports = { 
  accountwideAchievements: accountwideAchievements 
};
