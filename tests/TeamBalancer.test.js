import { TEAM_SIZE } from '../src/config.js';
import {
  createOptimalTeamsForTimeSlot
} from '../src/TeamBalancer.js';
import {
  players as playersToBalance,
  teams as teamsToSwap
} from './TeamBalancerCases.js';
import {
  getRankValue,
} from '../src/Utilities.js';

describe("createOptimalTeamsForTimeSlot", () => {
  test.each(playersToBalance)('$caseName', ({players, timeSlot, expectResults}) => {
    players.forEach((player, i) => {
      //process average ranks
        players[i].averageRank = (getRankValue(player.currentRank) + getRankValue(player.peakRank)) / 2;
        // Add willSub property if not present
        if (!players[i].hasOwnProperty('willSub')) {
            players[i].willSub = 'no';
        }
        // Normalize willSub and multipleGames to lowercase
        if (players[i].willSub) players[i].willSub = players[i].willSub.toLowerCase();
        if (players[i].multipleGames) players[i].multipleGames = players[i].multipleGames.toLowerCase();
    });

    const { teams, substitutes } = createOptimalTeamsForTimeSlot(players, timeSlot, new Set());
    const teamCount = teams.length;

    expect(teamCount).toBe(expectResults.teams.length); // Ensures the expected amount of teams were created

    teams.forEach((team) => { //ensure teams are the right length (5, probably, but defined in src/config.js)
      expect(team.players.length).toBe(TEAM_SIZE)
    });

    // Only count substitutes who have willSub set to 'yes'
    const willingSubstitutes = substitutes.filter(sub => sub.willSub === 'yes');
    expect(willingSubstitutes.length).toBe(expectResults.subs.length);

    //Check that the rank totals for each team are reasonably balanced
    for (let i = 0; i < teamCount; i += 2) {
      let team1TotalRank = teams[i].players.reduce((sum, player) => sum + Math.sqrt(player.averageRank), 0);
      let team2TotalRank = teams[i + 1].players.reduce((sum, player) => sum + Math.sqrt(player.averageRank), 0);
      let rankDifference = Math.abs(team1TotalRank - team2TotalRank);

      expect(rankDifference).toBeLessThanOrEqual(expectResults.balanceThreshold); // Teams should be within threshold of each other
    }
  });
});

describe("createOptimalTeams", () => {
  const TIME_SLOTS = ["6pm PST/9pm EST", "7pm PST/10pm EST"];
  const { multiSlotCases } = require('./TeamBalancerCases.js');

  test.each(multiSlotCases)('$caseName', ({players, expectResults}) => {
    players.forEach((player) => {
      player.averageRank = (getRankValue(player.currentRank) + getRankValue(player.peakRank)) / 2;
      if (!player.hasOwnProperty('willSub')) player.willSub = 'no';
      if (player.willSub) player.willSub = player.willSub.toLowerCase();
      if (player.multipleGames) player.multipleGames = player.multipleGames.toLowerCase();
    });

    const { createOptimalTeams } = require('../src/TeamBalancer.js');
    const result = createOptimalTeams(players, TIME_SLOTS);
    const teamCount = result.teams.length;
    expect(teamCount).toBe(expectResults.totalTeams);

    const teamsBySlot = {};
    result.teams.forEach(team => {
      teamsBySlot[team.timeSlot] = (teamsBySlot[team.timeSlot] || 0) + 1;
      expect(team.players.length).toBe(TEAM_SIZE);
    });

    expect(teamsBySlot['6pm PST/9pm EST'] || 0).toBe(expectResults.slot6Teams);
    expect(teamsBySlot['7pm PST/10pm EST'] || 0).toBe(expectResults.slot7Teams);

    expect((result.substitutes['6pm PST/9pm EST'] || []).length).toBe(expectResults.slot6Subs);
    expect((result.substitutes['7pm PST/10pm EST'] || []).length).toBe(expectResults.slot7Subs);
  });
});