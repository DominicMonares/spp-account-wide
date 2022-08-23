/*
  call credit transfer
  call progress transfer
  settimeout for 10 sec:
    success message
    end process 0

  all errors will:
    end function(s)
    settimeout for 10 minutes:
      detailed error message
      end process 1? (double check best practice exit code)
*/

const { getAccounts } = require('./queries/wotlkrealmd');
const { closeWindow } = require('./queries/helpers');
const { transfer_credit } = require('./credit/transfer');
const { transfer_progress } = require('./progress/transfer');
const { getCharacters } = require('./queries/wotlkcharacters');

const store = {
  accounts: {}
};

const transfer_achievements = async () => {
  const accounts = await getAccounts();
  accounts.forEach(a => store['accounts'][a.id] = {});
  
  const characters = await getCharacters(Object.keys(store.accounts));
  characters.forEach(c => store['accounts'][c.account][c.guid] = {});
  
  await transfer_credit(store.accounts);
  await transfer_progress(store.accounts);

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
