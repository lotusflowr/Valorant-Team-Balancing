/** @OnlyCurrentDoc */
const DEFAULT_TIME_SLOTS = ["6pm PST/9pm EST", "7pm PST/10pm EST"];
let TIME_SLOTS = getTimeSlots();
let GAME_DAY = getGameDay();
const TIME_SLOTS_COLUMN = 5;
const TEAM_SIZE = 5;

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('SCRIPTS')
    .addItem('Manage Time Slots', 'manageTimeSlots')
    .addItem('Balance Teams and Players', 'sortPlayersIntoBalancedTeams')
    .addItem('Clear Responses', 'clearResponses')
    .addToUi();
}

function getTimeSlots() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const storedTimeSlots = scriptProperties.getProperty('TIME_SLOTS');
  return storedTimeSlots ? JSON.parse(storedTimeSlots) : DEFAULT_TIME_SLOTS;
}

function setTimeSlots(newTimeSlots) {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('TIME_SLOTS', JSON.stringify(newTimeSlots));
}

function getGameDay() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty('GAME_DAY') || "Saturday"; // Default to Saturday if not set
}

function setGameDay(newGameDay) {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('GAME_DAY', newGameDay);
}

function manageTimeSlots() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    'Manage Time Slots and Game Day',
    `Current settings:\n` +
    `Game Day: ${GAME_DAY}\n` +
    `Time Slots: ${TIME_SLOTS.join(", ")}\n\n` +
    'Enter your choice:\n' +
    '[1]: Manage Time Slots\n' +
    '[2]: Change Game Day\n',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() == ui.Button.OK) {
    const choice = result.getResponseText().trim().toUpperCase();
    
    switch (choice) {
      case '1':
        manageTimeSlotsMenu();
        break;
      case '2':
        changeGameDay();
        break;
      default:
        ui.alert('Invalid Choice', 'Please enter T, G, or click on Cancel.', ui.ButtonSet.OK);
        manageTimeSlots(); // Recursive call to try again
    }
  } else {
    // User clicked Cancel or closed the dialog
    ui.alert('Cancelled', 'Settings management was cancelled. Current settings remain unchanged.', ui.ButtonSet.OK);
  }
}

function manageTimeSlotsMenu() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    'Manage Time Slots',
    `Current Time Slots: ${TIME_SLOTS.join(", ")}\n\n` +
    'Enter your choice:\n' +
    '[1]: Automatically determines the time slots from the "Time Slots" column (if available)\n' +
    '[2]: Manually input time slots\n' +
    '[3]: Cancel (Keep current time slots)',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() == ui.Button.OK) {
    const choice = result.getResponseText().trim().toUpperCase();
    
    switch (choice) {
      case '1':
        setAutomaticTimeSlots();
        break;
      case '2':
        manuallyInputTimeSlots();
        break;
      case '3':
        ui.alert('Cancelled', 'Time slot management was cancelled. Current time slots remain unchanged.', ui.ButtonSet.OK);
        break;
      default:
        ui.alert('Invalid Choice', 'Please enter M, A, or C.', ui.ButtonSet.OK);
        manageTimeSlotsMenu(); // Recursive call to try again
    }
  } else {
    // User clicked Cancel or closed the dialog
    ui.alert('Cancelled', 'Time slot management was cancelled. Current time slots remain unchanged.', ui.ButtonSet.OK);
  }
}

function changeGameDay() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    'Change Game Day',
    `Current Game Day: ${GAME_DAY}\n\n` +
    'Enter the new game day (e.g., "Sunday", "Monday", etc.):',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() == ui.Button.OK) {
    const newGameDay = result.getResponseText().trim();
    if (newGameDay) {
      setGameDay(newGameDay);
      GAME_DAY = newGameDay; // Update the current script's variable
      ui.alert('Game Day Updated', `Game day has been set to: ${GAME_DAY}`, ui.ButtonSet.OK);
    } else {
      ui.alert('No Input', 'No game day was entered. Keeping the current game day.', ui.ButtonSet.OK);
    }
  } else {
    ui.alert('Cancelled', 'Game day change was cancelled. Current game day remains unchanged.', ui.ButtonSet.OK);
  }
}

