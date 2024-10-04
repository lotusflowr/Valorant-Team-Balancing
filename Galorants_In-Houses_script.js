/** @OnlyCurrentDoc */
const TIME_SLOTS = ["6pm PST/9pm EST", "7pm PST/10pm EST"];
const GAME_DAY = "Saturday"; 
const TEAM_SIZE = 5;

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('SCRIPTS')
    .addItem('Balance Teams and Players', 'sortPlayersIntoBalancedTeams')
    .addItem('Clear Responses', 'clearResponses')
    .addToUi();
}

function sortPlayersIntoBalancedTeams() {
  Logger.log("sortPlayersIntoBalancedTeams function started");
  
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
  
  let bestTeams = null;
  let minSpread = Infinity;

  // Sort players: prioritize those who haven't played yet, then by average rank
  players.sort((a, b) => {
    if (assignedPlayers.has(a.discordUsername) && !assignedPlayers.has(b.discordUsername)) return 1;
    if (!assignedPlayers.has(a.discordUsername) && assignedPlayers.has(b.discordUsername)) return -1;
    return b.averageRank - a.averageRank;
  });

  // Try different team configurations
  for (let attempt = 0; attempt < 1000; attempt++) {
    const teams = [];
    for (let i = 0; i < adjustedNumTeams; i++) {
      teams.push({
        name: `Team ${i + 1}`,
        timeSlot: timeSlot,
        players: [],
        total: 0
      });
    }

    // Assign players to teams
    const shuffledPlayers = players.slice().sort(() => Math.random() - 0.5);
    const currentAssignedPlayers = new Set(assignedPlayers);
    for (let i = 0; i < adjustedNumTeams * TEAM_SIZE; i++) {
      const teamIndex = i % adjustedNumTeams;
      const player = shuffledPlayers[i];
      teams[teamIndex].players.push(player);
      teams[teamIndex].total += player.averageRank;
      currentAssignedPlayers.add(player.discordUsername);
    }

    // Calculate spread
    const spread = getTeamSpread(teams);
    
    if (spread < minSpread) {
      minSpread = spread;
      bestTeams = teams;
    }
  }

  // Handle substitutes
  const substitutes = players.filter(player => !bestTeams.some(team => team.players.includes(player)));

  return { teams: bestTeams, substitutes, assignedPlayers: new Set([...assignedPlayers, ...bestTeams.flatMap(team => team.players.map(p => p.discordUsername))]) };
}

function getTeamSpread(teams) {
  const totals = teams.map(team => team.total);
  return Math.max(...totals) - Math.min(...totals);
}

function getPlayersData(sheet) {
  const data = sheet.getDataRange().getValues();
  Logger.log(`Raw data: ${JSON.stringify(data.slice(0, 2))}`); // Log headers and first row

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
      timeSlots: row[4] ? row[4].toString().split(',').map(s => s.trim()) : [],
      multipleGames: row[5],
      substitute: row[6].toString().toLowerCase() === 'yes',
      lobbyHost: row[7],
      duo: row[8],
      currentRank: getRankValue(row[9]),
      peakRank: getRankValue(row[10]),
    };
    player.averageRank = (player.currentRank + player.peakRank) / 2;

    Logger.log(`Player ${index + 1}: Discord: ${player.discordUsername}, Current Rank: ${row[9]} (${player.currentRank}), Peak Rank: ${row[10]} (${player.peakRank}), Substitute: ${player.substitute}`);

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
      const totalFormula = `SUM(F${rowIndex + 3}:F${rowIndex + 3 + TEAM_SIZE - 1})`;
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
    "Iron 1": 1, "Iron 2": 2, "Iron 3": 3,
    "Bronze 1": 4, "Bronze 2": 5, "Bronze 3": 6,
    "Silver 1": 7, "Silver 2": 8, "Silver 3": 9,
    "Gold 1": 11, "Gold 2": 12, "Gold 3": 13,
    "Platinum 1": 15, "Platinum 2": 16, "Platinum 3": 17,
    "Diamond 1": 19, "Diamond 2": 20, "Diamond 3": 21,
    "Ascendant 1": 24, "Ascendant 2": 25, "Ascendant 3": 26,
    "Immortal 1": 29, "Immortal 2": 31, "Immortal 3": 34,
    "Radiant": 36
  };
  return ranks[rank] || 0;
}

function getRankName(rankValue) {
  const rankNames = {
    1: "Iron 1", 2: "Iron 2", 3: "Iron 3",
    4: "Bronze 1", 5: "Bronze 2", 6: "Bronze 3",
    7: "Silver 1", 8: "Silver 2", 9: "Silver 3",
    11: "Gold 1", 12: "Gold 2", 13: "Gold 3",
    15: "Platinum 1", 16: "Platinum 2", 17: "Platinum 3",
    19: "Diamond 1", 20: "Diamond 2", 21: "Diamond 3",
    24: "Ascendant 1", 25: "Ascendant 2", 26: "Ascendant 3",
    29: "Immortal 1", 31: "Immortal 2", 34: "Immortal 3",
    36: "Radiant"
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