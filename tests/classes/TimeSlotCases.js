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
  { //start test case
    caseName: "1 lobby out of 11 players (one player isn't in chosen time slot)",
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
      { timestamp:'2024-11-26 02:00:07',discordUsername:"Player11",riotId:'player#0011',pronouns:'she/her',currentRank:'Silver 1',peakRank:'Silver 3',timeSlots:["8pm CEST/9pm WEST"],multipleGames:'no',willSub:'no',willHost:'yes',duoRequest:''},
    ],
    expectedData: {
        possiblePlayers: ['Player1','Player2','Player3','Player4','Player5','Player6','Player7','Player8','Player9','Player10'],
        priorityPlayers: ['Player3','Player6','Player7','Player9'],
        lobbyCount: 1,
    }
  }, //end test case
  { //start test case
    caseName: "2 lobbies out of 28 players",
    timeSlot: "7pm CEST/8pm WEST",
    playerData: [
        {
            "timestamp": "",
            "discordUsername": "mysticwolf",
            "riotId": "mystic#001",
            "pronouns": "She/Her",
            "currentRank": "Platinum 1",
            "peakRank": "Diamond 1",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": "crimsonblade"
        },
        {
            "timestamp": "",
            "discordUsername": "blazingstar",
            "riotId": "flame#002",
            "pronouns": "He/Him",
            "currentRank": "Ascendant 1",
            "peakRank": "Ascendant 3",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "no",
            "willHost": "no",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "nightfalcon",
            "riotId": "falcon#003",
            "pronouns": "They/Them",
            "currentRank": "Bronze 3",
            "peakRank": "Silver 2",
            "timeSlots": [
                "7pm CEST/8pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "no",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "stardust",
            "riotId": "starry#004",
            "pronouns": "She/They",
            "currentRank": "Gold 3",
            "peakRank": "Platinum 3",
            "timeSlots": [
                "7pm CEST/8pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "quicksilver",
            "riotId": "silver#005",
            "pronouns": "Any",
            "currentRank": "Diamond 2",
            "peakRank": "Ascendant 1",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "no",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "crimsonblade",
            "riotId": "crimson#006",
            "pronouns": "She/Her",
            "currentRank": "Silver 1",
            "peakRank": "Gold 2",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "no",
            "willSub": "no",
            "willHost": "no",
            "duoRequest": "mysticwolf"
        },
        {
            "timestamp": "",
            "discordUsername": "shadowwalker",
            "riotId": "shadow#007",
            "pronouns": "She/Her",
            "currentRank": "Platinum 2",
            "peakRank": "Diamond 2",
            "timeSlots": [
                "7pm CEST/8pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "radiantphoenix",
            "riotId": "phoenix#008",
            "pronouns": "She/They",
            "currentRank": "Gold 2",
            "peakRank": "Platinum 1",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "darkknight",
            "riotId": "knight#009",
            "pronouns": "He/Him",
            "currentRank": "Bronze 1",
            "peakRank": "Silver 1",
            "timeSlots": [
                "7pm CEST/8pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "lunarflare",
            "riotId": "lunar#010",
            "pronouns": "She/Her",
            "currentRank": "Ascendant 2",
            "peakRank": "Ascendant 3",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "no",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "aurorasky",
            "riotId": "aurora#011",
            "pronouns": "She/They",
            "currentRank": "Diamond 1",
            "peakRank": "Diamond 3",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "no",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "thundercat",
            "riotId": "thunder#012",
            "pronouns": "He/Him",
            "currentRank": "Silver 3",
            "peakRank": "Gold 1",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "no",
            "willHost": "no",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "starfighter",
            "riotId": "star#013",
            "pronouns": "She/Her",
            "currentRank": "Platinum 3",
            "peakRank": "Diamond 1",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": "moonshadow"
        },
        {
            "timestamp": "",
            "discordUsername": "moonshadow",
            "riotId": "moon#014",
            "pronouns": "They/Them",
            "currentRank": "Ascendant 1",
            "peakRank": "Ascendant 2",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": "starfighter"
        },
        {
            "timestamp": "",
            "discordUsername": "firestorm",
            "riotId": "fire#015",
            "pronouns": "He/Him",
            "currentRank": "Ascendant 1",
            "peakRank": "Immortal 1",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "silentshadow",
            "riotId": "silent#016",
            "pronouns": "He/Him",
            "currentRank": "Bronze 2",
            "peakRank": "Silver 3",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "blazingnova",
            "riotId": "nova#017",
            "pronouns": "She/Her",
            "currentRank": "Gold 1",
            "peakRank": "Gold 3",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "no",
            "willHost": "no",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "echohawk",
            "riotId": "echo#018",
            "pronouns": "They/Them",
            "currentRank": "Silver 2",
            "peakRank": "Gold 2",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": "shadowphoenix"
        },
        {
            "timestamp": "",
            "discordUsername": "radiantstorm",
            "riotId": "storm#019",
            "pronouns": "She/They",
            "currentRank": "Diamond 3",
            "peakRank": "Ascendant 1",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "no",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "ghostblade",
            "riotId": "ghost#020",
            "pronouns": "He/Him",
            "currentRank": "Gold 3",
            "peakRank": "Platinum 2",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "no",
            "duoRequest": "firestorm"
        },
        {
            "timestamp": "",
            "discordUsername": "starshatter",
            "riotId": "star#021",
            "pronouns": "She/Her",
            "currentRank": "Ascendant 1",
            "peakRank": "Ascendant 2",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "frostfang",
            "riotId": "frost#022",
            "pronouns": "Any",
            "currentRank": "Platinum 1",
            "peakRank": "Diamond 2",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "no",
            "duoRequest": "radiantstorm"
        },
        {
            "timestamp": "",
            "discordUsername": "crimsonhunter",
            "riotId": "crimson#023",
            "pronouns": "She/Her",
            "currentRank": "Silver 2",
            "peakRank": "Gold 1",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "no",
            "willHost": "no",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "mysticdragon",
            "riotId": "mystic#024",
            "pronouns": "He/Him",
            "currentRank": "Bronze 3",
            "peakRank": "Silver 1",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": "lunarflare"
        },
        {
            "timestamp": "",
            "discordUsername": "lunarshadow",
            "riotId": "lunar#025",
            "pronouns": "They/Them",
            "currentRank": "Ascendant 2",
            "peakRank": "Ascendant 3",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "no",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "shadowphoenix",
            "riotId": "shadow#026",
            "pronouns": "She/Her",
            "currentRank": "Platinum 2",
            "peakRank": "Diamond 1",
            "timeSlots": [
                "7pm CEST/8pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": "echohawk"
        },
        {
            "timestamp": "",
            "discordUsername": "blazingmoon",
            "riotId": "blaze#027",
            "pronouns": "He/Him",
            "currentRank": "Silver 3",
            "peakRank": "Gold 2",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "no",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "stormfury",
            "riotId": "storm#028",
            "pronouns": "They/Them",
            "currentRank": "Ascendant 1",
            "peakRank": "Ascendant 3",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": ""
        }
    ],
    expectedData: {
        possiblePlayers: ["mysticwolf","blazingstar","nightfalcon","stardust","quicksilver","crimsonblade","shadowwalker","radiantphoenix","darkknight","lunarflare","aurorasky","thundercat","starfighter","moonshadow","firestorm","silentshadow","blazingnova","echohawk","radiantstorm","ghostblade","starshatter","frostfang","crimsonhunter","mysticdragon","lunarshadow","shadowphoenix","blazingmoon","stormfury"],
        priorityPlayers: ["nightfalcon","stardust","shadowwalker","darkknight","shadowphoenix"],
        lobbyCount: 2,
    }
  }, //end test case
  { //start test case
    caseName: "1 lobby out of 20 players (not enough subs)",
    timeSlot: "7pm CEST/8pm WEST",
    playerData: [
        {
            "timestamp": "",
            "discordUsername": "mysticwolf",
            "riotId": "mystic#001",
            "pronouns": "She/Her",
            "currentRank": "Platinum 1",
            "peakRank": "Diamond 1",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": "crimsonblade"
        },
        {
            "timestamp": "",
            "discordUsername": "nightfalcon",
            "riotId": "falcon#003",
            "pronouns": "They/Them",
            "currentRank": "Bronze 3",
            "peakRank": "Silver 2",
            "timeSlots": [
                "7pm CEST/8pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "no",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "stardust",
            "riotId": "starry#004",
            "pronouns": "She/They",
            "currentRank": "Gold 3",
            "peakRank": "Platinum 3",
            "timeSlots": [
                "7pm CEST/8pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "quicksilver",
            "riotId": "silver#005",
            "pronouns": "Any",
            "currentRank": "Diamond 2",
            "peakRank": "Ascendant 1",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "no",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "crimsonblade",
            "riotId": "crimson#006",
            "pronouns": "She/Her",
            "currentRank": "Silver 1",
            "peakRank": "Gold 2",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "no",
            "willSub": "no",
            "willHost": "no",
            "duoRequest": "mysticwolf"
        },
        {
            "timestamp": "",
            "discordUsername": "shadowwalker",
            "riotId": "shadow#007",
            "pronouns": "She/Her",
            "currentRank": "Platinum 2",
            "peakRank": "Diamond 2",
            "timeSlots": [
                "7pm CEST/8pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "radiantphoenix",
            "riotId": "phoenix#008",
            "pronouns": "She/They",
            "currentRank": "Gold 2",
            "peakRank": "Platinum 1",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "darkknight",
            "riotId": "knight#009",
            "pronouns": "He/Him",
            "currentRank": "Bronze 1",
            "peakRank": "Silver 1",
            "timeSlots": [
                "7pm CEST/8pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "lunarflare",
            "riotId": "lunar#010",
            "pronouns": "She/Her",
            "currentRank": "Ascendant 2",
            "peakRank": "Ascendant 3",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "no",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "aurorasky",
            "riotId": "aurora#011",
            "pronouns": "She/They",
            "currentRank": "Diamond 1",
            "peakRank": "Diamond 3",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "no",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "starfighter",
            "riotId": "star#013",
            "pronouns": "She/Her",
            "currentRank": "Platinum 3",
            "peakRank": "Diamond 1",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": "moonshadow"
        },
        {
            "timestamp": "",
            "discordUsername": "moonshadow",
            "riotId": "moon#014",
            "pronouns": "They/Them",
            "currentRank": "Ascendant 1",
            "peakRank": "Ascendant 2",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": "starfighter"
        },
        {
            "timestamp": "",
            "discordUsername": "firestorm",
            "riotId": "fire#015",
            "pronouns": "He/Him",
            "currentRank": "Ascendant 1",
            "peakRank": "Immortal 1",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "silentshadow",
            "riotId": "silent#016",
            "pronouns": "He/Him",
            "currentRank": "Bronze 2",
            "peakRank": "Silver 3",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "echohawk",
            "riotId": "echo#018",
            "pronouns": "They/Them",
            "currentRank": "Silver 2",
            "peakRank": "Gold 2",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": "shadowphoenix"
        },
        {
            "timestamp": "",
            "discordUsername": "radiantstorm",
            "riotId": "storm#019",
            "pronouns": "She/They",
            "currentRank": "Diamond 3",
            "peakRank": "Ascendant 1",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "no",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "ghostblade",
            "riotId": "ghost#020",
            "pronouns": "He/Him",
            "currentRank": "Gold 3",
            "peakRank": "Platinum 2",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "no",
            "duoRequest": "firestorm"
        },
        {
            "timestamp": "",
            "discordUsername": "starshatter",
            "riotId": "star#021",
            "pronouns": "She/Her",
            "currentRank": "Ascendant 1",
            "peakRank": "Ascendant 2",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": ""
        },
        {
            "timestamp": "",
            "discordUsername": "frostfang",
            "riotId": "frost#022",
            "pronouns": "Any",
            "currentRank": "Platinum 1",
            "peakRank": "Diamond 2",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "no",
            "duoRequest": "radiantstorm"
        },
        {
            "timestamp": "",
            "discordUsername": "mysticdragon",
            "riotId": "mystic#024",
            "pronouns": "He/Him",
            "currentRank": "Bronze 3",
            "peakRank": "Silver 1",
            "timeSlots": [
                "7pm CEST/8pm WEST",
                "8pm CEST/9pm WEST"
            ],
            "multipleGames": "yes",
            "willSub": "yes",
            "willHost": "yes",
            "duoRequest": "lunarflare"
        }
    ],
    expectedData: {
        possiblePlayers: ["mysticwolf","nightfalcon","stardust","quicksilver","crimsonblade","shadowwalker","radiantphoenix","darkknight","lunarflare","aurorasky","starfighter","moonshadow","firestorm","silentshadow","echohawk","radiantstorm","ghostblade","starshatter","frostfang","mysticdragon"],
        priorityPlayers: ["nightfalcon","stardust","shadowwalker","darkknight"],
        lobbyCount: 1,
    }
  } //end test case
];
