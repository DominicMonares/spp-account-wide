// Database
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

// Transfers
const { transferCredit } = require('./transfers/creditTransfer');
const { transferProgress } = require('./transfers/progressTransfer');

// Utils
const { closeWindow, error } = require('./utils');


const accountwideAchievements = async () => {
  await wotlkcharactersConnect().catch(err => error(err));
  await wotlkmangosConnect().catch(err => error(err));
  await wotlkrealmdConnect().catch(err => error(err));

  const accounts = await getAccounts()
    .then(accts => accts.length ? accts : error('No player accounts found...'))
    .catch(err => error(err));

  const characters = await getCharacters(accounts)
    .then(chars => {
      if (chars.length) {
        // Exclude newly created characters that haven't logged in for the first time yet
        return chars.filter(c => c.totaltime === 0 ? false : true);
      } else {
        error('No player characters found...');
      }
    })
    .catch(err => error(err));

  await transferCredit(characters)
    .then(console.log('Credit successfully transferred!'))
    .catch(err => error(err));

  await transferProgress(characters)
    .then(console.log('Progress successfully transferred!'))
    .catch(err => error(err));

  await wotlkcharactersClose().catch(err => error(err));
  await wotlkmangosClose().catch(err => error(err));
  await wotlkrealmClose().catch(err => error(err));
  console.log('Successfully completed all transfers!');
  closeWindow(1);
}

// UNCOMMENT FOR PRODUCTION
// accountwideAchievements();

// REMOVE EXPORTS FOR PRODUCTION
module.exports = {
  accountwideAchievements: accountwideAchievements
};
