/* Test cases for team balancing
 * Normally I probably wouldn't want to separate test cases from the test function like this but I
 * expect there to be a lot of these, so just trying to keep things organized & easy to read
 */

export const players = [
  { //start test case
    caseName: "2 teams out of 10 players",
    timeSlot: "7pm CEST/8pm WEST",
    players: [
      { discordUsername: "Player1", duo: "", averageRank: 10, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player2", duo: "", averageRank: 20, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player3", duo: "", averageRank: 30, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player4", duo: "", averageRank: 40, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player5", duo: "", averageRank: 50, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player6", duo: "", averageRank: 60, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player7", duo: "", averageRank: 70, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player8", duo: "", averageRank: 80, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player9", duo: "", averageRank: 90, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "Player10", duo: "", averageRank: 100, timeSlots: ["7pm CEST/8pm WEST"] }
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
    caseName: "4 teams out of 10 players",
    timeSlot: "7pm CEST/8pm WEST",
    players: [
      { discordUsername: "mysticwolf", duo: "crimsonblade", averageRank: 10, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "blazingstar", duo: "", averageRank: 20, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "nightfalcon", duo: "", averageRank: 30, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "stardust", duo: "", averageRank: 40, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "quicksilver", duo: "", averageRank: 50, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "crimsonblade", duo: "mysticwolf", averageRank: 60, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "shadowwalker", duo: "", averageRank: 70, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "radiantphoenix", duo: "", averageRank: 80, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "darkknight", duo: "", averageRank: 90, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "lunarflare", duo: "", averageRank: 100, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "aurorasky", duo: "", averageRank: 10, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "thundercat", duo: "", averageRank: 20, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "starfighter", duo: "moonshadow", averageRank: 30, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "moonshadow", duo: "starfighter", averageRank: 40, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "firestorm", duo: "", averageRank: 50, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "silentshadow", duo: "", averageRank: 60, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "blazingnova", duo: "", averageRank: 70, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "echohawk", duo: "shadowphoenix", averageRank: 80, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "radiantstorm", duo: "", averageRank: 90, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "ghostblade", duo: "", averageRank: 100, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "starshatter", duo: "firestorm", averageRank: 100, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "frostfang", duo: "radiantstorm", averageRank: 100, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "crimsonhunter", duo: "", averageRank: 100, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "mysticdragon", duo: "lunarflare", averageRank: 100, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "lunarshadow", duo: "", averageRank: 100, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "shadowphoenix", duo: "echohawk", averageRank: 100, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "blazingmoon", duo: "", averageRank: 100, timeSlots: ["7pm CEST/8pm WEST"] },
      { discordUsername: "stormfury", duo: "", averageRank: 100, timeSlots: ["7pm CEST/8pm WEST"] },
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
  [ //start test case
    {
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
  ], //end test case
];
