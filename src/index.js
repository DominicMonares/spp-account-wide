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
const { 
  wotlkmangosConnect, 
  cutTitlesExist,
  addCutTitles,
  wotlkmangosClose 
} = require('./db/wotlkmangos');

// Transfers
const { transferCredit } = require('./transfers/creditTransfer');
const { transferProgress } = require('./transfers/progressTransfer');
const { transferPetsMounts } = require('./transfers/petsMountsTransfer');

// Utils
const { closeWindow, error, getFaction } = require('./utils');


const charFactions = {};

const accountwideTransfer = async () => {
  // Connect to databases
  await wotlkcharactersConnect().catch(async err => await error(err));
  await wotlkmangosConnect().catch(async err => await error(err));
  await wotlkrealmdConnect().catch(async err => await error(err));

  // Restore cut content if it doesn't already exist
  await cutTitlesExist().catch(async err => await error(err));
  await addCutTitles().catch(async err => await error(err));

  // Get accounts and characters
  const accounts = await getAccounts()
    .then(async accts => accts.length ? accts : await error('No player accounts found...'))
    .catch(async err => await error(err));

  const characters = await getCharacters(accounts)
    .then(async chars => {
      if (chars.length) {
        // Exclude newly created characters that haven't logged in for the first time yet
        const validChars = chars.filter(c => c.totaltime === 0 ? false : true);
        validChars.forEach(c => charFactions[c.guid] = { faction: getFaction(c.race) });
        return validChars;
      } else {
        await error('No player characters found...');
      }
    })
    .catch(async err => await error(err));

  // Run transfers
  await transferCredit(characters).catch(async err => await error(err));
  console.log('Achievement credit transfer complete!');

  await transferProgress(characters).catch(async err => await error(err));
  console.log('Achievement progress transfer complete!');

  await transferPetsMounts(charFactions).catch(async err => await error(err));
  console.log('Pet & Mount transfer complete!');

  // Disconnect from databases and close
  await wotlkcharactersClose().catch(async err => await error(err));
  await wotlkmangosClose().catch(async err => await error(err));
  await wotlkrealmClose().catch(async err => await error(err));
  console.log('Successfully completed all transfers!');

  await closeWindow();
}

// ONLY USED FOR PRODUCTION
accountwideTransfer();

// ONLY USED FOR DEVELOPMENT
// module.exports = { accountwideTransfer: accountwideTransfer };
