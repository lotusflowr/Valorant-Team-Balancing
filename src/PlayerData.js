import { 
    TEAM_SIZE,
    INPUT_SHEET_CONFIG,
    OUTPUT_SHEET_CONFIG,
    STYLING
} from './config.js';
import { getTimeSlots } from './TimeSlotManager.js';
import {
  getRankValue,
  getRankName,
  setConditionalFormatting
} from './Utilities.js';
import { createColumnWriter } from './ColumnWriter.js';

function getColumnConfig() {
    const configData = PropertiesService.getScriptProperties().getProperty('COLUMN_CONFIG');
    if (configData) {
        return JSON.parse(configData);
    }
    return [];
}

function getInputColumnIndex(key, config) {
    const entry = config.find(c => c.key === key);
    if (!entry || !entry.sourceColumn || entry.sourceColumn === 'N/A') return null;
    // Convert column letter to 0-based index
    return entry.sourceColumn.charCodeAt(0) - 65;
}

export function getPlayersData(sheet) {
    const config = getColumnConfig();
    const data = sheet.getDataRange().getValues();
    Logger.log(`Raw data: ${JSON.stringify(data.slice(0, 2))}`);

    if (data.length < 2) {
        Logger.log("Not enough data in the sheet. Make sure there's at least one player entry.");
        return [];
    }

    const players = data.slice(1).map(row => {
        const player = {};
        config.forEach(col => {
            const idx = getInputColumnIndex(col.key, config);
            if (idx !== null && idx < row.length) {
                player[col.key] = row[idx];
            }
        });
        // Add calculated fields
        if ('currentRank' in player && 'peakRank' in player) {
            player.averageRank = (getRankValue(player.currentRank) + getRankValue(player.peakRank)) / 2;
        }
        return player;
    });
    Logger.log('Parsed players: ' + JSON.stringify(players));
    if (!players.length) {
        Logger.log('No valid players found. Raw data: ' + JSON.stringify(data));
        Logger.log('Config: ' + JSON.stringify(config));
    }

    const validPlayers = players.filter(player => {
        const current = getRankValue(player.currentRank);
        const peak = getRankValue(player.peakRank);
        const isValid = current > 0 || peak > 0;
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
    
    // Create column writer for flexible column handling
    const writer = createColumnWriter(sheet);

    // Check if we have time slot-based teams or single group teams
    const hasTimeSlots = teamsAndSubs.teams.some(team => team.timeSlot !== "All Players");
    
    if (!hasTimeSlots) {
        // Single group - no time slot headers
        Logger.log("Writing teams without time slot headers");
        
        teamsAndSubs.teams.forEach((team, teamIndex) => {
            const teamColor = STYLING.colors.team[teamIndex % STYLING.colors.team.length];
            const sortedPlayers = team.players.sort((a, b) => b.averageRank - a.averageRank);

            // Write team header (merged, leaving space for total)
            writer.writeMergedHeader(rowIndex + 1, team.name, {
                backgroundColor: teamColor,
                textColor: STYLING.colors.text.black,
                fontSize: STYLING.fontSize.teamHeader,
                mergeAll: false // Don't merge the last column (for total)
            });

            // Add Team Total in the last column
            const totalCell = sheet.getRange(rowIndex + 1, writer.getTotalColumns());
            totalCell.setFontWeight("bold")
                .setBackground(teamColor)
                .setFontColor(STYLING.colors.text.black)
                .setFontSize(STYLING.fontSize.teamHeader)
                .setHorizontalAlignment("right");

            // Add formula for team total
            const startRow = rowIndex + 3;
            const endRow = startRow + TEAM_SIZE - 1;
            const avgRankCol = writer.getColumnIndex('averageRank');
            const totalFormula = `SUM(${String.fromCharCode(64 + avgRankCol)}${startRow}:${String.fromCharCode(64 + avgRankCol)}${endRow})`;
            totalCell.setFormula(`="Total: " & TEXT(${totalFormula}, "0.0")`);

            rowIndex++;

            // Write player headers
            writer.writeHeaders(rowIndex + 1, {
                backgroundColor: teamColor,
                textColor: STYLING.colors.text.black,
                fontSize: STYLING.fontSize.teamHeader
            });
            rowIndex++;

            // Write player data
            sortedPlayers.forEach(player => {
                const range = writer.writePlayerRow(rowIndex + 1, player, {
                    backgroundColor: teamColor,
                    textColor: STYLING.colors.text.black,
                    fontSize: STYLING.fontSize.player
                });

                // Apply conditional formatting to rank columns
                const currentRankCol = writer.getColumnIndex('currentRank');
                const peakRankCol = writer.getColumnIndex('peakRank');
                const rankRange = sheet.getRange(rowIndex + 1, currentRankCol, 1, 2);
                setConditionalFormatting(rankRange);
                
                rowIndex++;
            });

            rowIndex++; // Add an empty row between teams
        });

        // Write substitutes if any
        const substitutes = teamsAndSubs.substitutes["All Players"];
        if (substitutes && substitutes.length > 0) {
            // Write substitutes header
            writer.writeMergedHeader(rowIndex + 1, 'Substitutes', {
                backgroundColor: STYLING.colors.subHeader,
                textColor: STYLING.colors.text.black,
                fontSize: STYLING.fontSize.subHeader
            });
            rowIndex++;

            // Write substitutes headers
            writer.writeHeaders(rowIndex + 1, {
                backgroundColor: STYLING.colors.subHeader,
                textColor: STYLING.colors.text.black,
                fontSize: STYLING.fontSize.subHeader
            });
            rowIndex++;

            // Write substitute player data
            substitutes.forEach(sub => {
                const range = writer.writePlayerRow(rowIndex + 1, sub, {
                    backgroundColor: STYLING.colors.substitute,
                    textColor: STYLING.colors.text.black,
                    fontSize: STYLING.fontSize.player
                });

                // Apply conditional formatting to rank columns
                const currentRankCol = writer.getColumnIndex('currentRank');
                const peakRankCol = writer.getColumnIndex('peakRank');
                const rankRange = sheet.getRange(rowIndex + 1, currentRankCol, 1, 2);
                setConditionalFormatting(rankRange);
                
                rowIndex++;
            });
        }
    } else {
        // Time slot-based teams - use existing logic
        TIME_SLOTS.forEach((timeSlot, slotIndex) => {
            // Write time slot header
            writer.writeMergedHeader(rowIndex + 1, timeSlot, {
                backgroundColor: STYLING.colors.header,
                textColor: STYLING.colors.text.white,
                fontSize: STYLING.fontSize.timeslot
            });
            rowIndex++;

            const timeSlotTeams = teamsAndSubs.teams.filter(team => team.timeSlot === timeSlot);

            timeSlotTeams.forEach((team, teamIndex) => {
                const teamColor = STYLING.colors.team[(slotIndex * 4 + teamIndex) % STYLING.colors.team.length];
                const sortedPlayers = team.players.sort((a, b) => b.averageRank - a.averageRank);

                // Write team header (merged, leaving space for total)
                writer.writeMergedHeader(rowIndex + 1, team.name, {
                    backgroundColor: teamColor,
                    textColor: STYLING.colors.text.black,
                    fontSize: STYLING.fontSize.teamHeader,
                    mergeAll: false // Don't merge the last column (for total)
                });

                // Add Team Total in the last column
                const totalCell = sheet.getRange(rowIndex + 1, writer.getTotalColumns());
                totalCell.setFontWeight("bold")
                    .setBackground(teamColor)
                    .setFontColor(STYLING.colors.text.black)
                    .setFontSize(STYLING.fontSize.teamHeader)
                    .setHorizontalAlignment("right");

                // Add formula for team total
                const startRow = rowIndex + 3;
                const endRow = startRow + TEAM_SIZE - 1;
                const avgRankCol = writer.getColumnIndex('averageRank');
                const totalFormula = `SUM(${String.fromCharCode(64 + avgRankCol)}${startRow}:${String.fromCharCode(64 + avgRankCol)}${endRow})`;
                totalCell.setFormula(`="Total: " & TEXT(${totalFormula}, "0.0")`);

                rowIndex++;

                // Write player headers
                writer.writeHeaders(rowIndex + 1, {
                    backgroundColor: teamColor,
                    textColor: STYLING.colors.text.black,
                    fontSize: STYLING.fontSize.teamHeader
                });
                rowIndex++;

                // Write player data
                sortedPlayers.forEach(player => {
                    const range = writer.writePlayerRow(rowIndex + 1, player, {
                        backgroundColor: teamColor,
                        textColor: STYLING.colors.text.black,
                        fontSize: STYLING.fontSize.player
                    });

                    // Apply conditional formatting to rank columns
                    const currentRankCol = writer.getColumnIndex('currentRank');
                    const peakRankCol = writer.getColumnIndex('peakRank');
                    const rankRange = sheet.getRange(rowIndex + 1, currentRankCol, 1, 2);
                    setConditionalFormatting(rankRange);
                    
                    rowIndex++;
                });

                rowIndex++; // Add an empty row between teams
            });

            // Write substitutes for this time slot
            const substitutes = teamsAndSubs.substitutes[timeSlot];
            if (substitutes && substitutes.length > 0) {
                // Write substitutes header
                writer.writeMergedHeader(rowIndex + 1, 'Substitutes', {
                    backgroundColor: STYLING.colors.subHeader,
                    textColor: STYLING.colors.text.black,
                    fontSize: STYLING.fontSize.subHeader
                });
                rowIndex++;

                // Write substitutes headers
                writer.writeHeaders(rowIndex + 1, {
                    backgroundColor: STYLING.colors.subHeader,
                    textColor: STYLING.colors.text.black,
                    fontSize: STYLING.fontSize.subHeader
                });
                rowIndex++;

                // Write substitute player data
                substitutes.forEach(sub => {
                    const range = writer.writePlayerRow(rowIndex + 1, sub, {
                        backgroundColor: STYLING.colors.substitute,
                        textColor: STYLING.colors.text.black,
                        fontSize: STYLING.fontSize.player
                    });

                    // Apply conditional formatting to rank columns
                    const currentRankCol = writer.getColumnIndex('currentRank');
                    const peakRankCol = writer.getColumnIndex('peakRank');
                    const rankRange = sheet.getRange(rowIndex + 1, currentRankCol, 1, 2);
                    setConditionalFormatting(rankRange);
                    
                    rowIndex++;
                });

                rowIndex++; // Add an empty row after substitutes
            }

            rowIndex += 2; // Add some space before the next time slot
        });
    }

    // Set column widths and auto-resize
    writer.setColumnWidths();
    // After all data/formatting is done, autofit only the data columns
    writer.autoResizeColumns();
    writer.autoResizeRows();
}
