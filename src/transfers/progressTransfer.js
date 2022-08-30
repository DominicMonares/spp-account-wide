/* 
  transfer achievement progress for achievements like:
    x amount of honor kills
    x amount of gold looted
    etc.

  Loremaster? Will be complicated
*/

/*
Got My Mind On My Money
50 Honorable Kills
Mercilessly Dedicated
Alterac Valley Veteran
Arathi Basin Veteran
Eye of the Storm Veteran
Warsong Gulch Veteran
Strand of the Ancients Veteran
Wintergrasp Veteran
Isle of Conquest Victory
25 Dungeon & Raid Emblems
Looking for Multitudes



SEPARATE, MORE SPECIFIC
Loremaster of Eastern Kingdoms
Loremaster of Kalimdor
50 Quests Complete -> batch with Loremaster logic
5 Daily Quests Complete -> same logic as previous, different db queries
Frostbitten
Bloody Rare
40 Exalted Reputations
*/

const transfer_progress = () => {
  console.log('Transfer progress called!')
}

module.exports = { transfer_progress: transfer_progress };
