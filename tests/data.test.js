import { createOptimalTeamsForTimeSlot, trySwapPlayers } from '../src/Galorants_In-Houses_script';

describe("Team Balancing Functions", () => {
    test("createOptimalTeamsForTimeSlot creates two balanced teams of 5 players each from 10 players", () => {
        const players = [
            { discordUsername: "Player1", averageRank: 10, timeSlots: ["7pm CEST/8pm WEST"] },
            { discordUsername: "Player2", averageRank: 20, timeSlots: ["7pm CEST/8pm WEST"] },
            { discordUsername: "Player3", averageRank: 30, timeSlots: ["7pm CEST/8pm WEST"] },
            { discordUsername: "Player4", averageRank: 40, timeSlots: ["7pm CEST/8pm WEST"] },
            { discordUsername: "Player5", averageRank: 50, timeSlots: ["7pm CEST/8pm WEST"] },
            { discordUsername: "Player6", averageRank: 60, timeSlots: ["7pm CEST/8pm WEST"] },
            { discordUsername: "Player7", averageRank: 70, timeSlots: ["7pm CEST/8pm WEST"] },
            { discordUsername: "Player8", averageRank: 80, timeSlots: ["7pm CEST/8pm WEST"] },
            { discordUsername: "Player9", averageRank: 90, timeSlots: ["7pm CEST/8pm WEST"] },
            { discordUsername: "Player10", averageRank: 100, timeSlots: ["7pm CEST/8pm WEST"] }
        ];

        const assignedPlayers = new Set();
        const { teams, substitutes } = createOptimalTeamsForTimeSlot(players, "7pm CEST/8pm WEST", assignedPlayers);

        expect(teams.length).toBe(2); // Ensures two teams are created
        expect(teams[0].players.length).toBe(5); // Each team should have 5 players
        expect(teams[1].players.length).toBe(5);
        expect(substitutes.length).toBe(0); // No substitutes since exactly 10 players

        // Check that the rank totals for each team are reasonably balanced
        const team1TotalRank = teams[0].players.reduce((sum, player) => sum + player.averageRank, 0);
        const team2TotalRank = teams[1].players.reduce((sum, player) => sum + player.averageRank, 0);
        const rankDifference = Math.abs(team1TotalRank - team2TotalRank);

        expect(rankDifference).toBeLessThanOrEqual(20); // Teams should be within 20 rank points of each other
    });

    test("trySwapPlayers function improves team balance if possible", () => {
        const team1 = {
            players: [
                { discordUsername: "Player1", averageRank: 90 },
                { discordUsername: "Player2", averageRank: 80 },
                { discordUsername: "Player3", averageRank: 70 },
                { discordUsername: "Player4", averageRank: 60 },
                { discordUsername: "Player5", averageRank: 50 },
            ],
            total: 350
        };
        const team2 = {
            players: [
                { discordUsername: "Player6", averageRank: 40 },
                { discordUsername: "Player7", averageRank: 30 },
                { discordUsername: "Player8", averageRank: 20 },
                { discordUsername: "Player9", averageRank: 10 },
                { discordUsername: "Player10", averageRank: 5 },
            ],
            total: 105
        };

        const result = trySwapPlayers(team1, team2);
        expect(result).toBe(true); // Swapping should improve balance

        // Check that the rank difference has reduced after swapping
        const newRankDifference = Math.abs(team1.total - team2.total);
        expect(newRankDifference).toBeLessThan(245); // Ensure teams are more balanced than before
    });
});
