import {
    getScriptPropByName
} from './config.js'

import {
    getTimeSlots,
} from './TimeSlotManager.js';
import {
  getRankValue,
  getRankName,
  setConditionalFormatting
} from './Utilities.js';
import Player from './classes/Player.js';

export function getPlayersData(sheet) {
    const TIME_SLOTS = getTimeSlots();
    const data = sheet.getDataRange().getValues();
    Logger.log(`Raw data: ${JSON.stringify(data.slice(0, 2))}`);

    if (data.length < 2) {
        Logger.log("Not enough data in the sheet. Make sure there's at least one player entry.");
        return [];
    }

    let playerNames = [];

    try {
        const players = data.slice(1).map((row, index) => {
            const player = new Player(
                row[getScriptPropByName(COLUMN_TIMESTAMP)],
                row[getScriptPropByName(COLUMN_DISCORDNAME)],
                row[getScriptPropByName(COLUMN_RIOTID)],
                row[getScriptPropByName(COLUMN_PRONOUNS)],
                row[getScriptPropByName(COLUMN_TIMESLOTS)] ? row[getScriptPropByName(COLUMN_TIMESLOTS)].toString().split(',').map(s => s.trim()) : getScriptPropByName(TIME_SLOTS),
                row[getScriptPropByName(COLUMN_MULTIPLEGAMES)].toString().toLowerCase() === 'yes',
                row[getScriptPropByName(COLUMN_WILLSUB)].toString().toLowerCase() === 'yes',
                row[getScriptPropByName(COLUMN_WILLHOST)].toString().toLowerCase() === 'yes',
                row[getScriptPropByName(COLUMN_DUOREQUEST)],
                getRankValue(row[getScriptPropByName(COLUMN_CURRENTRANK)]),
                getRankValue(row[getScriptPropByName(COLUMN_PEAKRANK)])
            );

            Logger.log(`Player ${index + 1}: Discord: ${player.discordUsername},
            Current Rank: ${row[9]} (${player.currentRank}), Peak Rank: ${row[10]} (${player.peakRank}),
            Substitute: ${player.substitute}, Time Slots: ${player.timeSlots}`);

            const discordName = player.getDiscordName();
            if (playerNames.includes(discordName)) {
                //player has already been processed once -- needs review & possible removal for double-submission!
                throw Error(`Double-submission detected, please review: ${discordName}`);
            }
            playerNames.push(discordName);
            return player;
        });
    } catch ({errorType, message}) {
        const ui = SpreadsheetApp.getUi();
        ui.alert('Double-Submission', message, ui.ButtonSet.OK);
        return [];
    }

    let validPlayers = [];
    players.forEach(Player => {
        if (Player.getIsValidPlayer()) {
            validPlayers.push(Player);
        } else {
            const currentRank = Player.getCurrentRank();
            const peakRank = Player.getPeakRank();
            Logger.log(`Filtered out player: ${discordName} (Current Rank: ${currentRank}, Peak Rank: ${peakRank})`);
        }
    });

    Logger.log(`Number of players before filtering: ${players.length}`);
    Logger.log(`Number of players after filtering: ${validPlayers.length}`);
    Logger.log(`Sample player data: ${JSON.stringify(validPlayers[0])}`);

    return players;
}

/**
 * Try to match players with their duo requests & update the corresponding player objects
 *
 * @param players = array of player objects
 */
export function processDuos(players) {
    const playerCount = players.length;

    //TODO: optimize, with <50 players expected it probably isn't much of a performance hit but it's not great
    for (let i = 0; i < playerCount; i++) {
        for (let j = 1; j < playerCount; j++) {
            //duo hasn't already been set for these players & they submitted a duo request
            if (players[i].getDuoPlayer() == null &&
                players[j].getDuoPlayer() == null &&
                players[i].getDuoRequest() != '' &&
                players[j].getDuoRequest() != ''
            ) {
                //the players both submitted the other's discord name as their duo request
                if (players[i].getDuoRequest() == players[j].getDiscordName() &&
                    players[j].getDuoRequest() == players[i].getDiscordName()
                ) {
                    players[i].setDuo(players[j]);
                    players[j].setDuo(players[i]);
                }
            }
        }
    }
}

