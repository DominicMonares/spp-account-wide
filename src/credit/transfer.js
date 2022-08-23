const { getAchievements } = require('../queries/wotlkcharacters');

let achievements = {};

const transfer_credit = async (characters, wotlkcharacters) => {
  if (Object.keys(achievements).length) { achievements = {} }
  const allAchievements = await getAchievements(characters.map(c => c.id), wotlkcharacters);
  allAchievements.forEach(a => {
    if (!achievements[a.achievement]) {
      achievements[a.achievement] = a.date;
      return;
    }

    if (a.date < achievements[a.achievement]) {
      achievements[a.achievement] = a.date;
    }
  })
  console.log('achievements ', allAchievements)
  console.log('CHEEVOS ', achievements);
  // accounts.forEach(a => achievements[a.id] = {});
  // console.log('Credit transfer called! ', achievements)
  
}

module.exports = { 
  transfer_credit: transfer_credit 
};
