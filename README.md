# Single Player Project - Account-wide Achievements
This program transfers achievement credit, rewards, and progress between all characters!

Made to use with Celguar's SPP Classics Repack, but is CMaNGOS based so it will likely work with other CMaNGOS repacks/forks.

## Features 
- Transfers achievement credit between all player characters
  - Achievements that have been earned on any player character are shared between all other characters
  - Faction specific achievements are converted depending on each character's faction
  - Achievements transferred to characters will display the earliest date if earned on multiple characters
  - Achievements won't be overwritten on any characters

- Transfers achievement rewards between all player characters
  - Every new achievement transferred also grants its corresponding title and/or item rewards
  - Faction specific rewards are converted depending on each character's faction
  - Feats of strength that don't explicitly reward titles but are title related (Vanilla PVP titles, Scarab Lord, etc.) are rewarded when shared.
  - All item rewards will appear in each character's mailbox on login 

- Transfers achievement progress for select achievements between all player characters
  - Progress for the following achievements/achievement chains are shared between all characters, regardless of faction
  
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
    - Loremaster of Eastern Kingdoms (Progress tracked separately by faction)
    - Loremaster of Kalimdor (Progress tracked separately by faction)
    
  - If the combined progress for an achievement is greater than the required progress, the achievement and reward will be added
  - Honorable kill count is shared between all characters

- All player accounts and characters are affected, so the player can share between multiple accounts if they want to play more than 10 characters
  - Bot accounts are ignored
  
- Cut title content has been restored, including Realm First titles and 'the Flawless Victor'
  
## Warnings/Limitations:
  - Always make a backup save before transferring
  - Must be logged out before transferring
  - You will no longer be able to see individual honorable kills per character, as they need to be shared in order for the in-game achievement counter to work properly
  - It is HIGHLY recommended to retrieve item rewards from mail immediately after transfer, in order to reduce risk of mail being lost
  - Newly created characters must be logged in at least once in order to be included in the transfer
  - In-game progress counters do not work properly for 'X Quests Complete', 'Loremaster of the Eastern Kingdoms', and 'Loremaster of Kalimdor'
    - Unless playing a Blood Elf or Draenei, the in-game progress counters for these achievements may not update after completing eligible quests, but progress will still be counted and the in-game counter will be updated next time the user runs the transfer
  - Progress for Isle of Conquest and Wintergrasp Veteran achievements currently unavailable, will be updated once they're playable
  - Progress for Looking for More, Many, and Multitudes achievements currently unavailable, will be updated once LFG is usable with solo queue

## Installation:
### For Users
Download latest release, save anywhere 
  
### For Devs
```
npm install
```

## Usage:
### For Users
If using outside of the spp-classics repack menu:
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
  
  
TODO: 
- Account-wide pets
- Account-wide mounts

- Mountain o' Mounts
- X Tabards
- X Pets

- Well Read?
- Higher Learning?
- It's Happy Hour Somewhere?
- Tastes Like Chicken?
