import { DEFAULT_TIME_SLOTS, TIME_SLOTS_COLUMN, TEAM_SIZE } from './config.js';
import {
    getTimeSlots,
} from './TimeSlotManager.js';
import {
  getRankValue,
  getRankName,
  setConditionalFormatting
} from './Utilities.js';

export function getPlayersData(sheet) {
    const TIME_SLOTS = getTimeSlots();
    const data = sheet.getDataRange().getValues();
    Logger.log(`Raw data: ${JSON.stringify(data.slice(0, 2))}`);

    if (data.length < 2) {
        Logger.log("Not enough data in the sheet. Make sure there's at least one player entry.");
        return [];
    }

    const players = data.slice(1).map((row, index) => {
        const player = {
            timestamp: row[0],
            discordUsername: row[1],
            riotID: row[2],
            pronouns: row[3],
            timeSlots: row[TIME_SLOTS_COLUMN - 1] ? row[TIME_SLOTS_COLUMN - 1].toString().split(',').map(s => s.trim()) : TIME_SLOTS,
            multipleGames: row[5] ? row[5].toString().toLowerCase() : '',
            willSub: row[6] ? row[6].toString().toLowerCase() : '',
            lobbyHost: row[7],
            duo: row[8],
            currentRank: getRankValue(row[9]),
            peakRank: getRankValue(row[10]),
        };
        player.averageRank = (player.currentRank + player.peakRank) / 2;

        Logger.log(`Player ${index + 1}: Discord: ${player.discordUsername},\n        Current Rank: ${row[9]} (${player.currentRank}), Peak Rank: ${row[10]} (${player.peakRank}),\n        WillSub: ${player.willSub}, MultipleGames: ${player.multipleGames}, Time Slots: ${player.timeSlots}`);

        return player;
    });

    const validPlayers = players.filter(player => {
        const isValid = player.currentRank > 0 || player.peakRank > 0;
        if (!isValid) {
            Logger.log(`Filtered out player: ${player.discordUsername} (Current Rank: ${player.currentRank}, Peak Rank: ${player.peakRank})`);
        }
        return isValid;
    });

    Logger.log(`Number of players before filtering: ${players.length}`);
    Logger.log(`Number of players after filtering: ${validPlayers.length}`);
    Logger.log(`Sample player data: ${JSON.stringify(validPlayers[0])}`);

    return validPlayers;
}

export function writeTeamsToSheet(sheet, teamsAndSubs, TIME_SLOTS) {
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
