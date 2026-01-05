import { TEAM_SIZE, OUTPUT_SHEET_CONFIG } from './config.js';

import {
  getGameDay
} from './TimeSlotManager.js';

import {
  getPlayersData,
  writeTeamsToSheet
} from './PlayerData.js';

function applyLatestColumnConfig() {
    const configData = PropertiesService.getScriptProperties().getProperty('COLUMN_CONFIG');
    if (configData) {
        const configs = JSON.parse(configData);
        OUTPUT_SHEET_CONFIG.columns = configs.map(config => ({
            key: config.key,
            width: config.width,
            title: config.title,
            type: config.type
        }));
    }
}

function getTimeSlotsFromConfig() {
    const configData = PropertiesService.getScriptProperties().getProperty('COLUMN_CONFIG');
    if (configData) {
        const configs = JSON.parse(configData);
        const timeSlotsConfig = configs.find(c => c.key === 'timeSlots');
        if (timeSlotsConfig && timeSlotsConfig.sourceColumn) {
            // Extract time slots from the source column
            const ss = SpreadsheetApp.getActiveSpreadsheet();
            const playersSheet = ss.getSheets()[0];
            const columnIndex = timeSlotsConfig.sourceColumn.charCodeAt(0) - 65; // Convert A=0, B=1, etc.
            
            if (playersSheet.getLastRow() > 1) {
                const timeSlotsRange = playersSheet.getRange(2, columnIndex + 1, playersSheet.getLastRow() - 1, 1);
                const timeSlotValues = timeSlotsRange.getValues().flat().filter(Boolean);
                
                // Split any combined time slots and get unique values
                const splitTimeSlots = timeSlotValues.flatMap(slot => 
                    slot.toString().split(',').map(s => s.trim()).filter(s => s !== '')
                );
                
                const uniqueTimeSlots = [...new Set(splitTimeSlots)];
                Logger.log(`Extracted time slots from config: ${uniqueTimeSlots.join(', ')}`);
                return uniqueTimeSlots;
            }
        }
    }
    return [];
}

