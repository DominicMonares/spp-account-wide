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

  // go through each character one by one
  // make copy of all achievements
  // check faction
  // convert/delete achievements as necessary
  // insert ignore achieves

  // HANDLE REWARDS!!!
}

module.exports = { 
  transfer_credit: transfer_credit 
};
