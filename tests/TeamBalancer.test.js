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
