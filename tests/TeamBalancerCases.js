/* Test cases for team balancing
 * Normally I probably wouldn't want to separate test cases from the test function like this but I
 * expect there to be a lot of these, so just trying to keep things organized & easy to read
 */

export const players = [
  { //start test case
    caseName: "2 teams out of 10 players",
    timeSlot: "7pm CEST/8pm WEST",
    players: [
      { discordUsername: "Player1", duo: "", currentRank: 'Bronze 1', peakRank: 'Bronze 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player2", duo: "", currentRank: 'Silver 1', peakRank: 'Silver 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player3", duo: "", currentRank: 'Gold 1', peakRank: 'Gold 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player4", duo: "", currentRank: 'Platinum 1', peakRank: 'Platinum 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player5", duo: "", currentRank: 'Diamond 1', peakRank: 'Diamond 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player6", duo: "", currentRank: 'Ascendant 1', peakRank: 'Ascendant 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player7", duo: "", currentRank: 'Ascendant 3', peakRank: 'Ascendant 3', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player8", duo: "", currentRank: 'Immortal 1', peakRank: 'Immortal 1', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player9", duo: "", currentRank: 'Immortal 2', peakRank: 'Immortal 3', timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player10", duo: "", currentRank: 'Immortal 3', peakRank: 'Radiant', timeSlots: ["7pm CEST/8pm WEST"] }
    ],
    expectResults: {
     /*
      * Right now team sorting is randomized until it finds a balance, but from a programmatic perspective,
      * it would be better to have a deterministic algorithm. When we have that, we can add the array of
      * expected teams & subs for what we know would be balanced, but for now, just put in the amount of objects
      * we would expect to have so the count is accurate in the test
      */
      subs: [], // No substitutes since exactly 10 players
      teams: [{},{}],
      balanceThreshold: 20
    }
  }, //end test case
  { //start test case
    caseName: "4 teams out of 28 players",
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
     /*
      * Right now team sorting is randomized until it finds a balance, but from a programmatic perspective,
      * it would be better to have a deterministic algorithm. When we have that, we can add the array of
      * expected teams & subs for what we know would be balanced, but for now, just put in the amount of objects
      * we would expect to have so the count is accurate in the test & we don't have to change it too much 
      */
      subs: [{},{},{},{},{},{},{},{}], //8
      teams: [{},{},{},{}], //4
      balanceThreshold: 20
    }
  } //end test case
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