export function sortPlayersIntoBalancedTeams() {
    applyLatestColumnConfig();
    Logger.log("sortPlayersIntoBalancedTeams function started");

    // Get time slots from config instead of global TIME_SLOTS
    const TIME_SLOTS = getTimeSlotsFromConfig();
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
export function createOptimalTeams(players, timeSlots) {
    let result = {
        teams: [],
        substitutes: {}
    };
    let globalAssignedPlayers = new Set(); // Track players assigned across all time slots
    let tempAssignedPlayers = new Set(); // Track temporary assignments for current slot

    // Check if we have time slots from config
    if (!timeSlots || timeSlots.length === 0) {
        Logger.log("No time slots configured - balancing all players as one group");
        // Balance all players as one group
        const slotResult = createOptimalTeamsForTimeSlot(players, "All Players", tempAssignedPlayers);
        result.teams = slotResult.teams;
        result.substitutes = { "All Players": slotResult.substitutes };
        return result;
    }

    Logger.log(`Processing ${timeSlots.length} time slots from config: ${timeSlots.join(', ')}`);

    // Process each time slot from config
    timeSlots.forEach((timeSlot) => {
        Logger.log(`\nProcessing time slot: ${timeSlot}`);
        let timeSlotPlayers = [];

        // First, add unassigned players who can play in this time slot
        const unassignedPlayers = players.filter(p => {
            if (!p.timeSlots || !p.timeSlots.toString().trim()) return false;
            if (globalAssignedPlayers.has(p.discordUsername)) return false;
            
            // Split time slots by comma and check if any match
            const playerTimeSlots = p.timeSlots.toString().split(',').map(s => s.trim());
            const hasTimeSlot = playerTimeSlots.some(slot => 
                slot.toLowerCase() === timeSlot.toLowerCase()
            );
            
            return hasTimeSlot;
        });
        
        Logger.log(`Found ${unassignedPlayers.length} unassigned players for ${timeSlot}: ${unassignedPlayers.map(p => p.discordUsername).join(', ')}`);
        
        // Add unassigned players first
        unassignedPlayers.forEach(player => {
            timeSlotPlayers.push(player);
            Logger.log(`Added unassigned player: ${player.discordUsername} (Rank: ${player.currentRank})`);
        });

        // Only if we don't have enough players for teams, add players who have already played
        if (timeSlotPlayers.length < TEAM_SIZE * 2) {
            Logger.log(`Not enough unassigned players (${timeSlotPlayers.length}), looking for multi-game players...`);
            
            // Add players who have already played but can play multiple games
            players.forEach(player => {
                if (!player.timeSlots || !player.timeSlots.toString().trim()) return;
                if (!globalAssignedPlayers.has(player.discordUsername)) return;
                if (timeSlotPlayers.includes(player)) return;
                if (!player.multipleGames || player.multipleGames.toLowerCase() !== 'yes') return;
                
                // Split time slots by comma and check if any match
                const playerTimeSlots = player.timeSlots.toString().split(',').map(s => s.trim());
                const hasTimeSlot = playerTimeSlots.some(slot => 
                    slot.toLowerCase() === timeSlot.toLowerCase()
                );
                
                if (hasTimeSlot) {
                    timeSlotPlayers.push(player);
                    Logger.log(`Added multi-game player: ${player.discordUsername} (Rank: ${player.currentRank}, multipleGames: ${player.multipleGames})`);
                }
            });
            
            Logger.log(`After adding multi-game players: ${timeSlotPlayers.length} total players`);
        }

        // Create teams for this time slot
        let slotResult = createOptimalTeamsForTimeSlot(timeSlotPlayers, timeSlot, tempAssignedPlayers);

        // Update global assignments
        slotResult.teams.forEach(team => {
            team.players.forEach(player => {
                globalAssignedPlayers.add(player.discordUsername);
                tempAssignedPlayers.add(player.discordUsername);
            });
        });

        // Add players as substitutes if they've already played in a team OR are willing to sub
        result.substitutes[timeSlot] = slotResult.substitutes.filter(sub => 
            globalAssignedPlayers.has(sub.discordUsername) || (sub.willSub && sub.willSub.toLowerCase() === 'yes')
        );

        result.teams = result.teams.concat(slotResult.teams);

        Logger.log(`\nCreated ${slotResult.teams.length} teams for time slot: ${timeSlot}`);
        Logger.log(`Substitutes for time slot ${timeSlot}: ${result.substitutes[timeSlot].length}`);
        Logger.log(`Current global assigned players: ${Array.from(globalAssignedPlayers).join(', ')}`);
    });

    // After processing all time slots, mark players as permanently assigned if they don't want to play multiple games
    result.teams.forEach(team => {
        team.players.forEach(player => {
            if (!player.multipleGames || player.multipleGames.toLowerCase() !== 'yes') {
                globalAssignedPlayers.add(player.discordUsername);
                Logger.log(`Marked as permanently assigned (no multiple games): ${player.discordUsername} (multipleGames: ${player.multipleGames})`);
            } else {
                Logger.log(`Player can play multiple games: ${player.discordUsername} (multipleGames: ${player.multipleGames})`);
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
            substitutes: players.filter(p => p.willSub && p.willSub.toLowerCase() === 'yes'),
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

    // Separate players into unassigned and previously assigned groups
    const unassignedPlayers = players.filter(p => !assignedPlayers.has(p.discordUsername));
    const previouslyAssignedPlayers = players.filter(p => assignedPlayers.has(p.discordUsername));
    Logger.log(`\nUnassigned players: ${unassignedPlayers.map(p => p.discordUsername).join(', ')}`);
    Logger.log(`Previously assigned players: ${previouslyAssignedPlayers.map(p => p.discordUsername).join(', ')}`);

    // First, distribute unassigned players to ensure everyone plays
    const allTeamPlayers = [...unassignedPlayers, ...previouslyAssignedPlayers].slice(0, numTeams * TEAM_SIZE);
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
        Logger.log(`Not enough complete teams after filtering (have ${teams.length}, need 2)`);
        return {
            teams: [],
            substitutes: players.filter(p => p.willSub && p.willSub.toLowerCase() === 'yes'),
            assignedPlayers: new Set()
        };
    }

    // Remaining players become substitutes
    const assignedPlayerNames = teams.flatMap(team => team.players.map(p => p.discordUsername));
    const substitutes = players.filter(p => !assignedPlayerNames.includes(p.discordUsername));

    // Optimize team balance
    const targetTotal = teams.reduce((sum, team) => sum + team.total, 0) / teams.length;
    Logger.log(`\nOptimizing team balance (target total: ${targetTotal.toFixed(2)})`);

    for (let iteration = 0; iteration < 100; iteration++) {
        let improved = false;
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                if (trySwapPlayers(teams[i], teams[j])) {
                    improved = true;
                }
            }
        }
        if (!improved) break;
    }

    // Calculate final team spread for logging
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

function trySwapPlayers(team1, team2) {
    for (let i = 0; i < team1.players.length; i++) {
        for (let j = 0; j < team2.players.length; j++) {
            const player1 = team1.players[i];
            const player2 = team2.players[j];
            
            // Skip if either player doesn't want to play multiple games
            if (player1.multipleGames && player1.multipleGames.toLowerCase() !== 'yes') {
                continue;
            }
            if (player2.multipleGames && player2.multipleGames.toLowerCase() !== 'yes') {
                continue;
            }
            
            // Calculate new totals if we swap these players
            const newTotal1 = team1.total - Math.sqrt(player1.averageRank) + Math.sqrt(player2.averageRank);
            const newTotal2 = team2.total - Math.sqrt(player2.averageRank) + Math.sqrt(player1.averageRank);
            
            // Check if this swap improves balance
            const currentDiff = Math.abs(team1.total - team2.total);
            const newDiff = Math.abs(newTotal1 - newTotal2);
            
            if (newDiff < currentDiff) {
                // Perform the swap
                const temp = team1.players[i];
                team1.players[i] = team2.players[j];
                team2.players[j] = temp;
                team1.total = newTotal1;
                team2.total = newTotal2;
                
                Logger.log(`Swapped ${player1.discordUsername} and ${player2.discordUsername} between teams`);
                return true;
            }
        }
    }
    return false;
}

export function getTeamSpread(teams) {
    const totals = teams.map(team => team.total);
    return Math.max(...totals) - Math.min(...totals);
}
