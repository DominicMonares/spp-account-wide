// { TitleID: InGameOrder }
const titles = {
  442: { TitleID: 1, IGO: 1 }, // Private
  470: { TitleID: 2, IGO: 2 }, // Corporal
  471: { TitleID: 3, IGO: 3 }, // Sergeant
  441: { TitleID: 4, IGO: 4 }, // Master Sergeant
  440: { TitleID: 5, IGO: 5 }, // Sergeant Major
  439: { TitleID: 6, IGO: 6 }, // Knight
  472: { TitleID: 7, IGO: 7 }, // Knight-Lieutenant
  438: { TitleID: 8, IGO: 8 }, // Knight-Captain
  437: { TitleID: 9, IGO: 9 }, // Knight-Champion
  436: { TitleID: 10, IGO: 10 }, // Lieutenant Commander
  435: { TitleID: 11, IGO: 11 }, // Commander
  473: { TitleID: 12, IGO: 12 }, // Marshal
  434: { TitleID: 13, IGO: 13 }, // Field Marshal
  433: { TitleID: 14, IGO: 14 }, // Grand Marshal
  454: { TitleID: 15, IGO: 15 }, // Scout
  468: { TitleID: 16, IGO: 16 }, // Grunt
  453: { TitleID: 17, IGO: 17 }, // Sergeant
  450: { TitleID: 18, IGO: 18 }, // Senior Sergeant
  452: { TitleID: 19, IGO: 19 }, // First Sergeant
  451: { TitleID: 20, IGO: 20 }, // Stone Guard
  449: { TitleID: 21, IGO: 21 }, // Blood Guard
  469: { TitleID: 22, IGO: 22 }, // Legionnaire
  448: { TitleID: 23, IGO: 23 }, // Centurion
  447: { TitleID: 24, IGO: 24 }, // Champion
  444: { TitleID: 25, IGO: 25 }, // Lieutenant General
  446: { TitleID: 26, IGO: 26 }, // General
  445: { TitleID: 27, IGO: 27 }, // Warlord
  443: { TitleID: 28, IGO: 28 }, // High Warlord
  416: { TitleID: 46, IGO: 33 }, // Scarab Lord
  714: { TitleID: 47, IGO: 34 }, // Conqueror
  907: { TitleID: 48, IGO: 35 }, // Justicar
  432: { TitleID: 53, IGO: 36 }, // Champion of the Naaru
  432: { TitleID: 64, IGO: 39 }, // Hand of A'dal
  230: { TitleID: 72, IGO: 41 }, // Battlemaster
  1175: { TitleID: 72, IGO: 41 }, // Battlemaster
  913: { TitleID: 74, IGO: 43 }, // Elder
  1038: { TitleID: 75, IGO: 44 }, // Flame Warden
  1039: { TitleID: 76, IGO: 45 }, // Flame Keeper
  1015: { TitleID: 77, IGO: 46 }, // the Exalted
  46: { TitleID: 78, IGO: 47 }, // the Explorer
  942: { TitleID: 79, IGO: 48 }, // the Diplomat
  943: { TitleID: 79, IGO: 48 }, // the Diplomat
  978: { TitleID: 81, IGO: 42 }, // the Seeker
  1174: { TitleID: 82, IGO: 50 }, // Arena Master
  1516: { TitleID: 83, IGO: 51 }, // Salty
  1563: { TitleID: 84, IGO: 52 }, // Chef
  1784: { TitleID: 84, IGO: 52 }, // Chef
  2762: { TitleID: 113, IGO: 81 }, // of Gnomeregan
  1400: { TitleID: 120, IGO: 88 }, // the Magic Seeker
  2054: { TitleID: 121, IGO: 89 }, // Twilight Vanquisher
  1402: { TitleID: 122, IGO: 90 }, // Conqueror of Naxxramas
  1656: { TitleID: 124, IGO: 92 }, // the Hallowed
  1657: { TitleID: 124, IGO: 92 }, // the Hallowed
  1681: { TitleID: 125, IGO: 93 }, // Loremaster
  1682: { TitleID: 125, IGO: 93 }, // Loremaster
  870: { TitleID: [126, 127], IGO: [94, 95] }, // [of the Alliance, of the Horde]
  1658: { TitleID: 129, IGO: 97 }, // Champion of the Frozen Wastes
  762: { TitleID: 130, IGO: 98 }, // Ambassador
  948: { TitleID: 130, IGO: 98 }, // Ambassador
  945: { TitleID: 131, IGO: 99 }, // the Argent Champion
  953: { TitleID: 132, IGO: 100 }, // Guardian of Cenarius
  1683: { TitleID: 133, IGO: 101 }, // Brewmaster
  1684: { TitleID: 133, IGO: 101 }, // Brewmaster
  1691: { TitleID: 134, IGO: 102 }, // Merrymaker
  1692: { TitleID: 134, IGO: 102 }, // Merrymaker
  1693: { TitleID: 135, IGO: 103 }, // the Love Fool
  1707: { TitleID: 135, IGO: 103 }, // the Love Fool
  1793: { TitleID: [138, 137], IGO: [105, 104] }, // [Patron, Matron]
  456: { TitleID: 139, IGO: 106 }, // Obsidian Slayer
  2051: { TitleID: 140, IGO: 107 }, // of the Nightfall
  2186: { TitleID: 141, IGO: 108 }, // the Immortal
  2187: { TitleID: 142, IGO: 109 }, // the Undying
  2188: { TitleID: 143, IGO: 110 }, // Jenkins
  871: { TitleID: 144, IGO: 111 }, // Bloodsail Admiral
  2336: { TitleID: 145, IGO: 112 }, // the Insane
  2761: { TitleID: 146, IGO: 113 }, // of the Exodar
  2760: { TitleID: 147, IGO: 114 }, // of Darnassus
  2763: { TitleID: 148, IGO: 115 }, // of Ironforge
  2764: { TitleID: 149, IGO: 116 }, // of Stormwind
  2765: { TitleID: 150, IGO: 117 }, // of Orgrimmar
  2766: { TitleID: 151, IGO: 118 }, // of Sen'jin
  2767: { TitleID: 152, IGO: 119 }, // of Silvermoon
  2768: { TitleID: 153, IGO: 120 }, // of Thunder Bluff
  2769: { TitleID: 154, IGO: 121 }, // of the Undercity
  2797: { TitleID: 155, IGO: 122 }, // the Noble
  2798: { TitleID: 155, IGO: 122 }, // the Noble
  2816: { TitleID: 156, IGO: 123 }, // Crusader
  2817: { TitleID: 156, IGO: 123 }, // Crusader
  3117: { TitleID: 158, IGO: 124 }, // Death's Demise
  3259: { TitleID: 159, IGO: 125 }, // the Celestial Defender
  2904: { TitleID: 160, IGO: 126 }, // Conqueror of Ulduar
  2903: { TitleID: 161, IGO: 127 }, // Champion of Ulduar
  3036: { TitleID: 164, IGO: 129 }, // Starcaller
  3037: { TitleID: 165, IGO: 130 }, // the Astral Walker
  3316: { TitleID: 166, IGO: 131 }, // Herald of the Titans
  3478: { TitleID: 168, IGO: 133 }, // the Pilgrim
  3656: { TitleID: 168, IGO: 133 }, // the Pilgrim
  4078: { TitleID: 170, IGO: 135 }, // Grand Crusader
  4080: { TitleID: 171, IGO: 136 }, // the Argent Defender
  4477: { TitleID: 172, IGO: 137 }, // the Patient
  4584: { TitleID: 173, IGO: 138 }, // the Light of Dawn
  4583: { TitleID: 174, IGO: 139 }, // Bane of the Fallen King
  4530: { TitleID: 175, IGO: 140 }, // the Kingslayer
  4597: { TitleID: 175, IGO: 140 }, // the Kingslayer
  4598: { TitleID: 176, IGO: 141 }, // of the Ashen Verdict
};

module.exports = {
  titles: titles
}
