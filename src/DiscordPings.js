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
    if (allData.length < 2) {
        throw new Error("Teams sheet is empty. Please create teams first.");
    }
    
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
    
    // Determine where the actual data starts by looking for team headers
    let dataStartRow = 1; // Start from row 2 (index 1) by default
    for (let i = 0; i < Math.min(3, allData.length); i++) {
        const row = allData[i];
        if (row.some(cell => cell && cell.toString().trim().startsWith('Team'))) {
            dataStartRow = i;
            break;
        }
    }
    Logger.log(`Data starts from row ${dataStartRow + 1}`);
    
    let contentArray = [];
    let currentTimeSlot = null;
    let currentTeam = null;
    let inTeam = false;
    let inSubs = false;
    let timeSlotLobbyHosts = new Map(); // Track lobby hosts for each time slot
    
    // Add title as first element
    const currentDate = new Date();
    const gameDay = PropertiesService.getScriptProperties().getProperty('GAME_DAY') || "Saturday";
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const gameDayIndex = daysOfWeek.indexOf(gameDay);
    const currentDayIndex = currentDate.getDay();
    const daysUntilGame = (7 + gameDayIndex - currentDayIndex) % 7;
    const nextGameDay = new Date(currentDate);
    nextGameDay.setDate(currentDate.getDate() + daysUntilGame);
    const formattedDate = nextGameDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    
    contentArray.push(`# Here are the teams for ${gameDay}, ${formattedDate}!`);
    
    // Process each row in the Teams sheet, starting from the data start row
    for (let i = dataStartRow; i < allData.length; i++) {
        const row = allData[i];
        const firstCell = row[0] ? row[0].toString().trim() : '';
        const discordValue = row[discordColIndex];
        const lobbyHostValue = lobbyHostColIndex !== null ? row[lobbyHostColIndex] : null;
        
        Logger.log(`Processing row ${i + 1}: firstCell="${firstCell}", discordValue="${discordValue}", lobbyHostValue="${lobbyHostValue}"`);
        
        // Skip empty rows
        if (!firstCell) {
            continue;
        }
        
        // Check for time slot headers (these contain time patterns and are typically merged cells)
        const timePatterns = ['am', 'pm', 'pst', 'est', 'cst', 'mst', 'utc', 'gmt'];
        const hasTimePattern = timePatterns.some(pattern => firstCell.toLowerCase().includes(pattern));
        
        if (hasTimePattern && !firstCell.includes('Total')) {
            currentTimeSlot = firstCell;
            contentArray.push(`## ${currentTimeSlot} Timeslot`);
            timeSlotLobbyHosts.set(currentTimeSlot, []); // Initialize lobby hosts for this time slot
            Logger.log(`Added time slot header: ${currentTimeSlot}`);
            continue;
        }
        
        // Check for team headers
        if (firstCell.startsWith('Team')) {
            currentTeam = firstCell;
            contentArray.push(`### ${currentTeam}`);
            inTeam = true;
            inSubs = false;
            Logger.log(`Added team header: ${currentTeam}`);
            continue;
        }
        
        // Check for substitutes header
        if (firstCell === 'Substitutes') {
            contentArray.push('### Substitutes');
            inTeam = false;
            inSubs = true;
            Logger.log(`Added substitutes header`);
            continue;
        }
        
        // Skip other headers and totals
        if (firstCell === 'Discord' || firstCell.includes('Total')) {
            continue;
        }
        
        // If we have a Discord value and we're in a team or substitutes section, this is a player
        if ((inTeam || inSubs) && discordValue && discordValue !== 'Discord') {
            const cleanDiscordValue = discordValue.toString().replace(/^@/, '').trim();
            if (cleanDiscordValue) {
                contentArray.push(`@${cleanDiscordValue}`);
                Logger.log(`Added player mention: @${cleanDiscordValue}`);
                
                // Check if this player is a lobby host
                if (lobbyHostValue && lobbyHostValue.toString().toLowerCase() === 'yes' && currentTimeSlot) {
                    const lobbyHosts = timeSlotLobbyHosts.get(currentTimeSlot) || [];
                    lobbyHosts.push(cleanDiscordValue);
                    timeSlotLobbyHosts.set(currentTimeSlot, lobbyHosts);
                    Logger.log(`Added lobby host: @${cleanDiscordValue} for time slot: ${currentTimeSlot}`);
                } else {
                    Logger.log(`Not a lobby host: lobbyHostValue="${lobbyHostValue}", currentTimeSlot="${currentTimeSlot}"`);
                }
            }
        }
    }
    
    // Add lobby host sections for each time slot
    Logger.log(`Time slot lobby hosts map: ${JSON.stringify(Array.from(timeSlotLobbyHosts.entries()))}`);
    timeSlotLobbyHosts.forEach((lobbyHosts, timeSlot) => {
        Logger.log(`Processing lobby hosts for time slot "${timeSlot}": ${lobbyHosts.join(', ')}`);
        if (lobbyHosts.length > 0) {
            // Find the time slot section and add lobby host info after it
            const timeSlotIndex = contentArray.findIndex(line => line === `## ${timeSlot} Timeslot`);
            Logger.log(`Found time slot "${timeSlot}" at index ${timeSlotIndex}`);
            if (timeSlotIndex !== -1) {
                // Insert lobby host section after the time slot header
                contentArray.splice(timeSlotIndex + 1, 0, `### Lobby Host: @${lobbyHosts[0]}`);
                Logger.log(`Added lobby host section for ${timeSlot}: @${lobbyHosts[0]}`);
            } else {
                Logger.log(`Could not find time slot "${timeSlot}" in content array`);
            }
        } else {
            Logger.log(`No lobby hosts found for time slot "${timeSlot}"`);
        }
    });
    
    const discordPingText = contentArray.join('\n');
    Logger.log(`Generated Discord pings text: ${discordPingText}`);
    
    try {
        const discordPingsSheet = ss.getSheetByName("Discord Pings") || ss.insertSheet("Discord Pings");
        writeDiscordPingsToSheet(discordPingsSheet, discordPingText);
        Logger.log("Successfully wrote Discord pings to sheet");
    } catch (error) {
        Logger.log(`Error writing to Discord Pings sheet: ${error.message}`);
        throw error;
    }
    
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