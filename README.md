# Single Player Project - Account-wide Achievements
This program transfers achievement credit, rewards, and progress between all characters!

Made to use with Celguar's SPP Classics Repack, but is CMaNGOS based so it may work with other CMaNGOS repacks/forks.

Features: 
- Transfers achievement credit between all player characters
  - Achievements that have been earned on any player character are shared between all other characters
  - Faction specific achievements are converted depending on each character's faction
  - Achievements transferred to characters will display the earliest date if earned on multiple characters
  - Achievements won't be overwritten on any characters

- Transfers achievement rewards between all player characters
  - Every new achievement transferred also grants its corresponding title and/or item rewards
  - Faction specific rewards are converted depending on each character's faction
  - Feat of strength titles that don't explicity reward titles but are title related (Vanilla PVP titles, world first titles, Scarab Lord, etc.) are rewarded when shared.
  - All item rewards will appear in each character's mailbox on login 

- Transfers achievement progress for select achievements between all player characters
  - Progress for the following achievements are shared between all characters, regardless of faction
    - ENTER ACHIEVES
  - If the combined progress for an achievement is greater than the required progress, the achievement and reward will be added
  - Honorable kill count is shared between all characters

- All player accounts and characters are affected, so the player can share between multiple accounts if they want to play more than 10 characters
  - Bot accounts are ignored
  

Usage:
  - For users
  - For devs

Installation:
  - For users
  - For devs
  
Warnings/Limitations:
  - Always make a backup save before transferring
  - Must be logged out before transferring
  - It is HIGHLY recommended to retrieve item rewards from mail immediately after transfer, in order to reduce risk of mail being lost
  - Newly created characters must be logged in at least once in order to be included in the transfer
  - In-game progress counters do not work properly for 'X Quests Complete', 'Loremaster of the Eastern Kingdoms', and 'Loremaster of Kalimdor'
    - Unless playing a Blood Elf or Draenei, the in-game progress counters for these achievements may not update after completing eligible quests, but progress will still be counted and the in-game counter will be updated next time the user runs the transfer
  - HONORABLE KILL WARNING?



TODO: 
- Add Bread Winner achievement
- Add rewards for World First Titles
- Account-wide pets/mounts
- Double check that rewards are being added if achievement earned after progress transfer
- Check to see if honorable kills are updated in statistics tab, if not, players can still track individual char kills there
