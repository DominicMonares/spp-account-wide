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
  await wotlkcharactersConnect().catch(async err => await error(err));
  await wotlkmangosConnect().catch(async err => await error(err));
  await wotlkrealmdConnect().catch(async err => await error(err));

  const accounts = await getAccounts()
    .then(async accts => accts.length ? accts : await error('No player accounts found...'))
    .catch(async err => await error(err));

  const characters = await getCharacters(accounts)
    .then(async chars => {
      if (chars.length) {
        // Exclude newly created characters that haven't logged in for the first time yet
        return chars.filter(c => c.totaltime === 0 ? false : true);
      } else {
        await error('No player characters found...');
      }
    })
    .catch(async err => await error(err));

  await transferCredit(characters).catch(async err => await error(err));
  console.log('Achievement credit transfer complete!');

  await transferProgress(characters).catch(async err => await error(err));
  console.log('Achievement progress transfer complete!');

  await wotlkcharactersClose().catch(async err => await error(err));
  await wotlkmangosClose().catch(async err => await error(err));
  await wotlkrealmClose().catch(async err => await error(err));
  console.log('Successfully completed all transfers!');

  await closeWindow();
}

// UNCOMMENT FOR PRODUCTION
accountwideAchievements();

// REMOVE EXPORTS FOR PRODUCTION
// module.exports = {
//   accountwideAchievements: accountwideAchievements
// };
