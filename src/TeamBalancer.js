import { TEAM_SIZE } from './config.js';

import {
  getTimeSlots,
  getGameDay,
} from './TimeSlotManager.js';

import {
  getPlayersData,
  writeTeamsToSheet
} from './PlayerData.js';

export function sortPlayersIntoBalancedTeams() {
    Logger.log("sortPlayersIntoBalancedTeams function started");

    // Update Time and Day variables
    const TIME_SLOTS = getTimeSlots(); // Refresh TIME_SLOTS at the start of the function
    const GAME_DAY = getGameDay(); // Refresh GAME_DAY at the start of the function

    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const playersSheet = ss.getSheets()[0];
        const teamsSheet = ss.getSheetByName("Teams") || ss.insertSheet("Teams");

        Logger.log("Sheets retrieved successfully");

        const allPlayers = getPlayersData(playersSheet);
        Logger.log("All players data retrieved: " + JSON.stringify(allPlayers));

        if (allPlayers.length === 0) {
            throw new Error("No valid players found. Please check the player data.");
        }

        const teamsAndSubs = createOptimalTeams(allPlayers, TIME_SLOTS);
        Logger.log("Teams and substitutes created: " + JSON.stringify(teamsAndSubs));

        writeTeamsToSheet(teamsSheet, teamsAndSubs, TIME_SLOTS);
        Logger.log("Teams written to sheet");

    } catch (e) {
        Logger.log(`Error: ${e.message}`);
        throw e;
    }

    Logger.log("sortPlayersIntoBalancedTeams function completed");
}

/***** TEAM BALANCING LOGIC FUNCTIONS *****/
export function createOptimalTeams(players, TIME_SLOTS) {
    let result = {
        teams: [],
        substitutes: {}
    };
    let globalAssignedPlayers = new Set(); // Track players assigned across all time slots
    let tempAssignedPlayers = new Set(); // Track temporary assignments for current slot

    // Ensure TIME_SLOTS is defined and not empty
    if (!TIME_SLOTS || TIME_SLOTS.length === 0) {
        Logger.log("Error: TIME_SLOTS is undefined or empty");
        return result;
    }

    // Process each time slot
    TIME_SLOTS.forEach((timeSlot) => {
        Logger.log(`\nProcessing time slot: ${timeSlot}`);
        let timeSlotPlayers = [];

        // First, add unassigned players who can play in this time slot
        const unassignedPlayers = players.filter(p => 
            !globalAssignedPlayers.has(p.discordUsername) && 
            p.timeSlots.includes(timeSlot)
        );
        
        // Add unassigned players first
        unassignedPlayers.forEach(player => {
            timeSlotPlayers.push(player);
            Logger.log(`Added unassigned player: ${player.discordUsername} (Rank: ${player.currentRank})`);
        });

        // Only if we don't have enough players for teams, add players who have already played
        if (timeSlotPlayers.length < TEAM_SIZE * 2) {
            // Add players who have already played but can play multiple games
            players.forEach(player => {
                if (player.timeSlots.includes(timeSlot) && 
                    globalAssignedPlayers.has(player.discordUsername) && 
                    !timeSlotPlayers.includes(player) &&
                    player.multipleGames === 'yes') {
                    timeSlotPlayers.push(player);
                    Logger.log(`Added multi-game player: ${player.discordUsername} (Rank: ${player.currentRank})`);
                }
            });
        }

        // Finally, add any remaining available players who are willing to sub
        players.forEach(player => {
            if (player.timeSlots.includes(timeSlot) && 
                !timeSlotPlayers.includes(player) && 
                !globalAssignedPlayers.has(player.discordUsername) && 
                player.willSub === 'yes') {
                timeSlotPlayers.push(player);
                Logger.log(`Added substitute player: ${player.discordUsername} (Rank: ${player.currentRank})`);
            }
        });

        Logger.log(`\nTotal players available for ${timeSlot}: ${timeSlotPlayers.length}`);
        Logger.log(`Players for ${timeSlot}: ${timeSlotPlayers.map(p => p.discordUsername).join(', ')}`);

        // Create teams for this time slot
        let slotResult = createOptimalTeamsForTimeSlot(timeSlotPlayers, timeSlot, tempAssignedPlayers);

        result.teams = result.teams.concat(slotResult.teams);
        result.substitutes[timeSlot] = slotResult.substitutes;

        // Update global assignments
        slotResult.teams.forEach(team => {
            team.players.forEach(player => {
                globalAssignedPlayers.add(player.discordUsername);
                tempAssignedPlayers.add(player.discordUsername);
            });
        });

        Logger.log(`\nCreated ${slotResult.teams.length} teams for time slot: ${timeSlot}`);
        Logger.log(`Substitutes for time slot ${timeSlot}: ${slotResult.substitutes.length}`);
        Logger.log(`Current global assigned players: ${Array.from(globalAssignedPlayers).join(', ')}`);
    });

    // After processing all time slots, mark players as permanently assigned if they don't want to play multiple games
    result.teams.forEach(team => {
        team.players.forEach(player => {
            if (player.multipleGames !== 'yes') {
                globalAssignedPlayers.add(player.discordUsername);
                Logger.log(`Marked as permanently assigned (no multiple games): ${player.discordUsername}`);
            }
        });
    });

    return result;
}

