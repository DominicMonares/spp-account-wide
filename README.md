# Account-wide (WoW Single Player Project)
This program transfers achievements, pets, and mounts between all characters!

The program is made to use with [Celguar's SPP Classics Repack](https://github.com/celguar/spp-classics-cmangos), but is CMaNGOS based so it will likely work with other CMaNGOS repacks or forks.

## Features 
- Affects all player accounts and characters, so you can share between multiple accounts if you want to play more than 10 characters
  - Bot accounts are ignored
  
- Transfers achievement credit between all characters
  - Achievements that have been earned on any character are shared between all other characters
  - Faction specific achievements are converted depending on each character's faction
  - Achievements transferred to characters will use the earliest date if earned on multiple characters
  - Achievements won't be overwritten on any characters

- Transfers achievement rewards between all characters
  - Every new achievement transferred also grants its corresponding title and/or item rewards
  - Faction specific rewards are converted depending on each character's faction
  - Feats of strength that don't explicitly reward titles but are title related (Vanilla PVP titles, Scarab Lord, etc.) are rewarded when shared
  - All item rewards will appear in each character's mailbox on login 

- Transfers achievement progress for select achievements between all characters
  - Achievements and achievement chains include:
    - Got My Mind On My Money (100g - 25,000g)
    - Dungeon & Raid Emblems (25 - 2,500)
    - Mercilessly, Vengefully, and Brutally Dedicated
    - Battleground Veteran
      - Alterac Valley
      - Arathi Basin
      - Eye of the Storm
      - Strand of the Ancients
      - Warsong Gulch
    - Honorable Kills (100 - 100,000)
    - The Bread Winner
    - Daily Quests Complete (5 - 1,000)
    - Quests Complete (50 - 3,000)
    - Loremaster of Eastern Kingdoms (Progress tracked separately for each faction)
    - Loremaster of Kalimdor (Progress tracked separately for each faction)
  - If the combined progress for an achievement is greater than the completion threshold, the achievement and reward will be added
  - Honorable kill count is shared between all characters
  
- Transfers pets and mounts between all characters
  - Pet and mount items are not transferred, only their spells
    - However, if an achievement that rewards a pet or mount is transferred, the item will be available in the mail and the spell will not be transferred
  - Faction specific pets and mounts are converted depending on each character's faction
  - Counts toward Mountain o' Mounts achievement chain
  - Counts toward Lil' Game Hunter achievement chain
  
- Cut title content has been restored, including Realm First titles and 'the Flawless Victor'

## Warnings/Limitations:
  - Always make a backup save before transferring
  - Must be logged out before transferring
  - You will no longer be able to see individual honorable kills per character, as they need to be shared in order for the in-game achievement counter to work properly
  - If your alts are logged in as bots, any progress they make will count toward shared progress
  - Mounts that are above a character's riding skill level are not given to that character on transfer, you will need to re-run the transfer once they have the appropriate riding skill to share those mounts with them
  - It is highly recommended to retrieve item rewards from mail immediately after transfer, in order to reduce risk of mail being lost
  - Only works on characters that have logged in at least once since being created
  - In-game progress counters do not work properly for X Quests Complete, Loremaster of the Eastern Kingdoms, and Loremaster of Kalimdor due to limitations
    - Unless playing a Blood Elf or Draenei, the in-game progress counters for these achievements may not update after completing eligible quests, but progress will still be counted and the in-game counter will be updated next time the user runs the transfer
  - Progress for Isle of Conquest and Wintergrasp Veteran achievements currently unavailable, will be updated once they're playable
  - Progress for Looking for More, Many, and Multitudes achievements currently unavailable, will be updated once LFG is usable with solo queue

## Installation:
### For Users
Download [latest release](https://github.com/akaClay/spp-achievements/releases), save anywhere.
  
### For Devs
```
npm install
```

## Usage:
### For Users
- Ensure that database is running
- Run .exe file
    
### For Devs
Run program:
```
npm start
```
  
Build .exe file:
```
npm run build
```

If testing with a repack or fork other than [Celguar's SPP Classics Repack](https://github.com/celguar/spp-classics-cmangos), be sure to make a database backup and check config.js to ensure database credentials are correct.
