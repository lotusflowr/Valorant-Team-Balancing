import { 
    DISCORD_PINGS_CONFIG,
    STYLING
} from './config.js';

function getColumnConfig() {
    const configData = PropertiesService.getScriptProperties().getProperty('COLUMN_CONFIG');
    if (configData) {
        return JSON.parse(configData);
    }
    return [];
}

function findDiscordColumn(teamsSheet) {
    const config = getColumnConfig();
    const discordConfig = config.find(c => c.key === 'discordUsername');
    
    if (!discordConfig) {
        throw new Error('discordUsername column not configured. Please add it to your column configuration.');
    }
    
    // Check first, second, and third rows for headers (time slots can push headers to row 2 or 3)
    const firstRow = teamsSheet.getRange(1, 1, 1, teamsSheet.getLastColumn()).getValues()[0];
    const secondRow = teamsSheet.getRange(2, 1, 1, teamsSheet.getLastColumn()).getValues()[0];
    const thirdRow = teamsSheet.getRange(3, 1, 1, teamsSheet.getLastColumn()).getValues()[0];
    
    Logger.log(`First row: ${JSON.stringify(firstRow)}`);
    Logger.log(`Second row: ${JSON.stringify(secondRow)}`);
    Logger.log(`Third row: ${JSON.stringify(thirdRow)}`);
    Logger.log(`Looking for Discord column with title: "${discordConfig.title}"`);
    
    // Try to find the Discord column in any of the first three rows
    const rows = [firstRow, secondRow, thirdRow];
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const headerRow = rows[rowIndex];
        Logger.log(`Checking row ${rowIndex + 1} for Discord column...`);
        
        for (let i = 0; i < headerRow.length; i++) {
            const headerValue = headerRow[i] ? headerRow[i].toString().trim() : '';
            Logger.log(`Column ${i}: "${headerValue}"`);
            
            if (headerValue.toLowerCase() === discordConfig.title.toLowerCase()) {
                Logger.log(`Found Discord column at index ${i} with title: ${headerValue} in row ${rowIndex + 1}`);
                return i;
            }
        }
    }
    
    // If exact match not found, try partial matches in all three rows
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const headerRow = rows[rowIndex];
        Logger.log(`Checking row ${rowIndex + 1} for partial Discord matches...`);
        
        for (let i = 0; i < headerRow.length; i++) {
            const headerValue = headerRow[i] ? headerRow[i].toString().trim() : '';
            if (headerValue.toLowerCase().includes('discord') || headerValue.toLowerCase().includes('username')) {
                Logger.log(`Found potential Discord column at index ${i} with title: ${headerValue} in row ${rowIndex + 1}`);
                return i;
            }
        }
    }
    
    throw new Error(`Discord column with title "${discordConfig.title}" not found in Teams sheet. Available headers in row 1: ${firstRow.join(', ')}. Available headers in row 2: ${secondRow.join(', ')}. Available headers in row 3: ${thirdRow.join(', ')}`);
}

