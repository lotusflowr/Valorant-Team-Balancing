import { TEAM_SIZE } from './config.js';

import {
  getTimeSlots,
  getGameDay,
} from './TimeSlotManager.js';

import {
  getPlayersData,
  writeTeamsToSheet,
  processDuos
} from './PlayerData.js';

import TimeSlot from './classes/TimeSlot.js';

export function sortPlayersIntoBalancedTeams() {
    Logger.log("sortPlayersIntoBalancedTeams function started");

    // Update Time and Day variables
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

        processDuos(allPlayers);

        const teamsAndSubs = createOptimalTeams(allPlayers);
        Logger.log("Teams and substitutes created: " + JSON.stringify(teamsAndSubs));

        writeTeamsToSheet(teamsSheet, teamsAndSubs);
        Logger.log("Teams written to sheet");

    } catch (e) {
        Logger.log(`Error: ${e.message}`);
        throw e;
    }

    Logger.log("sortPlayersIntoBalancedTeams function completed");
}

/***** TEAM BALANCING LOGIC FUNCTIONS *****/
export function createOptimalTeams(players) {
    let result = {
        teams: [],
        substitutes: {}
    };
    let assignedPlayers = new Set();

    const TIME_SLOTS = getTimeSlots(); // Refresh TIME_SLOTS at the start of the function

    // Ensure TIME_SLOTS is defined and not empty
    if (!TIME_SLOTS || TIME_SLOTS.length === 0) {
        Logger.log("Error: TIME_SLOTS is undefined or empty");
        return result;
    }

    let TimeSlots = [];
    TIME_SLOTS.forEach((timeSlot, slotIndex) => {
        let Slot = new TimeSlot(timeSlot);

        Slot.processPlayersToTimeSlot(players);
        Slot.createLobbiesForSlot();
        Slot.createOptimalTeams(true);
        //TODO:
        //validate optimal teams
        //run Slot.createOptimalTeams(false) to try again without duos if needed

        TimeSlots.push(Slot);
    }

    // Process each time slot
    TIME_SLOTS.forEach((timeSlot, slotIndex) => {
        // Create teams for this time slot
        let slotResult = createOptimalTeamsForTimeSlot(timeSlotPlayers, timeSlot, assignedPlayers);

        result.teams = result.teams.concat(slotResult.teams);
        result.substitutes[timeSlot] = slotResult.substitutes;
        assignedPlayers = new Set([...assignedPlayers, ...slotResult.assignedPlayers]);

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

    let teams = [];

    // Initialize empty teams
    for (let i = 0; i < adjustedNumTeams; i++) {
        teams.push({
            name: `Team ${i + 1}`,
            timeSlot: timeSlot,
            players: [],
            total: 0 // total rank power of the team
        });
    }

    // Sort players: single time slot first, then unassigned, then by rank (descending)
    players.sort((a, b) => {
        if (a.timeSlots.length !== b.timeSlots.length) {
            return a.timeSlots.length - b.timeSlots.length;
        }
        if (assignedPlayers.has(a.discordUsername) !== assignedPlayers.has(b.discordUsername)) {
            return assignedPlayers.has(a.discordUsername) ? 1 : -1;
        }
        return b.averageRank - a.averageRank;
    });

    // Distribute players evenly across teams
    const teamPlayers = players.slice(0, adjustedNumTeams * TEAM_SIZE);
    for (let i = 0; i < teamPlayers.length; i++) {
        const teamIndex = i % adjustedNumTeams;
        teams[teamIndex].players.push(teamPlayers[i]);
        teams[teamIndex].total += teamPlayers[i].averageRank;
    }

    // Remaining players become substitutes
    const substitutes = players.slice(adjustedNumTeams * TEAM_SIZE);

    // Optimize team balance
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

    // Calculate team spread for logging
    const teamSpread = getTeamSpread(teams);
    Logger.log(`Team spread for ${timeSlot}: ${teamSpread.toFixed(2)}`);

    return {
        teams,
        substitutes,
        assignedPlayers: new Set([...assignedPlayers, ...teams.flatMap(team => team.players.map(p => p.discordUsername))])
    };
}

export function trySwapPlayers(team1, team2) {
    for (let i = 0; i < team1.players.length; i++) {
        for (let j = 0; j < team2.players.length; j++) {
            const diff1 = team1.players[i].averageRank - team2.players[j].averageRank;
            const newTotal1 = team1.total - diff1;
            const newTotal2 = team2.total + diff1;

            if (Math.abs(newTotal1 - newTotal2) < Math.abs(team1.total - team2.total)) {
                // Swap players
                const temp = team1.players[i];
                team1.players[i] = team2.players[j];
                team2.players[j] = temp;

                // Update totals
                team1.total = newTotal1;
                team2.total = newTotal2;

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
