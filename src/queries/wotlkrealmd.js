const getAccounts = (wotlkrealmd) => {
  const sql = 'SELECT id, username FROM account WHERE username NOT LIKE "%RNDBOT%"';
  return wotlkrealmd.execute(sql)
    .then(accounts => {
      console.log('Account data fetched...');
      return accounts[0]}
    )
    .catch(err => { throw err });
}

module.exports = {
  getAccounts: getAccounts
};
