export function generateDiscordPings() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const teamsSheet = ss.getSheetByName("Teams");

    if (!teamsSheet) {
        Logger.log("Error: Teams sheet not found.");
        throw new Error("Teams sheet not found. Please create teams first.");
    }

    // Get all data from the Teams sheet
    const data = teamsSheet.getDataRange().getValues();
    Logger.log(`Total rows in Teams sheet: ${data.length}`);

    // Initialize variables
    let currentTimeSlot = null;
    let currentTeam = null;
    let teams = [];
    let substitutes = [];
    let currentSection = null; // Possible values: null, "team", "players", "substitutes", "substitutesPlayers"

    // Process each row in the Teams sheet
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const firstCell = row[0].toString().trim();
        Logger.log(`Processing row ${i + 1}: "${firstCell}"`);

        // Detect Time Slot
        if (row.length === 6 && (firstCell.includes("CEST") || firstCell.includes("WEST"))) {
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
                name: firstCell, // e.g., "Team 1"
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
            const player = {
                discordUsername: firstCell.replace(/^@/, '').trim(), // Remove "@" if present
                riotID: row[1] ? row[1].toString().trim() : "",
                lobbyHost: row[4] ? row[4].toString().trim().toLowerCase() === "yes" : false
            };
            currentTeam.players.push(player);
            Logger.log(`Added Player to Team "${currentTeam.name}": "@${player.discordUsername}" (Lobby Host: ${player.lobbyHost})`);
            continue;
        }

        // Process Player Rows for Substitutes
        if (currentSection === "substitutesPlayers" && firstCell !== "") {
            const substitute = {
                discordUsername: firstCell.replace(/^@/, '').trim(), // Remove "@" if present
                riotID: row[1] ? row[1].toString().trim() : "",
                lobbyHost: row[4] ? row[4].toString().trim().toLowerCase() === "yes" : false
            };
            substitutes[currentTimeSlot].push(substitute);
            Logger.log(`Added Substitute to Time Slot "${currentTimeSlot}": "@${substitute.discordUsername}" (Lobby Host: ${substitute.lobbyHost})`);
            continue;
        }

        // Reset section if encountering an empty row
        if (firstCell === "") {
            currentSection = null;
            Logger.log(`Encountered empty row. Resetting current section.`);
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
    let contentArray = [];

    // Add title as first element
    contentArray.push(`# Here are the teams for ${gameDay}, ${formattedDate}!`);
    Logger.log("Added title to contentArray.");

    // Group teams by time slot
    const timeSlots = [...new Set(teams.map(team => team.timeSlot))];
    Logger.log(`Unique Time Slots: ${timeSlots.join(", ")}`);

    timeSlots.forEach((timeSlot) => {
        const timeSlotTeams = teams.filter(team => team.timeSlot === timeSlot);
        const timeSlotSubstitutes = substitutes[timeSlot] || [];

        if (timeSlotTeams.length > 0 || timeSlotSubstitutes.length > 0) {
            // Add time slot header with "Timeslot"
            contentArray.push(`## ${timeSlot} Timeslot`);
            Logger.log(`Added Time Slot Header: "${timeSlot} Timeslot"`);

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
                    contentArray.push(`### Lobby Host`);
                    contentArray.push(`@${selectedHost.discordUsername}`);
                    contentArray.push(''); // Blank line after Lobby Host
                    Logger.log(`Added Lobby Host Section: "@${selectedHost.discordUsername}"`);
                }

                // Add each team in the pair
                pair.forEach((team) => {
                    contentArray.push(`### ${team.name}`);
                    Logger.log(`Added Team Header: "${team.name}"`);

                    team.players.forEach(player => {
                        contentArray.push(`@${player.discordUsername}`);
                        Logger.log(`Added Player Mention: "@${player.discordUsername}"`);
                    });

                    contentArray.push(''); // Blank line after each team
                    Logger.log(`Added blank line after Team: "${team.name}"`);
                });
            }

            // Add substitutes section if there are any
            if (timeSlotSubstitutes.length > 0) {
                contentArray.push(`### Substitutes`);
                Logger.log(`Added Substitutes Header for Time Slot: "${timeSlot} Timeslot"`);
                timeSlotSubstitutes.forEach(sub => {
                    contentArray.push(`@${sub.discordUsername}`);
                    Logger.log(`Added Substitute Mention: "@${sub.discordUsername}"`);
                });
                contentArray.push(''); // Blank line after substitutes
                Logger.log(`Added blank line after Substitutes for Time Slot: "${timeSlot} Timeslot"`);
            }

            // Add separator
            contentArray.push(''); // Blank line after separator
            Logger.log(`Added separator for Time Slot: "${timeSlot} Timeslot"`);
        }
    });

    // Join all text for potential direct usage (e.g., sending via API)
    const discordPingText = contentArray.join('\n');
    Logger.log("Generated Discord Ping Text:\n" + discordPingText);

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
    const range = sheet.getRange(1, 1, numRows, 1);
    Logger.log(`Total lines to write: ${numRows}`);

    // Set values and basic formatting
    range.setValues(lines.map(line => [line]));
    range.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    range.setVerticalAlignment("top");
    Logger.log("Set values and basic formatting.");

    // Apply formatting based on line content
    for (let i = 0; i < numRows; i++) {
        const cell = range.getCell(i + 1, 1);
        const content = lines[i].trim();
        Logger.log(`Formatting row ${i + 1}: "${content}"`);

        if (content.startsWith("# ")) {
            // Title Header: Darker Blue
            cell.setFontWeight("bold")
                .setFontSize(18)
                .setBackground("#002B80") // Darker Blue
                .setFontColor("#ffffff");
            Logger.log(`Formatted Title: "${content}"`);
        } else if (content.startsWith("## ") && content.endsWith("Timeslot")) {
            // Timeslot Headers: Original Blue
            cell.setFontWeight("bold")
                .setFontSize(14)
                .setBackground("#4A86E8") // Original Blue
                .setFontColor("#ffffff");
            Logger.log(`Formatted Timeslot Header: "${content}"`);
        } else if (content.startsWith("### Lobby Host")) {
            // Lobby Host Headers: Light Blue
            cell.setFontWeight("bold")
                .setFontSize(13)
                .setBackground("#CFE2F3") // Light Blue
                .setFontColor("#000000"); // Black text
            Logger.log(`Formatted Lobby Host Header: "${content}"`);
        } else if (content.startsWith("### Team")) {
            // Team Headers: Light Blue
            cell.setFontWeight("bold")
                .setFontSize(13)
                .setBackground("#CFE2F3") // Light Blue
                .setFontColor("#000000"); // Black text
            Logger.log(`Formatted Team Header: "${content}"`);
        } else if (content.startsWith("### Substitutes")) {
            // Substitutes Header: Different Shade of Blue
            cell.setFontWeight("bold")
                .setFontSize(13)
                .setBackground("#A9D0F5") // Light Sky Blue
                .setFontColor("#000000"); // Black text
            Logger.log(`Formatted Substitutes Header: "${content}"`);
        } else if (content.startsWith("@")) {
            // Player Names: Indented
            cell.setFontSize(11)
                .setFontColor("#000000"); // Black test
            Logger.log(`Formatted Player Mention: "${content}"`);
        } else if (content === "") {
            // Empty Lines: Clear Content and Remove Background
            cell.setValue("")
                .setBackground(null); // Remove any background color
            Logger.log(`Cleared empty row ${i + 1}`);
        }

        // Adjust row height for non-separator rows
        if (!content.startsWith("---")) {
            sheet.setRowHeight(i + 1, 21);
        }
    }

    sheet.autoResizeColumns(1, 1);
    sheet.setColumnWidth(1, Math.max(sheet.getColumnWidth(1), 300)); // Ensure minimum width
    Logger.log("Auto-resized and set minimum column width.");


}
