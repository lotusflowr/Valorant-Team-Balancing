export const players = [
  { //start test case
    caseName: "1 lobby out of 10 players",
    timeSlot: "7pm CEST/8pm WEST",
    playerData: [
      { timestamp:'2024-11-25 16:00:07',discordUsername:"Player1",riotId:'player#001',pronouns:'she/her',currentRank:'Bronze 1',peakRank:'Bronze 1',timeSlots:["7pm CEST/8pm WEST","8pm CEST/9pm WEST"],multipleGames:'yes',willSub:'yes',willHost:'yes',duoRequest:'Player2'},
      { timestamp:'2024-11-25 17:00:07',discordUsername:"Player2",riotId:'player#002',pronouns:'she/her',currentRank:'Silver 1',peakRank:'Silver 1',timeSlots:["7pm CEST/8pm WEST","8pm CEST/9pm WEST"],multipleGames:'yes',willSub:'yes',willHost:'yes',duoRequest:'Player1'},
      { timestamp:'2024-11-25 18:00:07',discordUsername:"Player3",riotId:'player#003',pronouns:'she/her',currentRank:'Gold 1',peakRank:'Gold 1',timeSlots:["7pm CEST/8pm WEST"],multipleGames:'no',willSub:'no',willHost:'no',duoRequest:''},
      { timestamp:'2024-11-25 19:00:07',discordUsername:"Player4",riotId:'player#004',pronouns:'she/her',currentRank:'Platinum 1',peakRank:'Platinum 1',timeSlots:["7pm CEST/8pm WEST","8pm CEST/9pm WEST"],multipleGames:'no',willSub:'no',willHost:'no',duoRequest:''},
      { timestamp:'2024-11-25 20:00:07',discordUsername:"Player5",riotId:'player#005',pronouns:'she/her',currentRank:'Diamond 1',peakRank:'Diamond 1',timeSlots:["7pm CEST/8pm WEST","8pm CEST/9pm WEST"],multipleGames:'yes',willSub:'no',willHost:'no',duoRequest:''},
      { timestamp:'2024-11-25 21:00:07',discordUsername:"Player6",riotId:'player#006',pronouns:'she/her',currentRank:'Ascendant 1',peakRank:'Ascendant 1',timeSlots:["7pm CEST/8pm WEST"],multipleGames:'no',willSub:'yes',willHost:'no',duoRequest:''},
      { timestamp:'2024-11-25 22:00:07',discordUsername:"Player7",riotId:'player#007',pronouns:'she/her',currentRank:'Ascendant 3',peakRank:'Ascendant 3',timeSlots:["7pm CEST/8pm WEST"],multipleGames:'no',willSub:'no',willHost:'yes',duoRequest:''},
      { timestamp:'2024-11-25 23:00:07',discordUsername:"Player8",riotId:'player#008',pronouns:'she/her',currentRank:'Immortal 1',peakRank:'Immortal 1',timeSlots:["7pm CEST/8pm WEST","8pm CEST/9pm WEST"],multipleGames:'yes',willSub:'yes',willHost:'yes',duoRequest:'Player9'},
      { timestamp:'2024-11-26 00:00:07',discordUsername:"Player9",riotId:'player#009',pronouns:'she/her',currentRank:'Immortal 2',peakRank:'Immortal 3',timeSlots:["7pm CEST/8pm WEST"],multipleGames:'no',willSub:'no',willHost:'yes',duoRequest:'Player8'},
      { timestamp:'2024-11-26 01:00:07',discordUsername:"Player10",riotId:'player#0010',pronouns:'she/her',currentRank:'Immortal 3',peakRank:'Radiant',timeSlots:["7pm CEST/8pm WEST","8pm CEST/9pm WEST"],multipleGames:'no',willSub:'no',willHost:'yes',duoRequest:''},
    ],
    expectedData: {
        possiblePlayers: ['Player1','Player2','Player3','Player4','Player5','Player6','Player7','Player8','Player9','Player10'],
        priorityPlayers: ['Player3','Player6','Player7','Player9'],
        lobbyCount: 1,
    }
  }, //end test case
/*
  { //start test case
    caseName: "1 lobby out of 11 players (one player isn't in chosen time slot)",
    timeSlot: "7pm CEST/8pm WEST",
    players: [
    ],
    expectResults: {
        possiblePlayers: [],
        priorityPlayers: [],
        lobbyCount: 1,
    }
  } //end test case
  { //start test case
    caseName: "2 lobbies out of 28 players",
    timeSlot: "7pm CEST/8pm WEST",
    players: [
      { discordUsername: "mysticwolf", duo: "crimsonblade", currentRank: 'Platinum 1', peakRank: 'Diamond 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "blazingstar", duo: "", currentRank: 'Ascendant 1', peakRank: 'Ascendant 3', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "nightfalcon", duo: "", currentRank: 'Bronze 3', peakRank: 'Silver 2', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "stardust", duo: "", currentRank: 'Gold 3', peakRank: 'Platinum 3', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "quicksilver", duo: "", currentRank: 'Diamond 2', peakRank: 'Ascendant 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "crimsonblade", duo: "mysticwolf", currentRank: 'Silver 1', peakRank: 'Gold 2', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "shadowwalker", duo: "", currentRank: 'Platinum 2', peakRank: 'Diamond 2', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "radiantphoenix", duo: "", currentRank: 'Gold 2', peakRank: 'Platinum 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "darkknight", duo: "", currentRank: 'Bronze 1', peakRank: 'Silver 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "lunarflare", duo: "", currentRank: 'Ascendant 2', peakRank: 'Ascendant 3', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "aurorasky", duo: "", currentRank: 'Diamond 1', peakRank: 'Diamond 3', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "thundercat", duo: "", currentRank: 'Silver 3', peakRank: 'Gold 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "starfighter", duo: "moonshadow", currentRank: 'Platinum 3', peakRank: 'Diamond 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "moonshadow", duo: "starfighter", currentRank: 'Ascendant 1', peakRank: 'Ascendant 2', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "firestorm", duo: "", currentRank: 'Ascendant 1', peakRank: 'Immortal 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "silentshadow", duo: "", currentRank: 'Bronze 2', peakRank: 'Silver 3', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "blazingnova", duo: "", currentRank: 'Gold 1', peakRank: 'Gold 3', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "echohawk", duo: "shadowphoenix", currentRank: 'Silver 2', peakRank: 'Gold 2', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "radiantstorm", duo: "", currentRank: 'Diamond 3', peakRank: 'Ascendant 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "ghostblade", duo: "", currentRank: 'Gold 3', peakRank: 'Platinum 2', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "starshatter", duo: "firestorm", currentRank: 'Ascendant 1', peakRank: 'Ascendant 2', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "frostfang", duo: "radiantstorm", currentRank: 'Platinum 1', peakRank: 'Diamond 2', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "crimsonhunter", duo: "", currentRank: 'Silver 2', peakRank: 'Gold 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "mysticdragon", duo: "lunarflare", currentRank: 'Bronze 3', peakRank: 'Silver 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "lunarshadow", duo: "", currentRank: 'Ascendant 2', peakRank: 'Ascendant 3', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "shadowphoenix", duo: "echohawk", currentRank: 'Platinum 2', peakRank: 'Diamond 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "blazingmoon", duo: "", currentRank: 'Silver 3', peakRank: 'Gold 2', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "stormfury", duo: "", currentRank: 'Ascendant 1', peakRank: 'Ascendant 3', timeSlots: ["7pm CEST/8pm WEST"] },
    ],
    expectResults: {
        possiblePlayers: [],
        priorityPlayers: [],
        lobbyCount: 2,
    }
  } //end test case
  { //start test case
    caseName: "1 lobby out of 20 players (not enough subs)",
    timeSlot: "7pm CEST/8pm WEST",
    players: [
    ],
    expectResults: {
        possiblePlayers: [],
        priorityPlayers: [],
        lobbyCount: 1,
    }
  } //end test case
*/
];
