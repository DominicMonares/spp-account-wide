const { 
  progressTableExists,
  createProgressTable
} = require('../db/wotlkcharacters');
const { error } = require('../utils');

/*
690 = H
1101 = A
0
Query db to get quests completed from all characters
Query db to get all quests
Filter by faction similar to achievements
if faction matches and quest is non class specific, add to progress
*/

const transferProgress = async (chars, wotlkcharacters) => {
  const progressTable = await progressTableExists(wotlkcharacters).catch(err => error(err));
  if (!progressTable) await createProgressTable(wotlkcharacters).catch(err => error(err));

  // check to see if achievement already earned
  // add progress
  
}

module.exports = { transferProgress: transferProgress };
