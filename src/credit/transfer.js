/* 
get all non-bot accounts
go through each account and:
  get each character guid
  create object to track achievements on account
  if timestamp of current achievement is older, replace in obj
  once every character's achievements have been added:
    go through every player again and for each player:
      go through achievements and check to see if current character has it
      add it if not 
  
NEED TO ACCOUNT FOR FACTION SPECIFIC ACHIEVEMENTS
*/

const { getAccounts } = require('../queries/wotlkrealmd');
const { getCharacter } = require('../queries/wotlkcharacters');

const accounts = {};
const achievements = {};

const transfer_credit = async () => {
  
  console.log('Credit transfer called! ', await getAccounts())
}

module.exports = { transfer_credit: transfer_credit };