function manuallyInputTimeSlots() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    'Set Custom Time Slots',
    'Please enter time slots separated by commas (e.g., "6pm PST/9pm EST, 7pm PST/10pm EST"):',
    ui.ButtonSet.OK_CANCEL);

  const button = result.getSelectedButton();
  const text = result.getResponseText();
  
  if (button == ui.Button.OK) {
    if (text) {
      const newTimeSlots = text.split(',').map(slot => slot.trim());
      setTimeSlots(newTimeSlots); // Store the new time slots
      TIME_SLOTS = newTimeSlots; // Update the current script's variable
      ui.alert('Time Slots Set', `Time slots have been set to: ${TIME_SLOTS.join(", ")}`, ui.ButtonSet.OK);
    } else {
      ui.alert('No Input', 'No time slots were entered. Using current time slots.', ui.ButtonSet.OK);
    }
  } else if (button == ui.Button.CANCEL) {
    ui.alert('Cancelled', 'Manual time slot setting was cancelled. Using current time slots.', ui.ButtonSet.OK);
  }
}

function setAutomaticTimeSlots() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0]; // Get the first sheet
  
  // Get time slots from the 5th column
  const timeSlotsRange = sheet.getRange(2, TIME_SLOTS_COLUMN, sheet.getLastRow() - 1, 1);
  const timeSlotValues = timeSlotsRange.getValues().flat().filter(Boolean);
  
  // Split any combined time slots
  const splitTimeSlots = timeSlotValues.flatMap(slot => slot.split(',').map(s => s.trim()));
  
  // Use Set to remove duplicates, then convert back to array
  const uniqueTimeSlots = [...new Set(splitTimeSlots)];
  
  if (uniqueTimeSlots.length > 0) {
    setTimeSlots(uniqueTimeSlots); // Store the new time slots
    TIME_SLOTS = uniqueTimeSlots; // Update the current script's variable
    const message = `Time slots have been set to: ${TIME_SLOTS.join(", ")}`;
    ui.alert('Time Slots Updated', message, ui.ButtonSet.OK);
  } else {
    ui.alert('No Time Slots Found', 'No time slots were found in the "Time Slots" column. Using current time slots.', ui.ButtonSet.OK);
  }
}

function sortPlayersIntoBalancedTeams() {
  Logger.log("sortPlayersIntoBalancedTeams function started");

  // Update Time and Day variables
  TIME_SLOTS = getTimeSlots(); // Refresh TIME_SLOTS at the start of the function
  GAME_DAY = getGameDay(); // Refresh GAME_DAY at the start of the function

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
    
    const teamsAndSubs = createOptimalTeams(allPlayers);
    Logger.log("Teams and substitutes created: " + JSON.stringify(teamsAndSubs));
    
    writeTeamsToSheet(teamsSheet, teamsAndSubs);
    Logger.log("Teams written to sheet");
    
    const discordPings = createDiscordPings(teamsAndSubs.teams, teamsAndSubs.substitutes);
  
    // Write Discord pings to a new sheet
    const discordPingsSheet = ss.getSheetByName("Discord Pings") || ss.insertSheet("Discord Pings");
    writeDiscordPingsToSheet(discordPingsSheet, discordPings);
    Logger.log("Discord Pings completed");
    
  } catch (e) {
    Logger.log(`Error: ${e.message}`);
    throw e;
  }
  
  Logger.log("sortPlayersIntoBalancedTeams function completed");
}

