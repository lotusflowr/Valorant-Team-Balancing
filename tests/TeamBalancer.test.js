import { TEAM_SIZE } from '../src/config.js';
import {
  createOptimalTeamsForTimeSlot,
  trySwapPlayers
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
    //process average ranks
    players.forEach((player, i) => {
        players[i].averageRank = (getRankValue(player.currentRank) + getRankValue(player.peakRank)) / 2;
    });

    const { teams, substitutes } = createOptimalTeamsForTimeSlot(players, timeSlot, new Set());
    const teamCount = teams.length;

    expect(teamCount).toBe(expectResults.teams.length); // Ensures the expected amount of teams were created

    teams.forEach((team) => { //ensure teams are the right length (5, probably, but defined in src/config.js)
      expect(team.players.length).toBe(TEAM_SIZE)
    });

    expect(substitutes.length).toBe(expectResults.subs.length);

    //Check that the rank totals for each team are reasonably balanced
    for (let i = 0; i < teamCount; i += 2) {
      let team1TotalRank = teams[i].players.reduce((sum, player) => sum + player.averageRank, 0);
      let team2TotalRank = teams[i + 1].players.reduce((sum, player) => sum + player.averageRank, 0);
      let rankDifference = Math.abs(team1TotalRank - team2TotalRank);

      expect(rankDifference).toBeLessThanOrEqual(expectResults.balanceThreshold); // Teams should be within 20 rank points of each other
    }
  });
});

describe("trySwapPlayers", () => {
  test.each(teamsToSwap)('$caseName', ({teams, expectResults}) => {
    //each test case should have only 2 teams
    const team1 = teams[0];
    const team2 = teams[1];

    const result = trySwapPlayers(team1, team2);
    expect(result).toBe(expectResults.shouldImprove);

    // Check that the rank difference has reduced after swapping
    const newRankDifference = Math.abs(team1.total - team2.total);
    expect(newRankDifference).toBeLessThan(expectResults.balanceThreshold); // Ensure teams are more balanced than before
  });
});