export function generateDiscordPings() {
    Logger.log("Starting Discord Pings generation");
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const teamsSheet = ss.getSheetByName("Teams");
    
    if (!teamsSheet) {
        throw new Error("Teams sheet not found. Please create teams first.");
    }
    
    const allData = teamsSheet.getDataRange().getValues();
    Logger.log(`Total rows in Teams sheet: ${allData.length}`);
    
    // Find the Discord column
    const discordColIndex = findDiscordColumn(teamsSheet);
    Logger.log(`Discord column index: ${discordColIndex}`);
    
    // Find the Lobby Host column if it exists
    const config = getColumnConfig();
    const lobbyHostConfig = config.find(c => c.key === 'lobbyHost');
    let lobbyHostColIndex = null;
    if (lobbyHostConfig) {
        // Check first, second, and third rows for lobby host column
        const firstRow = teamsSheet.getRange(1, 1, 1, teamsSheet.getLastColumn()).getValues()[0];
        const secondRow = teamsSheet.getRange(2, 1, 1, teamsSheet.getLastColumn()).getValues()[0];
        const thirdRow = teamsSheet.getRange(3, 1, 1, teamsSheet.getLastColumn()).getValues()[0];
        
        for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
            const headerRow = rowIndex === 0 ? firstRow : rowIndex === 1 ? secondRow : thirdRow;
            for (let i = 0; i < headerRow.length; i++) {
                const headerValue = headerRow[i] ? headerRow[i].toString().trim() : '';
                if (headerValue.toLowerCase() === lobbyHostConfig.title.toLowerCase()) {
                    lobbyHostColIndex = i;
                    Logger.log(`Found Lobby Host column at index ${i} with title: ${headerValue} in row ${rowIndex + 1}`);
                    break;
                }
            }
            if (lobbyHostColIndex !== null) break;
        }
    }
    
    // Initialize variables
    let currentTimeSlot = null;
    let currentTeam = null;
    let teams = [];
    let substitutes = {};
    let currentSection = null; // Possible values: null, "team", "players", "substitutes", "substitutesPlayers"
    
    // Process each row in the Teams sheet
    for (let i = 0; i < allData.length; i++) {
        const row = allData[i];
        const firstCell = row[0] ? row[0].toString().trim() : '';
        Logger.log(`Processing row ${i + 1}: "${firstCell}"`);
        
        // Detect Time Slot (look for time patterns and specific formats)
        const timePatterns = ['am', 'pm', 'pst', 'est', 'cst', 'mst', 'utc', 'gmt'];
        const hasTimePattern = timePatterns.some(pattern => firstCell.toLowerCase().includes(pattern));
        
        // Time slots should contain time patterns AND be in a specific format (like "6pm PST/9pm EST")
        // Also check that it's not a team name or other content
        if (hasTimePattern && 
            !firstCell.includes('Total') && 
            !firstCell.startsWith('Team') && 
            !firstCell.startsWith('Discord') && 
            !firstCell.startsWith('Substitutes') &&
            (firstCell.includes('/') || firstCell.includes(' ')) &&
            firstCell.length > 5) { // Time slots are typically longer than team names
            currentTimeSlot = firstCell;
            currentSection = "timeSlot";
            if (!substitutes[currentTimeSlot]) {
                substitutes[currentTimeSlot] = [];
            }
            Logger.log(`Detected Time Slot: "${currentTimeSlot}"`);
            continue;
        }
        
        // Detect Team Header
        if (firstCell.startsWith("Team")) {
            currentTeam = {
                name: firstCell,
                timeSlot: currentTimeSlot,
                players: []
            };
            teams.push(currentTeam);
            currentSection = "team";
            Logger.log(`Detected Team: "${currentTeam.name}" under Time Slot: "${currentTimeSlot}"`);
            continue;
        }
        
        // Detect "Discord" header indicating the start of Players section for a Team
        if (firstCell === "Discord" && currentSection === "team") {
            currentSection = "players";
            Logger.log(`Detected Players section under Team: "${currentTeam.name}"`);
            continue;
        }
        
        // Detect "Substitutes" header
        if (firstCell === "Substitutes") {
            currentTeam = null;
            currentSection = "substitutes";
            Logger.log(`Detected Substitutes section under Time Slot: "${currentTimeSlot}"`);
            continue;
        }
        
        // Detect "Discord" header indicating the start of Players section for Substitutes
        if (firstCell === "Discord" && currentSection === "substitutes") {
            currentSection = "substitutesPlayers";
            Logger.log(`Detected Players section under Substitutes for Time Slot: "${currentTimeSlot}"`);
            continue;
        }
        
        // Process Player Rows for Teams
        if (currentSection === "players" && firstCell !== "") {
            // Since Discord column is at index 0, the first cell contains the Discord username
            const discordValue = firstCell;
            const lobbyHostValue = lobbyHostColIndex !== null ? row[lobbyHostColIndex] : null;
            
            if (discordValue && discordValue !== 'Discord') {
                const player = {
                    discordUsername: discordValue.toString().replace(/^@/, '').trim(),
                    riotID: row[1] ? row[1].toString().trim() : "",
                    lobbyHost: lobbyHostValue ? lobbyHostValue.toString().trim().toLowerCase() === "yes" : false
                };
                currentTeam.players.push(player);
                Logger.log(`Added Player to Team "${currentTeam.name}": "@${player.discordUsername}" (Lobby Host: ${player.lobbyHost})`);
            }
            continue;
        }
        
        // Process Player Rows for Substitutes
        if (currentSection === "substitutesPlayers" && firstCell !== "") {
            // Since Discord column is at index 0, the first cell contains the Discord username
            const discordValue = firstCell;
            const lobbyHostValue = lobbyHostColIndex !== null ? row[lobbyHostColIndex] : null;
            
            if (discordValue && discordValue !== 'Discord') {
                const substitute = {
                    discordUsername: discordValue.toString().replace(/^@/, '').trim(),
                    riotID: row[1] ? row[1].toString().trim() : "",
                    lobbyHost: lobbyHostValue ? lobbyHostValue.toString().trim().toLowerCase() === "yes" : false
                };
                // Handle no timeslot scenario by using a default key
                const timeSlotKey = currentTimeSlot || "";
                if (!substitutes[timeSlotKey]) {
                    substitutes[timeSlotKey] = [];
                }
                substitutes[timeSlotKey].push(substitute);
                Logger.log(`Added Substitute to Time Slot "${timeSlotKey}": "@${substitute.discordUsername}" (Lobby Host: ${substitute.lobbyHost})`);
            }
            continue;
        }
        
        // Reset section if encountering an empty row
        if (firstCell === "") {
            currentSection = null;
            Logger.log("Encountered empty row. Resetting current section.");
            continue;
        }
    }
    
    Logger.log(`Total Teams Parsed: ${teams.length}`);
    Logger.log(`Total Substitutes Parsed: ${JSON.stringify(substitutes)}`);
    
    // Create pings content
    const currentDate = new Date();
    const gameDay = PropertiesService.getScriptProperties().getProperty('GAME_DAY') || "Saturday";
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const gameDayIndex = daysOfWeek.indexOf(gameDay);
    const currentDayIndex = currentDate.getDay();
    const daysUntilGame = (7 + gameDayIndex - currentDayIndex) % 7;
    const nextGameDay = new Date(currentDate);
    nextGameDay.setDate(currentDate.getDate() + daysUntilGame);
    const formattedDate = nextGameDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    Logger.log(`Game Day: "${gameDay}", Date: "${formattedDate}"`);
    
    // Create the content array
    const contentArray = [];
    
    // Add title as first element
    contentArray.push(`# Here are the teams for ${gameDay}, ${formattedDate}!`);
    Logger.log("Added title to contentArray.");
    
    // Group teams by time slot
    const timeSlots = [...new Set(teams.map(team => team.timeSlot))];
    Logger.log(`Unique Time Slots: ${timeSlots.join(", ")}`);
    
    timeSlots.forEach(timeSlot => {
        const timeSlotTeams = teams.filter(team => team.timeSlot === timeSlot);
        const timeSlotSubstitutes = substitutes[timeSlot] || [];
        
        if (timeSlotTeams.length > 0 || timeSlotSubstitutes.length > 0) {
            // Only add time slot header if it's not empty
            if (timeSlot && timeSlot !== "") {
                contentArray.push(`## ${timeSlot} Timeslot`);
                Logger.log(`Added Time Slot Header: "${timeSlot} Timeslot"`);
            }
            
            // Group teams into pairs (e.g., Team 1 & Team 2)
            for (let i = 0; i < timeSlotTeams.length; i += 2) {
                const pair = timeSlotTeams.slice(i, i + 2);
                Logger.log(`Processing Team Pair: "${pair.map(t => t.name).join(" & ")}"`);
                
                // Assign one Lobby Host per pair
                const lobbyHosts = pair.flatMap(team => team.players).filter(player => player.lobbyHost);
                let selectedHost = null;
                if (lobbyHosts.length > 0) {
                    selectedHost = lobbyHosts[0]; // Select the first Lobby Host found
                    Logger.log(`Selected Lobby Host: "@${selectedHost.discordUsername}" for Team Pair: "${pair.map(t => t.name).join(" & ")}"`);
                } else {
                    Logger.log(`No Lobby Host found for Team Pair: "${pair.map(t => t.name).join(" & ")}"`);
                }
                
                // Add Lobby Host section if a host is selected
                if (selectedHost) {
                    contentArray.push("### Lobby Host");
                    contentArray.push(`@${selectedHost.discordUsername}`);
                    contentArray.push(''); // Blank line after Lobby Host
                    Logger.log(`Added Lobby Host Section: "@${selectedHost.discordUsername}"`);
                }
                
                // Add each team in the pair
                pair.forEach(team => {
                    contentArray.push(`### ${team.name}`);
                    Logger.log(`Added Team Header: "${team.name}"`);
                    team.players.forEach(player => {
                        contentArray.push(`@${player.discordUsername}`);
                        Logger.log(`Added Player Mention: "@${player.discordUsername}"`);
                    });
                    // Remove blank line after each team
                    Logger.log(`Added team "${team.name}" without blank line`);
                });
            }
            
            // Add substitutes section if there are any
            if (timeSlotSubstitutes.length > 0) {
                contentArray.push("### Substitutes");
                Logger.log(`Added Substitutes Header for Time Slot: "${timeSlot || 'No Time Slot'}"`);
                timeSlotSubstitutes.forEach(sub => {
                    contentArray.push(`@${sub.discordUsername}`);
                    Logger.log(`Added Substitute Mention: "@${sub.discordUsername}"`);
                });
                contentArray.push(''); // Blank line after substitutes
                Logger.log(`Added blank line after Substitutes for Time Slot: "${timeSlot || 'No Time Slot'}"`);
            }
            
            // Add separator
            contentArray.push(''); // Blank line after separator
            Logger.log(`Added separator for Time Slot: "${timeSlot || 'No Time Slot'}"`);
        }
    });
    
    // Join all text for potential direct usage (e.g., sending via API)
    const discordPingText = contentArray.join('\n');
    Logger.log(`Generated Discord Ping Text:\n${discordPingText}`);
    
    // Invoke the write function to write to the "Discord Pings" sheet
    try {
        const discordPingsSheet = ss.getSheetByName("Discord Pings") || ss.insertSheet("Discord Pings");
        writeDiscordPingsToSheet(discordPingsSheet, discordPingText);
        Logger.log("Successfully wrote Discord pings to the 'Discord Pings' sheet.");
    } catch (error) {
        Logger.log(`Error writing to Discord Pings sheet: ${error.message}`);
        throw error;
    }
    
    // Optionally, return the ping text if needed elsewhere
    return discordPingText;
}