function getPlayersData(sheet) {
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
      multipleGames: row[5],
      substitute: row[6].toString().toLowerCase() === 'yes',
      lobbyHost: row[7],
      duo: row[8],
      currentRank: getRankValue(row[9]),
      peakRank: getRankValue(row[10]),
    };
    player.averageRank = (player.currentRank + player.peakRank) / 2;

    Logger.log(`Player ${index + 1}: Discord: ${player.discordUsername}, Current Rank: ${row[9]} (${player.currentRank}), Peak Rank: ${row[10]} (${player.peakRank}), Substitute: ${player.substitute}, Time Slots: ${player.timeSlots}`);

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

function createOptimalTeams(players) {
  let result = {
    teams: [],
    substitutes: {}
  };
  let assignedPlayers = new Set();

  TIME_SLOTS.forEach(timeSlot => {
    let timeSlotPlayers = players.filter(p => p.timeSlots.includes(timeSlot));
    
    let { teams, substitutes, assignedPlayers: newAssignedPlayers } = createOptimalTeamsForTimeSlot(timeSlotPlayers, timeSlot, assignedPlayers);
    
    result.teams = result.teams.concat(teams);
    result.substitutes[timeSlot] = substitutes;
    assignedPlayers = newAssignedPlayers;
  });

  return result;
}

function createOptimalTeamsForTimeSlot(players, timeSlot, assignedPlayers) {
  const numPlayers = players.length;
  const numTeams = Math.floor(numPlayers / TEAM_SIZE);
  
  // Ensure even number of teams
  const adjustedNumTeams = numTeams % 2 === 0 ? numTeams : numTeams - 1;
  
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

  // Sort players by average rank (descending)
  const sortedPlayers = players.slice().sort((a, b) => b.averageRank - a.averageRank);

  // Distribute top players evenly
  for (let i = 0; i < teams.length; i++) {
    if (sortedPlayers.length > 0) {
      const player = sortedPlayers.shift();
      teams[i].players.push(player);
      teams[i].total += player.averageRank;
    }
  }

  // Distribute remaining players using greedy approach
  while (sortedPlayers.length > 0) {
    // Find the team with the lowest total rank and fewer than TEAM_SIZE players
    const eligibleTeams = teams.filter(team => team.players.length < TEAM_SIZE);
    if (eligibleTeams.length === 0) break; // No more space in teams

    const teamWithLowestRank = eligibleTeams.reduce((prev, curr) => 
      (prev.total < curr.total ? prev : curr)
    );

    const player = sortedPlayers.shift();
    teamWithLowestRank.players.push(player);
    teamWithLowestRank.total += player.averageRank;
  }

  // Handle substitutes (any remaining players)
  const substitutes = sortedPlayers;

  // Calculate team spread for logging
  const teamSpread = getTeamSpread(teams);
  Logger.log(`Team spread for ${timeSlot}: ${teamSpread.toFixed(2)}`);

  return {
    teams,
    substitutes,
    assignedPlayers: new Set([...assignedPlayers, ...teams.flatMap(team => team.players.map(p => p.discordUsername))])
  };
}

function getTeamSpread(teams) {
  const totals = teams.map(team => team.total);
  return Math.max(...totals) - Math.min(...totals);
}