export function createOptimalTeamsForTimeSlot(players, timeSlot, assignedPlayers) {
    const numPlayers = players.length;
    // Calculate the max number of full teams (must be even, each with TEAM_SIZE players)
    let maxFullTeams = Math.floor(numPlayers / TEAM_SIZE);
    if (maxFullTeams % 2 !== 0) maxFullTeams -= 1; // ensure even
    Logger.log(`\nCreating teams for ${timeSlot}:`);
    Logger.log(`Total players: ${numPlayers}`);
    Logger.log(`Maximum possible full teams: ${maxFullTeams}`);

    // If we don't have enough players for at least 2 teams of TEAM_SIZE, return empty result
    if (maxFullTeams < 2) {
        Logger.log(`Not enough players for 2 teams (need ${TEAM_SIZE * 2} players, have ${numPlayers})`);
        return {
            teams: [],
            substitutes: players.filter(p => p.willSub === 'yes'),
            assignedPlayers: new Set()
        };
    }

    const numTeams = maxFullTeams;
    Logger.log(`Creating ${numTeams} teams`);

    let teams = [];

    // Initialize empty teams
    for (let i = 0; i < numTeams; i++) {
        teams.push({
            name: `Team ${i + 1}`,
            timeSlot: timeSlot,
            players: [],
            total: 0
        });
    }

    // Separate players into priority and non-priority groups
    const priorityPlayers = players.filter(p => p.timeSlots.length === 1 && p.timeSlots[0] === timeSlot);
    const nonPriorityPlayers = players.filter(p => !priorityPlayers.includes(p));
    Logger.log(`\nPriority players: ${priorityPlayers.map(p => p.discordUsername).join(', ')}`);
    Logger.log(`Non-priority players: ${nonPriorityPlayers.map(p => p.discordUsername).join(', ')}`);

    // Sort both groups by average rank (descending)
    priorityPlayers.sort((a, b) => b.averageRank - a.averageRank);
    nonPriorityPlayers.sort((a, b) => b.averageRank - a.averageRank);

    // Distribute players to teams using snake draft
    const allTeamPlayers = [...priorityPlayers, ...nonPriorityPlayers].slice(0, numTeams * TEAM_SIZE);
    Logger.log(`\nDistributing ${allTeamPlayers.length} players to teams`);
    for (let i = 0; i < allTeamPlayers.length; i++) {
        const round = Math.floor(i / numTeams);
        const position = i % numTeams;
        const teamIndex = round % 2 === 0 ? position : numTeams - 1 - position;
        teams[teamIndex].players.push(allTeamPlayers[i]);
        teams[teamIndex].total += Math.sqrt(allTeamPlayers[i].averageRank); // Use square root for balancing
        Logger.log(`Added ${allTeamPlayers[i].discordUsername} to Team ${teamIndex + 1}`);
    }

    // Verify all teams have exactly TEAM_SIZE players
    teams = teams.filter(team => team.players.length === TEAM_SIZE);
    Logger.log(`\nTeams after filtering for complete teams: ${teams.length}`);

    // If we don't have at least 2 teams after filtering, return empty result
    if (teams.length < 2) {
        Logger.log(`Not enough complete teams after filtering (need 2, have ${teams.length})`);
        return {
            teams: [],
            substitutes: players.filter(p => p.willSub === 'yes'),
            assignedPlayers: new Set()
        };
    }

    // Remaining players become substitutes only if they marked willSub as 'yes'
    const substitutes = [...priorityPlayers, ...nonPriorityPlayers].slice(numTeams * TEAM_SIZE).filter(p => p.willSub === 'yes');
    Logger.log(`\nSubstitutes: ${substitutes.map(p => p.discordUsername).join(', ')}`);

    // Optimize team balance
    const targetTotal = teams.reduce((sum, team) => sum + team.total, 0) / teams.length;
    Logger.log(`\nOptimizing team balance (target total: ${targetTotal.toFixed(2)})`);
    let improved;
    do {
        improved = false;
        let bestSwap = null;
        let bestImprovement = 0;
        // Try all possible valid swaps and pick the best one
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                for (let p1 = 0; p1 < teams[i].players.length; p1++) {
                    for (let p2 = 0; p2 < teams[j].players.length; p2++) {
                        const player1 = teams[i].players[p1];
                        const player2 = teams[j].players[p2];
                        // Skip if either player is a priority player
                        if (player1.timeSlots && player1.timeSlots.length === 1 || player2.timeSlots && player2.timeSlots.length === 1) {
                            continue;
                        }
                        // Skip if either player doesn't want to play multiple games
                        if (player1.multipleGames && player1.multipleGames !== 'yes') {
                            continue;
                        }
                        if (player2.multipleGames && player2.multipleGames !== 'yes') {
                            continue;
                        }
                        // Calculate new totals if we swap these players
                        const newTotal1 = teams[i].total - Math.sqrt(player1.averageRank) + Math.sqrt(player2.averageRank);
                        const newTotal2 = teams[j].total - Math.sqrt(player2.averageRank) + Math.sqrt(player1.averageRank);
                        const currentDiff = Math.abs(teams[i].total - targetTotal) + Math.abs(teams[j].total - targetTotal);
                        const newDiff = Math.abs(newTotal1 - targetTotal) + Math.abs(newTotal2 - targetTotal);
                        const improvement = currentDiff - newDiff;
                        if (improvement > bestImprovement) {
                            bestImprovement = improvement;
                            bestSwap = {i, j, p1, p2, newTotal1, newTotal2};
                        }
                    }
                }
            }
        }
        if (bestSwap) {
            // Perform the best swap found
            const {i, j, p1, p2, newTotal1, newTotal2} = bestSwap;
            const temp = teams[i].players[p1];
            teams[i].players[p1] = teams[j].players[p2];
            teams[j].players[p2] = temp;
            teams[i].total = newTotal1;
            teams[j].total = newTotal2;
            improved = true;
            Logger.log(`Swapped ${teams[i].players[p1].discordUsername} and ${teams[j].players[p2].discordUsername} between teams ${i + 1} and ${j + 1}`);
        }
    } while (improved);

    // Calculate team spread for logging
    const teamSpread = getTeamSpread(teams);
    Logger.log(`\nFinal team spread for ${timeSlot}: ${teamSpread.toFixed(2)}`);
    teams.forEach((team, index) => {
        Logger.log(`Team ${index + 1} total: ${team.total.toFixed(2)}`);
        Logger.log(`Team ${index + 1} players: ${team.players.map(p => p.discordUsername).join(', ')}`);
    });

    return {
        teams,
        substitutes,
        assignedPlayers: new Set([...assignedPlayers, ...teams.flatMap(team => team.players.map(p => p.discordUsername))])
    };
}

export function getTeamSpread(teams) {
    const totals = teams.map(team => team.total);
    return Math.max(...totals) - Math.min(...totals);
}
