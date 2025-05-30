/* Test cases for team balancing
 * Normally I probably wouldn't want to separate test cases from the test function like this but I
 * expect there to be a lot of these, so just trying to keep things organized & easy to read
 */

export const players = [
  { //start test case
    caseName: "2 teams out of 10 players",
    timeSlot: "7pm PST/10pm EST",
    players: [
      { discordUsername: "Player1", duo: "", currentRank: 'Bronze 1', peakRank: 'Bronze 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "Player2", duo: "", currentRank: 'Silver 1', peakRank: 'Silver 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "Player3", duo: "", currentRank: 'Gold 1', peakRank: 'Gold 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "Player4", duo: "", currentRank: 'Platinum 1', peakRank: 'Platinum 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "Player5", duo: "", currentRank: 'Diamond 1', peakRank: 'Diamond 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "Player6", duo: "", currentRank: 'Ascendant 1', peakRank: 'Ascendant 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "Player7", duo: "", currentRank: 'Ascendant 3', peakRank: 'Ascendant 3', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "Player8", duo: "", currentRank: 'Immortal 1', peakRank: 'Immortal 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "Player9", duo: "", currentRank: 'Immortal 2', peakRank: 'Immortal 3', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "Player10", duo: "", currentRank: 'Immortal 3', peakRank: 'Radiant', timeSlots: ["7pm PST/10pm EST"] }
    ],
    expectResults: {
      subs: [], // No substitutes since exactly 10 players
      teams: [{},{}],
      balanceThreshold: 20
    }
  }, //end test case
  { //start test case
    caseName: "4 teams out of 28 players",
    timeSlot: "7pm PST/10pm EST",
    players: [
      { discordUsername: "mysticwolf", duo: "crimsonblade", currentRank: 'Platinum 1', peakRank: 'Diamond 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "blazingstar", duo: "", currentRank: 'Ascendant 1', peakRank: 'Ascendant 3', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "nightfalcon", duo: "", currentRank: 'Bronze 3', peakRank: 'Silver 2', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "stardust", duo: "", currentRank: 'Gold 3', peakRank: 'Platinum 3', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "quicksilver", duo: "", currentRank: 'Diamond 2', peakRank: 'Ascendant 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "crimsonblade", duo: "mysticwolf", currentRank: 'Silver 1', peakRank: 'Gold 2', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "shadowwalker", duo: "", currentRank: 'Platinum 2', peakRank: 'Diamond 2', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "radiantphoenix", duo: "", currentRank: 'Gold 2', peakRank: 'Platinum 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "darkknight", duo: "", currentRank: 'Bronze 1', peakRank: 'Silver 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "lunarflare", duo: "", currentRank: 'Ascendant 2', peakRank: 'Ascendant 3', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "aurorasky", duo: "", currentRank: 'Diamond 1', peakRank: 'Diamond 3', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "thundercat", duo: "", currentRank: 'Silver 3', peakRank: 'Gold 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "starfighter", duo: "moonshadow", currentRank: 'Platinum 3', peakRank: 'Diamond 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "moonshadow", duo: "starfighter", currentRank: 'Ascendant 1', peakRank: 'Ascendant 2', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "firestorm", duo: "", currentRank: 'Ascendant 1', peakRank: 'Immortal 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "silentshadow", duo: "", currentRank: 'Bronze 2', peakRank: 'Silver 3', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "blazingnova", duo: "", currentRank: 'Gold 1', peakRank: 'Gold 3', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "echohawk", duo: "shadowphoenix", currentRank: 'Silver 2', peakRank: 'Gold 2', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "radiantstorm", duo: "", currentRank: 'Diamond 3', peakRank: 'Ascendant 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "ghostblade", duo: "", currentRank: 'Gold 3', peakRank: 'Platinum 2', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "starshatter", duo: "firestorm", currentRank: 'Ascendant 1', peakRank: 'Ascendant 2', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "frostfang", duo: "radiantstorm", currentRank: 'Platinum 1', peakRank: 'Diamond 2', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "crimsonhunter", duo: "", currentRank: 'Silver 2', peakRank: 'Gold 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "mysticdragon", duo: "lunarflare", currentRank: 'Bronze 3', peakRank: 'Silver 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "lunarshadow", duo: "", currentRank: 'Ascendant 2', peakRank: 'Ascendant 3', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "shadowphoenix", duo: "echohawk", currentRank: 'Platinum 2', peakRank: 'Diamond 1', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "blazingmoon", duo: "", currentRank: 'Silver 3', peakRank: 'Gold 2', timeSlots: ["7pm PST/10pm EST"] },
      { discordUsername: "stormfury", duo: "", currentRank: 'Ascendant 1', peakRank: 'Ascendant 3', timeSlots: ["7pm PST/10pm EST"] },
    ],
    expectResults: {
      subs: [{},{},{},{},{},{},{},{}], //8
      teams: [{},{},{},{}], //4
      balanceThreshold: 20
    }
  }, //end test case
  { //start test case
    caseName: "Multiple time slots with mixed availability",
    timeSlot: "6pm PST/9pm EST",
    players: [
      { discordUsername: "Player1", duo: "", currentRank: 'Gold 1', peakRank: 'Gold 2', timeSlots: ["6pm PST/9pm EST"], multipleGames: 'no', willSub: 'yes', lobbyHost: 'yes' },
      { discordUsername: "Player2", duo: "", currentRank: 'Silver 3', peakRank: 'Silver 3', timeSlots: ["6pm PST/9pm EST", "7pm PST/10pm EST"], multipleGames: 'yes', willSub: 'yes', lobbyHost: 'no' },
      { discordUsername: "Player3", duo: "", currentRank: 'Iron 1', peakRank: 'Iron 1', timeSlots: ["6pm PST/9pm EST"], multipleGames: 'yes', willSub: 'yes', lobbyHost: 'no' },
      { discordUsername: "Player4", duo: "", currentRank: 'Iron 1', peakRank: 'Iron 3', timeSlots: ["6pm PST/9pm EST", "7pm PST/10pm EST"], multipleGames: 'yes', willSub: 'yes', lobbyHost: 'no' },
      { discordUsername: "Player5", duo: "", currentRank: 'Gold 2', peakRank: 'Gold 2', timeSlots: ["6pm PST/9pm EST", "7pm PST/10pm EST"], multipleGames: 'yes', willSub: 'yes', lobbyHost: 'no' },
      { discordUsername: "Player6", duo: "", currentRank: 'Silver 2', peakRank: 'Silver 2', timeSlots: ["6pm PST/9pm EST", "7pm PST/10pm EST"], multipleGames: 'yes', willSub: 'yes', lobbyHost: 'no' },
      { discordUsername: "Player7", duo: "", currentRank: 'Platinum 2', peakRank: 'Platinum 3', timeSlots: ["6pm PST/9pm EST", "7pm PST/10pm EST"], multipleGames: 'yes', willSub: 'yes', lobbyHost: 'no' },
      { discordUsername: "Player8", duo: "", currentRank: 'Platinum 2', peakRank: 'Diamond 3', timeSlots: ["7pm PST/10pm EST"], multipleGames: 'no', willSub: 'yes', lobbyHost: 'no' },
      { discordUsername: "Player9", duo: "", currentRank: 'Silver 1', peakRank: 'Silver 1', timeSlots: ["6pm PST/9pm EST", "7pm PST/10pm EST"], multipleGames: 'yes', willSub: 'yes', lobbyHost: 'no' },
      { discordUsername: "Player10", duo: "", currentRank: 'Bronze 1', peakRank: 'Bronze 3', timeSlots: ["7pm PST/10pm EST"], multipleGames: 'yes', willSub: 'yes', lobbyHost: 'no' },
      { discordUsername: "Player11", duo: "", currentRank: 'Platinum 2', peakRank: 'Diamond 1', timeSlots: ["6pm PST/9pm EST", "7pm PST/10pm EST"], multipleGames: 'yes', willSub: 'yes', lobbyHost: 'no' },
      { discordUsername: "Player12", duo: "", currentRank: 'Diamond 1', peakRank: 'Diamond 1', timeSlots: ["7pm PST/10pm EST"], multipleGames: 'yes', willSub: 'no', lobbyHost: 'no' },
      { discordUsername: "Player13", duo: "Player15", currentRank: 'Ascendant 1', peakRank: 'Ascendant 1', timeSlots: ["6pm PST/9pm EST", "7pm PST/10pm EST"], multipleGames: 'yes', willSub: 'yes', lobbyHost: 'no' },
      { discordUsername: "Player14", duo: "", currentRank: 'Platinum 1', peakRank: 'Platinum 1', timeSlots: ["6pm PST/9pm EST", "7pm PST/10pm EST"], multipleGames: 'yes', willSub: 'yes', lobbyHost: 'no' },
      { discordUsername: "Player15", duo: "Player13", currentRank: 'Platinum 2', peakRank: 'Diamond 2', timeSlots: ["6pm PST/9pm EST"], multipleGames: 'yes', willSub: 'no', lobbyHost: 'no' },
      { discordUsername: "Player16", duo: "", currentRank: 'Iron 2', peakRank: 'Iron 2', timeSlots: ["6pm PST/9pm EST", "7pm PST/10pm EST"], multipleGames: 'yes', willSub: 'yes', lobbyHost: 'no' },
      { discordUsername: "Player17", duo: "", currentRank: 'Silver 3', peakRank: 'Silver 3', timeSlots: ["6pm PST/9pm EST"], multipleGames: 'no', willSub: 'no', lobbyHost: 'no' }
    ],
    expectResults: {
      subs: [{},{},{},{},{},{},{}], // Expected number of substitutes (7 players marked as willSub: 'yes' who aren't in teams)
      teams: [{},{}], // Expected number of teams
      balanceThreshold: 20
    }
  }
];

export const teams = [
  { //start test case
    caseName: "basic swap where one team greatly outpowers the other",
    teams: [
      {
        players: [
          { discordUsername: "Player1", averageRank: 90 },
          { discordUsername: "Player2", averageRank: 80 },
          { discordUsername: "Player3", averageRank: 70 },
          { discordUsername: "Player4", averageRank: 60 },
          { discordUsername: "Player5", averageRank: 50 },
        ],
        total: 350
      },
      {
        players: [
          { discordUsername: "Player6", averageRank: 40 },
          { discordUsername: "Player7", averageRank: 30 },
          { discordUsername: "Player8", averageRank: 20 },
          { discordUsername: "Player9", averageRank: 10 },
          { discordUsername: "Player10", averageRank: 5 },
        ],
        total: 105
      }
    ],
    expectResults: {
      shouldImprove: true,
      balanceThreshold: 245
    }
  }
];
