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
    let assignedPlayers = new Set();

    // Ensure TIME_SLOTS is defined and not empty
    if (!TIME_SLOTS || TIME_SLOTS.length === 0) {
        Logger.log("Error: TIME_SLOTS is undefined or empty");
        return result;
    }

    // Process each time slot
    TIME_SLOTS.forEach((timeSlot, slotIndex) => {
        let timeSlotPlayers = [];

        // First, add players who can only play in this time slot
        players.forEach(player => {
            if (player.timeSlots.length === 1 && player.timeSlots[0] === timeSlot && !assignedPlayers.has(player.discordUsername)) {
                timeSlotPlayers.push(player);
            }
        });

        // Then, add players who haven't played yet and can play in this slot
        // Only add players who want to play multiple games if they haven't played yet
        players.forEach(player => {
            if (player.timeSlots.includes(timeSlot) && 
                !assignedPlayers.has(player.discordUsername) && 
                !timeSlotPlayers.includes(player) &&
                (player.timeSlots.length === 1 || player.multipleGames === 'yes')) {
                timeSlotPlayers.push(player);
            }
        });

        // Finally, add any remaining available players who are willing to sub
        players.forEach(player => {
            if (player.timeSlots.includes(timeSlot) && 
                !timeSlotPlayers.includes(player) && 
                !assignedPlayers.has(player.discordUsername) && 
                player.willSub === 'yes') {
                timeSlotPlayers.push(player);
            }
        });

        // Create teams for this time slot
        let slotResult = createOptimalTeamsForTimeSlot(timeSlotPlayers, timeSlot, assignedPlayers);

        result.teams = result.teams.concat(slotResult.teams);
        result.substitutes[timeSlot] = slotResult.substitutes;

        // Only add players to assignedPlayers if they were actually assigned to a team
        // and they don't want to play multiple games
        slotResult.teams.forEach(team => {
            team.players.forEach(player => {
                if (player.multipleGames !== 'yes') {
                    assignedPlayers.add(player.discordUsername);
                }
            });
        });

        Logger.log(`Created ${slotResult.teams.length} teams for time slot: ${timeSlot}`);
        Logger.log(`Substitutes for time slot ${timeSlot}: ${slotResult.substitutes.length}`);
    });

    return result;
}

export function createOptimalTeamsForTimeSlot(players, timeSlot, assignedPlayers) {
    const numPlayers = players.length;
    const maxTeams = Math.floor(numPlayers / TEAM_SIZE);

    // Ensure even number of teams and all teams have exactly TEAM_SIZE players
    const adjustedNumTeams = Math.floor(maxTeams / 2) * 2;

    // If we don't have enough players for at least 2 teams of TEAM_SIZE, return empty result
    if (adjustedNumTeams < 2) {
        return {
            teams: [],
            substitutes: players.filter(p => p.willSub === 'yes'),
            assignedPlayers: new Set()
        };
    }

    let teams = [];

    // Initialize empty teams
    for (let i = 0; i < adjustedNumTeams; i++) {
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

    // Sort both groups by average rank (descending)
    priorityPlayers.sort((a, b) => b.averageRank - a.averageRank);
    nonPriorityPlayers.sort((a, b) => b.averageRank - a.averageRank);

    // First, distribute priority players using snake draft
    const priorityTeamPlayers = priorityPlayers.slice(0, adjustedNumTeams * TEAM_SIZE);
    for (let i = 0; i < priorityTeamPlayers.length; i++) {
        const round = Math.floor(i / adjustedNumTeams);
        const position = i % adjustedNumTeams;
        const teamIndex = round % 2 === 0 ? position : adjustedNumTeams - 1 - position;
        
        teams[teamIndex].players.push(priorityTeamPlayers[i]);
        teams[teamIndex].total += priorityTeamPlayers[i].averageRank;
    }

    // Then, distribute remaining players to fill teams
    const remainingSlots = adjustedNumTeams * TEAM_SIZE - priorityTeamPlayers.length;
    const remainingPlayers = nonPriorityPlayers.slice(0, remainingSlots);
    
    for (let i = 0; i < remainingPlayers.length; i++) {
        const round = Math.floor(i / adjustedNumTeams);
        const position = i % adjustedNumTeams;
        const teamIndex = round % 2 === 0 ? position : adjustedNumTeams - 1 - position;
        
        teams[teamIndex].players.push(remainingPlayers[i]);
        teams[teamIndex].total += remainingPlayers[i].averageRank;
    }

    // Verify all teams have exactly TEAM_SIZE players
    teams = teams.filter(team => team.players.length === TEAM_SIZE);

    // If we lost teams due to filtering, recalculate adjustedNumTeams
    const finalNumTeams = Math.floor(teams.length / 2) * 2;
    if (finalNumTeams < teams.length) {
        teams = teams.slice(0, finalNumTeams);
    }

    // Remaining players become substitutes only if they marked willSub as 'yes'
    const substitutes = [
        ...priorityPlayers.slice(priorityTeamPlayers.length).filter(p => p.willSub === 'yes'),
        ...nonPriorityPlayers.slice(remainingPlayers.length).filter(p => p.willSub === 'yes')
    ];

    // Optimize team balance
    const targetTotal = teams.reduce((sum, team) => sum + team.total, 0) / teams.length;
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
                        const newTotal1 = teams[i].total - player1.averageRank + player2.averageRank;
                        const newTotal2 = teams[j].total - player2.averageRank + player1.averageRank;
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
        }
    } while (improved);

    // Final verification that all teams have exactly TEAM_SIZE players
    teams = teams.filter(team => team.players.length === TEAM_SIZE);

    // Calculate team spread for logging
    const teamSpread = getTeamSpread(teams);
    Logger.log(`Team spread for ${timeSlot}: ${teamSpread.toFixed(2)}`);

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
