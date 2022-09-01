const { getAchievements, addAchievements } = require('../db/wotlkcharacters');
const { getRewards } = require('../db/wotlkmangos');
const { factionAchievements } = require('../data/factionAchievements');
const { error } = require('../utils');

const achievements = {};
const rewards = {};
const queryAchieves = [];
const queryRewardMail = [];

const transferCredit = async (chars, wotlkcharacters, wotlkmangos) => {
  await getAchievements(chars.map(c => c.guid), wotlkcharacters)
    .then(charAchievements => charAchievements.forEach(a => {
      if (!achievements[a.achievement]) return achievements[a.achievement] = a.date;
      if (a.date < achievements[a.achievement]) achievements[a.achievement] = a.date;
    }))
    .catch(err => error(err));

  await getRewards(wotlkmangos)
    .then(rews => rews.forEach(r => rewards[r.entry] = r))
    .catch(err => error(err));

  for (const c of chars) {
    const charAchieves = { ...achievements };

    for (const a in charAchieves) {
      const factionAchieves = factionAchievements[a];
      const correctFaction = factionAchieves && factionAchieves.faction === c.faction;
      const incorrectFaction = factionAchieves && factionAchieves.faction !== c.faction;

      if (correctFaction) {
        if (charAchieves[factionAchieves.alt]) delete charAchieves[factionAchieves.alt];
        queryAchieves.push([c.guid, Number(a), charAchieves[a]]);
        await handleReward().catch(err => error(err));
      } else if (incorrectFaction) {
        if (!charAchieves[factionAchieves.alt]) charAchieves[factionAchieves.alt] = charAchieves[a];
        delete charAchieves[a];
        queryAchieves.push([c.guid, Number(factionAchieves.alt), charAchieves[factionAchieves.alt]]);
        await handleReward().catch(err => error(err));
      } else {
        queryAchieves.push([c.guid, Number(a), charAchieves[a]]);
        await handleReward().catch(err => error(err));
      }
    }
  }

  await addAchievements(queryAchieves, wotlkcharacters).catch(err => error(err));
}



const handleReward = async (achievement, character) => {
  // handle titles and mail

  // this.queryRewardMail.push()

  // console.log('TETETE ', this.queryRewardMail)

  /*
  NOTES ON TITLES

  0 0 0 16384 0 0 | Jenkins only
  0 0 0 24576 0 0 | Jenkins and the Undying

  Jenkins
  110 / 32 = 3.4375
  
  the Undying

  
  */
}

module.exports = {
  transferCredit: transferCredit
};