export function writeTeamsToSheet(sheet, teamsAndSubs) {
    const TIME_SLOTS = getTimeSlots(); // Refresh TIME_SLOTS at the start of the function

    sheet.clear();
    let rowIndex = 0;
    const teamColors = ["#FFF2CC", "#D9EAD3", "#C9DAF8", "#F4CCCC", "#FFD966", "#B6D7A8", "#9FC5E8", "#EA9999"];
    const headerColor = "#4A86E8";
    const subHeaderColor = "#A4C2F4";

    TIME_SLOTS.forEach((timeSlot, slotIndex) => {
        // Write time slot header
        sheet.getRange(rowIndex + 1, 1, 1, 6).merge()
            .setValue(timeSlot)
            .setFontWeight("bold")
            .setBackground(headerColor)
            .setFontColor("#ffffff")
            .setFontSize(14)
            .setHorizontalAlignment("center");
        rowIndex++;

        const timeSlotTeams = teamsAndSubs.teams.filter(team => team.timeSlot === timeSlot);

        timeSlotTeams.forEach((team, teamIndex) => {
            const teamColor = teamColors[(slotIndex * 4 + teamIndex) % teamColors.length];
            const sortedPlayers = team.players.sort((a, b) => b.averageRank - a.averageRank); // Sort players by AVG Rank

            // Write team header
            sheet.getRange(rowIndex + 1, 1, 1, 5).merge()
                .setValue(team.name)
                .setFontWeight("bold")
                .setBackground(teamColor)
                .setFontColor("#000000")
                .setFontSize(12)
                .setHorizontalAlignment("center");

            // Add Team Total in the same row
            const totalCell = sheet.getRange(rowIndex + 1, 6);
            totalCell.setFontWeight("bold")
                .setBackground(teamColor)
                .setFontColor("#000000")
                .setFontSize(12)
                .setHorizontalAlignment("right");

            // Add formula for team total using column and row references
            const startRow = rowIndex + 3;
            const endRow = startRow + TEAM_SIZE - 1;
            const totalFormula = `SUM($F${startRow}:$F${endRow})`;
            totalCell.setFormula(`"Total: " & TEXT(${totalFormula}, "0.0")`);

            rowIndex++;

            // Write player header
            const headerRange = sheet.getRange(rowIndex + 1, 1, 1, 6);
            headerRange.setValues([["Discord", "Riot ID", "Current Rank", "Peak Rank", "Lobby Host", "Avg Rank"]])
                .setFontWeight("bold")
                .setBackground(teamColor)
                .setFontColor("#000000")
                .setHorizontalAlignment("center");
            rowIndex++;

            // Write player data
            sortedPlayers.forEach(player => {
                const playerRow = [
                    player.discordUsername,
                    player.riotID,
                    getRankName(player.currentRank),
                    getRankName(player.peakRank),
                    player.lobbyHost,
                    player.averageRank.toFixed(2)
                ];
                const range = sheet.getRange(rowIndex + 1, 1, 1, playerRow.length);
                range.setValues([playerRow]).setBackground(teamColor);

                // Set alignment
                range.setHorizontalAlignment("center").setVerticalAlignment("middle");
                range.setVerticalAlignment("middle");
                range.setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);

                setConditionalFormatting(range.offset(0, 2, 1, 2)); // Apply conditional formatting to Current Rank and Peak Rank
                rowIndex++;
            });

            rowIndex++; // Add an empty row between teams
        });

        // Write substitutes for this time slot
        const substitutes = teamsAndSubs.substitutes[timeSlot];
        if (substitutes && substitutes.length > 0) {
            // Write substitutes header
            sheet.getRange(rowIndex + 1, 1, 1, 6).merge()
                .setValue(`Substitutes`)
                .setFontWeight("bold")
                .setBackground(subHeaderColor)
                .setFontColor("#000000")
                .setFontSize(12)
                .setHorizontalAlignment("center");
            rowIndex++;

            // Write substitutes column headers
            const subHeaderRange = sheet.getRange(rowIndex + 1, 1, 1, 6);
            subHeaderRange.setValues([["Discord", "Riot ID", "Current Rank", "Peak Rank", "Lobby Host", "Avg Rank"]])
                .setFontWeight("bold")
                .setBackground(subHeaderColor)
                .setFontColor("#000000")
                .setHorizontalAlignment("center");
            rowIndex++;

            // Write substitute player data
            substitutes.forEach(sub => {
                const subRow = [
                    sub.discordUsername,
                    sub.riotID,
                    getRankName(sub.currentRank),
                    getRankName(sub.peakRank),
                    sub.lobbyHost,
                    sub.averageRank.toFixed(2)
                ];
                const range = sheet.getRange(rowIndex + 1, 1, 1, subRow.length);
                range.setValues([subRow]).setBackground("#F3F3F3");

                // Set alignment
                range.setHorizontalAlignment("center").setVerticalAlignment("middle");
                range.setVerticalAlignment("middle");
                range.setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);

                setConditionalFormatting(range.offset(0, 2, 1, 2)); // Apply conditional formatting to Current Rank and Peak Rank
                rowIndex++;
            });

            rowIndex++; // Add an empty row after substitutes
        }

        rowIndex += 2; // Add some space before the next time slot
    });

    // Adjust column widths
    sheet.autoResizeColumns(1, 6);
    sheet.setColumnWidth(1, 150); // Set Discord column width
    sheet.setColumnWidth(2, 150); // Set Riot ID column width
    sheet.setColumnWidth(6, 100); // Set Avg Rank column width
}