export function writeDiscordPingsToSheet(sheet, pings) {
    sheet.clear();
    Logger.log("Cleared existing content in Discord Pings sheet.");

    const lines = pings.split("\n");
    const numRows = lines.length;
    const range = sheet.getRange(1, DISCORD_PINGS_CONFIG.column, numRows, 1);
    Logger.log(`Total lines to write: ${numRows}`);

    // Set values and basic formatting
    range.setValues(lines.map(line => [line]));
    range.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    range.setVerticalAlignment("top");
    Logger.log("Set values and basic formatting.");

    // Apply formatting based on line content
    for (let i = 0; i < numRows; i++) {
        const cell = range.getCell(i + 1, DISCORD_PINGS_CONFIG.column);
        const content = lines[i].trim();
        Logger.log(`Formatting row ${i + 1}: "${content}"`);

        if (content.startsWith("# ")) {
            // Title Header: Darker Blue
            cell.setFontWeight("bold")
                .setFontSize(STYLING.fontSize.title)
                .setBackground(STYLING.colors.discord.title)
                .setFontColor(STYLING.colors.text.white);
            Logger.log(`Formatted Title: "${content}"`);
        } else if (content.startsWith("## ") && content.endsWith("Timeslot")) {
            // Timeslot Headers: Original Blue
            cell.setFontWeight("bold")
                .setFontSize(STYLING.fontSize.timeslot)
                .setBackground(STYLING.colors.discord.timeslot)
                .setFontColor(STYLING.colors.text.white);
            Logger.log(`Formatted Timeslot Header: "${content}"`);
        } else if (content.startsWith("### Lobby Host")) {
            // Lobby Host Headers: Same as Team Headers (Light Blue)
            cell.setFontWeight("bold")
                .setFontSize(STYLING.fontSize.teamHeader)
                .setBackground(STYLING.colors.discord.lobbyHost)
                .setFontColor(STYLING.colors.text.black);
            Logger.log(`Formatted Lobby Host Header: "${content}"`);
        } else if (content.startsWith("### Team")) {
            // Team Headers: Light Blue
            cell.setFontWeight("bold")
                .setFontSize(STYLING.fontSize.teamHeader)
                .setBackground(STYLING.colors.discord.lobbyHost)
                .setFontColor(STYLING.colors.text.black);
            Logger.log(`Formatted Team Header: "${content}"`);
        } else if (content.startsWith("### Substitutes")) {
            // Substitutes Header: Different Shade of Blue
            cell.setFontWeight("bold")
                .setFontSize(STYLING.fontSize.teamHeader)
                .setBackground(STYLING.colors.discord.substitutes)
                .setFontColor(STYLING.colors.text.black);
            Logger.log(`Formatted Substitutes Header: "${content}"`);
        } else if (content.startsWith("@")) {
            // Player Names: Indented
            cell.setFontSize(STYLING.fontSize.player)
                .setFontColor(STYLING.colors.text.black);
            Logger.log(`Formatted Player Mention: "${content}"`);
        } else if (content === "") {
            // Empty Lines: Clear Content and Remove Background
            cell.setValue("")
                .setBackground(null);
            Logger.log(`Cleared empty row ${i + 1}`);
        }

        // Adjust row height for non-separator rows
        if (!content.startsWith("---")) {
            sheet.setRowHeight(i + 1, DISCORD_PINGS_CONFIG.rowHeight);
        }
    }

    sheet.autoResizeColumns(DISCORD_PINGS_CONFIG.column, 1);
    sheet.setColumnWidth(DISCORD_PINGS_CONFIG.column, Math.max(sheet.getColumnWidth(DISCORD_PINGS_CONFIG.column), DISCORD_PINGS_CONFIG.minWidth));
    Logger.log("Auto-resized and set minimum column width.");
}