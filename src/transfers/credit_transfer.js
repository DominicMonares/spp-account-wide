const { getAchievements, addAchievements } = require('../queries/wotlkcharacters');
const { factionAchievements } = require('../data/factionAchievements');

let achievements = {};

const transfer_credit = async (characters, wotlkcharacters) => {
  if (Object.keys(achievements).length) { achievements = {} }
  
  const allAchievements = await getAchievements(characters.map(c => c.guid), wotlkcharacters);
  await allAchievements.forEach(a => {
    if (!achievements[a.achievement]) {
      achievements[a.achievement] = a.date;
      return;
    }

    if (a.date < achievements[a.achievement]) {
      achievements[a.achievement] = a.date;
    }
  });
  
  await characters.forEach(async c => {
    const charAchievements = { ...achievements };
    const queryAchievements = [];

    // Check for faction-specific achievements
    for (const a in charAchievements) {
      const fAchievement = factionAchievements[a];
      if (fAchievement && fAchievement.faction === c.faction) {
        // Remove opposing faction version of this achievement
        if (charAchievements[fAchievement.alt]) {
          delete charAchievements[fAchievement.alt];
        }

        queryAchievements.push([c.guid, Number(a), charAchievements[a]]);
      } else if (fAchievement && fAchievement.faction !== c.faction) {
        // Add correct faction version if it doesn't exist, remove this version
        if (!charAchievements[fAchievement.alt]) {
          charAchievements[fAchievement.alt] = charAchievements[a];
        }
        
        delete charAchievements[a];
        queryAchievements.push([c.guid, Number(fAchievement.alt), charAchievements[fAchievement.alt]]);
      } else {
        queryAchievements.push([c.guid, Number(a), charAchievements[a]]);
      }
    }

    await addAchievements(queryAchievements);
  });



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
