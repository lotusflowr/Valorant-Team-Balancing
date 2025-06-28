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
    
    // Get the header row to find the actual column index
    const headerRow = teamsSheet.getRange(1, 1, 1, teamsSheet.getLastColumn()).getValues()[0];
    
    // Find the column with the discordUsername title
    for (let i = 0; i < headerRow.length; i++) {
        if (headerRow[i] && headerRow[i].toString().trim().toLowerCase() === discordConfig.title.toLowerCase()) {
            Logger.log(`Found Discord column at index ${i} with title: ${headerRow[i]}`);
            return i;
        }
    }
    
    throw new Error(`Discord column with title "${discordConfig.title}" not found in Teams sheet.`);
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
    
    let contentArray = [];
    let currentTimeSlot = null;
    let currentTeam = null;
    let inTeam = false;
    let inSubs = false;
    
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
    
    // Process each row in the Teams sheet
    for (let i = 1; i < allData.length; i++) {
        const row = allData[i];
        const firstCell = row[0] ? row[0].toString().trim() : '';
        const discordValue = row[discordColIndex];
        
        Logger.log(`Processing row ${i}: firstCell="${firstCell}", discordValue="${discordValue}"`);
        
        // Check for time slot headers (merged cells)
        if (firstCell && firstCell !== 'Discord' && !firstCell.startsWith('Team') && firstCell !== 'Substitutes' && !firstCell.startsWith('@')) {
            // This might be a time slot header
            if (!firstCell.includes('Total')) {
                currentTimeSlot = firstCell;
                contentArray.push(`## ${currentTimeSlot} Timeslot`);
                Logger.log(`Added time slot header: ${currentTimeSlot}`);
            }
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
        
        // Skip empty rows and headers
        if (firstCell === '' || firstCell === 'Discord' || firstCell.includes('Total')) {
            continue;
        }
        
        // Add player mentions if we're in a team or substitutes section
        if ((inTeam || inSubs) && discordValue && discordValue !== 'Discord') {
            const cleanDiscordValue = discordValue.toString().replace(/^@/, '').trim();
            if (cleanDiscordValue) {
                contentArray.push(`@${cleanDiscordValue}`);
                Logger.log(`Added player mention: @${cleanDiscordValue}`);
            }
        }
    }
    
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
