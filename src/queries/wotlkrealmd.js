const mysql = require('mysql2/promise');

const getAccounts = (wotlkrealmd) => {
  const accountQuery = 'SELECT id FROM account WHERE username NOT LIKE "%RNDBOT%"';
  return wotlkrealmd.execute(accountQuery)
    .then(res => {
      console.log('Account data fetched...');
      return res[0]}
    )
    .catch(err => { throw err });
}

module.exports = {
  getAccounts: getAccounts
};