function writeTeamsToSheet(sheet, teamsAndSubs) {
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
      
      // Write team header
      sheet.getRange(rowIndex + 1, 1, 1, 5).merge()
        .setValue(team.name)
        .setFontWeight("bold")
        .setBackground(teamColor)
        .setFontColor("#000000")
        .setFontSize(12)
        .setHorizontalAlignment("center");
      
      // Add Team Total in the same row
      sheet.getRange(rowIndex + 1, 6)
        .setFontWeight("bold")
        .setBackground(teamColor)
        .setFontColor("#000000")
        .setFontSize(12)
        .setHorizontalAlignment("right");
      
      // Add formula for team total
      const totalFormula = `SUM($F${rowIndex + 3}:$F${rowIndex + 3 + TEAM_SIZE - 1})`;
      sheet.getRange(rowIndex + 1, 6).setFormula(`"Total: " & TEXT(${totalFormula}, "0.0")`);
      
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
      team.players.forEach(player => {
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
  sheet.setFrozenRows(1);
}

function createDiscordPings(teams, substitutes) {
  const currentDate = new Date();
  const nextGameDay = new Date(currentDate.setDate(currentDate.getDate() + ((7 + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(GAME_DAY) - currentDate.getDay()) % 7)));
  const formattedDate = nextGameDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  
  let pings = `# Here are the teams for ${GAME_DAY}, ${formattedDate}!\n\n`;
  
  TIME_SLOTS.forEach((timeSlot, slotIndex) => {
    const timeSlotTeams = teams.filter(team => team.timeSlot === timeSlot);
    const timeSlotSubstitutes = substitutes[timeSlot] || [];
    
    if (timeSlotTeams.length > 0 || timeSlotSubstitutes.length > 0) {
      pings += `## TIMESLOT ${slotIndex + 1}\n\n`;
      
      for (let i = 0; i < timeSlotTeams.length; i += 2) {
        const twoTeams = timeSlotTeams.slice(i, i + 2);
        const lobbyHost = twoTeams.flatMap(team => team.players).find(player => player.lobbyHost === "Yes");
        if (lobbyHost) {
          if (timeSlotTeams.length > 2) {
            pings += `### LOBBY HOST **Team ${i + 1} & ${i + 2}**\n@${lobbyHost.discordUsername}\n\n`;
          } else {
            pings += `### LOBBY HOST\n@${lobbyHost.discordUsername}\n\n`;
          }
        }
        
        twoTeams.forEach((team, index) => {
          pings += `### Team ${i + index + 1}\n`;
          team.players.forEach(player => {
            pings += `@${player.discordUsername}\n`;
          });
          pings += "\n";
        });
      }
      
      if (timeSlotSubstitutes.length > 0) {
        pings += "### Substitutes\n";
        timeSlotSubstitutes.forEach(sub => {
          pings += `@${sub.discordUsername}\n`;
        });
        pings += "\n";
      }
    }
  });
  
  return pings;
}

function writeDiscordPingsToSheet(sheet, pings) {
  sheet.clear();
  
  const lines = pings.split("\n");
  const numRows = lines.length;
  const range = sheet.getRange(1, 1, numRows, 1);
  
  // Set values and basic formatting
  range.setValues(lines.map(line => [line]));
  range.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  range.setVerticalAlignment("top");
  
  // Apply formatting based on line content
  for (let i = 0; i < numRows; i++) {
    const cell = range.getCell(i + 1, 1);
    const content = lines[i];
    
    if (content.startsWith("# Here are the teams")) {
      // First line (title)
      cell.setFontWeight("bold").setFontSize(18).setBackground("#4A86E8").setFontColor("#ffffff");
    } else if (content.startsWith("##")) {
      // Time slot headers
      cell.setFontWeight("bold").setFontSize(14).setBackground("#4A86E8").setFontColor("#ffffff");
    } else if (content.startsWith("### LOBBY HOST")) {
      // Lobby host headers
      cell.setFontWeight("bold").setFontSize(13).setBackground("#CFE2F3");
    } else if (content.startsWith("### Team")) {
      // Team headers
      cell.setFontWeight("bold").setFontSize(13).setBackground("#CFE2F3");
    } else if (content.startsWith("### Substitutes")) {
      // Substitutes header
      cell.setFontWeight("bold").setFontSize(13).setBackground("#CFE2F3");
    } else if (content.startsWith("@")) {
      // Player names
      cell.setFontSize(11).setValue("  " + content); // Add two spaces for indentation
    } else if (content.trim() === "") {
      // Empty lines
      cell.setValue(""); // Clear the cell content
    }
    
    // Adjust row height
    sheet.setRowHeight(i + 1, 21);
  }
  
  sheet.autoResizeColumns(1, 1);
  sheet.setColumnWidth(1, Math.max(sheet.getColumnWidth(1), 300)); // Ensure minimum width
}

function setConditionalFormatting(range) {
  const rules = [
    {rank: "Iron", color: "#464646"},
    {rank: "Bronze", color: "#a6824c"},
    {rank: "Silver", color: "#dce1dc"},
    {rank: "Gold", color: "#dc8e21"},
    {rank: "Platinum", color: "#27697a"},
    {rank: "Diamond", color: "#c688f7"},
    {rank: "Ascendant", color: "#40b57e"},
    {rank: "Immortal", color: "#953640"},
    {rank: "Radiant", color: "#f2dc95"}
  ];
  
  const conditionalFormatRules = rules.map(rule => 
    SpreadsheetApp.newConditionalFormatRule()
      .setRanges([range])
      .whenTextContains(rule.rank)
      .setBackground(rule.color)
      .setFontColor(getContrastColor(rule.color))
      .build()
  );
  
  range.getSheet().setConditionalFormatRules(
    range.getSheet().getConditionalFormatRules().concat(conditionalFormatRules)
  );
}

function getContrastColor(hexcolor) {
  const r = parseInt(hexcolor.substr(1,2), 16);
  const g = parseInt(hexcolor.substr(3,2), 16);
  const b = parseInt(hexcolor.substr(5,2), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

function getRankValue(rank) {
  const ranks = {
    "Iron 1": 1, "Iron 2": 5, "Iron 3": 10,
    "Bronze 1": 15, "Bronze 2": 20, "Bronze 3": 25,
    "Silver 1": 35, "Silver 2": 40, "Silver 3": 45,
    "Gold 1": 55, "Gold 2": 60, "Gold 3": 65,
    "Platinum 1": 75, "Platinum 2": 80, "Platinum 3": 85,
    "Diamond 1": 95, "Diamond 2": 100, "Diamond 3": 110,
    "Ascendant 1": 125, "Ascendant 2": 130, "Ascendant 3": 140,
    "Immortal 1": 160, "Immortal 2": 165, "Immortal 3": 180,
    "Radiant": 220
  };
  return ranks[rank] || 0;
}


function getRankName(rankValue) {
  const rankNames = {
    1: "Iron 1", 5: "Iron 2", 10: "Iron 3",
    15: "Bronze 1", 20: "Bronze 2", 25: "Bronze 3",
    35: "Silver 1", 40: "Silver 2", 45: "Silver 3",
    55: "Gold 1", 60: "Gold 2", 65: "Gold 3",
    75: "Platinum 1", 80: "Platinum 2", 85: "Platinum 3",
    95: "Diamond 1", 100: "Diamond 2", 110: "Diamond 3",
    125: "Ascendant 1", 130: "Ascendant 2", 140: "Ascendant 3",
    160: "Immortal 1", 165: "Immortal 2", 180: "Immortal 3",
    220: "Radiant"
  };
  return rankNames[rankValue] || "Unranked";
}


function clearResponses() {
  // Get the active spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Get the UI
  var ui = SpreadsheetApp.getUi();

  // Get the first sheet
  var sheet = ss.getSheets()[0];
  
  // Get the number of rows in the sheet
  var lastRow = sheet.getLastRow();
  
  // Check if there are any rows to delete
  if (lastRow > 1) {
    // Show a confirmation dialog
    var response = ui.alert('Confirm Deletion', 'Are you sure you want to clear all responses? This action cannot be undone.', ui.ButtonSet.YES_NO);

    // If the user clicks "Yes", proceed with deletion
    if (response == ui.Button.YES) {
      // Delete all rows below the header
      sheet.deleteRows(2, lastRow - 1);
      
      // Log the action
      Logger.log("Cleared all responses from the Forms Responses sheet.");
      
      // Show a confirmation message
      ui.alert('Success', 'All responses have been cleared.', ui.ButtonSet.OK);
    } else {
      // If the user clicks "No", log that the operation was cancelled
      Logger.log("Clear responses operation cancelled by user.");
    }
  } else {
    // If there are no responses to clear, inform the user
    ui.alert('No Responses', 'There are no responses to clear.', ui.ButtonSet.OK);
  }
}