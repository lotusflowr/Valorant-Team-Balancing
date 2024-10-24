/** @OnlyCurrentDoc */

//here for testing jest, remove when first real jest test is done
function sum(a, b) {
  if (typeof SpreadsheetApp != 'undefined') {
    var ui = SpreadsheetApp.getUi();
    ui.alert('sum works!', 'sum works!', ui.ButtonSet.OK);
  }
  return a + b;
}

function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var DEFAULT_TIME_SLOTS = ["7pm CEST/8pm WEST", "8pm CEST/9pm WEST"];
var TIME_SLOTS = getTimeSlots();
var GAME_DAY = getGameDay();
var TIME_SLOTS_COLUMN = 5;
var TEAM_SIZE = 5;

/***** UI FUNCTIONS *****/

/**
 * Starting point
 * See Google Workspace Scripts reference
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('SCRIPTS').addItem('Manage Time Slots', 'manageTimeSlots').addItem('Balance Teams and Players', 'sortPlayersIntoBalancedTeams').addItem('Generate Discord Pings', 'generateDiscordPings').addItem('Clear Responses', 'clearResponses').addToUi();
}
function getTimeSlots() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var storedTimeSlots = scriptProperties.getProperty('TIME_SLOTS');
  return storedTimeSlots ? JSON.parse(storedTimeSlots) : DEFAULT_TIME_SLOTS;
}

/**
 * Changes the time slots from the default values to the new time slots as set by the user (or parsed from the sheet)
 * TODO: validation/sanitization of input (is it a valid time slot, will the input cause an error, is it dangerous to use/run, etc)
 * @param {array} newTimeSlots time slots that will be used for creating teams
 */
function setTimeSlots(newTimeSlots) {
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('TIME_SLOTS', JSON.stringify(newTimeSlots));
}
function getGameDay() {
  var scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty('GAME_DAY') || "Saturday"; // Default to Saturday if not set
}
function setGameDay(newGameDay) {
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('GAME_DAY', newGameDay);
}

/**
 * Creates a UI for managing the timeslots using UI prompts
 */
function manageTimeSlots() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt('Manage Time Slots and Game Day',
  //title
  "Current settings:\n" + //start prompt
  "Game Day: ".concat(GAME_DAY, "\n") + "Time Slots: ".concat(TIME_SLOTS.join(", "), "\n\n") + 'Enter your choice:\n' + '[1]: Manage Time Slots\n' + '[2]: Change Game Day\n',
  //end prompt
  ui.ButtonSet.OK_CANCEL //buttons
  );
  if (result.getSelectedButton() == ui.Button.OK) {
    var choice = result.getResponseText().trim().toUpperCase();
    switch (choice) {
      case '1':
        manageTimeSlotsMenu();
        break;
      case '2':
        changeGameDay();
        break;
      default:
        ui.alert('Invalid Choice', 'Please enter 1, 2, or click on Cancel.', ui.ButtonSet.OK);
        manageTimeSlots();
      // Recursive call to try again
    }
  } else {
    // User clicked Cancel or closed the dialog
    ui.alert('Cancelled', 'Settings management was cancelled. Current settings remain unchanged.', ui.ButtonSet.OK);
  }
}

/**
 * Creates a UI for the user to choose how to manage time slots
 * They can have the script parse the time slots given in the Google form or manually enter their own time slots
 * Called from user input
 */
function manageTimeSlotsMenu() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt('Manage Time Slots',
  //title
  "Current Time Slots: ".concat(TIME_SLOTS.join(", "), "\n\n") +
  //prompt start
  'Enter your choice:\n' + '[1]: Automatically determines the time slots from the "Time Slots" column (if available)\n' + '[2]: Manually input time slots\n' + '[3]: Cancel (Keep current time slots)',
  //prompt end
  ui.ButtonSet.OK_CANCEL //buttons
  );
  if (result.getSelectedButton() == ui.Button.OK) {
    var choice = result.getResponseText().trim().toUpperCase();
    switch (choice) {
      case '1':
        setAutomaticTimeSlots(); //parses the time slots from the Google form responses
        break;
      case '2':
        manuallyInputTimeSlots(); //allows the user to enter their own set of time slots
        break;
      case '3':
        ui.alert('Cancelled', 'Time slot management was cancelled. Current time slots remain unchanged.', ui.ButtonSet.OK);
        break;
      default:
        ui.alert('Invalid Choice', 'Please enter 1, 2, or 3.', ui.ButtonSet.OK);
        manageTimeSlotsMenu();
      // Recursive call to try again
    }
  } else {
    // User clicked Cancel or closed the dialog
    ui.alert('Cancelled', 'Time slot management was cancelled. Current time slots remain unchanged.', ui.ButtonSet.OK);
  }
}
function changeGameDay() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt('Change Game Day',
  //title
  "Current Game Day: ".concat(GAME_DAY, "\n\n") +
  //prompt start
  'Enter the new game day (e.g., "Sunday", "Monday", etc.):',
  //prompt end
  ui.ButtonSet.OK_CANCEL //buttons
  );
  if (result.getSelectedButton() == ui.Button.OK) {
    var newGameDay = result.getResponseText().trim();
    if (newGameDay) {
      setGameDay(newGameDay);
      GAME_DAY = newGameDay; // Update the current script's variable
      ui.alert('Game Day Updated', "Game day has been set to: ".concat(GAME_DAY), ui.ButtonSet.OK);
    } else {
      ui.alert('No Input', 'No game day was entered. Keeping the current game day.', ui.ButtonSet.OK);
    }
  } else {
    ui.alert('Cancelled', 'Game day change was cancelled. Current game day remains unchanged.', ui.ButtonSet.OK);
  }
}

/**
 * Allows the user to change the timeslots using values that they manually provide
 * Called from user input
 */
function manuallyInputTimeSlots() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt('Set Custom Time Slots', 'Please enter time slots separated by commas (e.g., "6pm PST/9pm EST, 7pm PST/10pm EST"):', ui.ButtonSet.OK_CANCEL);
  var button = result.getSelectedButton();
  var text = result.getResponseText();
  if (button == ui.Button.OK) {
    if (text) {
      var newTimeSlots = text.split(',').map(function (slot) {
        return slot.trim();
      });
      setTimeSlots(newTimeSlots); // Store the new time slots
      TIME_SLOTS = newTimeSlots; // Update the current script's variable
      ui.alert('Time Slots Set', "Time slots have been set to: ".concat(TIME_SLOTS.join(", ")), ui.ButtonSet.OK);
    } else {
      ui.alert('No Input', 'No time slots were entered. Using current time slots.', ui.ButtonSet.OK);
    }
  } else if (button == ui.Button.CANCEL) {
    ui.alert('Cancelled', 'Manual time slot setting was cancelled. Using current time slots.', ui.ButtonSet.OK);
  }
}

/**
 * Parses the available time slots from the Google Form responses and sets the script's
 * time slots to use those values.
 * Called from user input.
 */
function setAutomaticTimeSlots() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0]; // Get the first sheet

  // Get time slots from the 5th column
  var timeSlotsRange = sheet.getRange(2, TIME_SLOTS_COLUMN, sheet.getLastRow() - 1, 1);
  var timeSlotValues = timeSlotsRange.getValues().flat().filter(Boolean);

  // Split any combined time slots
  var splitTimeSlots = timeSlotValues.flatMap(function (slot) {
    return slot.split(',').map(function (s) {
      return s.trim();
    });
  });

  // Use Set to remove duplicates, then convert back to array
  var uniqueTimeSlots = _toConsumableArray(new Set(splitTimeSlots));
  if (uniqueTimeSlots.length > 0) {
    setTimeSlots(uniqueTimeSlots); // Store the new time slots
    TIME_SLOTS = uniqueTimeSlots; // Update the current script's variable
    var message = "Time slots have been set to: ".concat(TIME_SLOTS.join(", "));
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
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var playersSheet = ss.getSheets()[0];
    var teamsSheet = ss.getSheetByName("Teams") || ss.insertSheet("Teams");
    Logger.log("Sheets retrieved successfully");
    var allPlayers = getPlayersData(playersSheet);
    Logger.log("All players data retrieved: " + JSON.stringify(allPlayers));
    if (allPlayers.length === 0) {
      throw new Error("No valid players found. Please check the player data.");
    }
    var teamsAndSubs = createOptimalTeams(allPlayers);
    Logger.log("Teams and substitutes created: " + JSON.stringify(teamsAndSubs));
    writeTeamsToSheet(teamsSheet, teamsAndSubs);
    Logger.log("Teams written to sheet");
  } catch (e) {
    Logger.log("Error: ".concat(e.message));
    throw e;
  }
  Logger.log("sortPlayersIntoBalancedTeams function completed");
}
function getPlayersData(sheet) {
  var data = sheet.getDataRange().getValues();
  Logger.log("Raw data: ".concat(JSON.stringify(data.slice(0, 2))));
  if (data.length < 2) {
    Logger.log("Not enough data in the sheet. Make sure there's at least one player entry.");
    return [];
  }
  var players = data.slice(1).map(function (row, index) {
    var player = {
      timestamp: row[0],
      discordUsername: row[1],
      riotID: row[2],
      pronouns: row[3],
      timeSlots: row[TIME_SLOTS_COLUMN - 1] ? row[TIME_SLOTS_COLUMN - 1].toString().split(',').map(function (s) {
        return s.trim();
      }) : TIME_SLOTS,
      multipleGames: row[5],
      substitute: row[6].toString().toLowerCase() === 'yes',
      lobbyHost: row[7],
      duo: row[8],
      currentRank: getRankValue(row[9]),
      peakRank: getRankValue(row[10])
    };
    player.averageRank = (player.currentRank + player.peakRank) / 2;
    Logger.log("Player ".concat(index + 1, ": Discord: ").concat(player.discordUsername, ", Current Rank: ").concat(row[9], " (").concat(player.currentRank, "), Peak Rank: ").concat(row[10], " (").concat(player.peakRank, "), Substitute: ").concat(player.substitute, ", Time Slots: ").concat(player.timeSlots));
    return player;
  });
  var validPlayers = players.filter(function (player) {
    var isValid = player.currentRank > 0 || player.peakRank > 0;
    if (!isValid) {
      Logger.log("Filtered out player: ".concat(player.discordUsername, " (Current Rank: ").concat(player.currentRank, ", Peak Rank: ").concat(player.peakRank, ")"));
    }
    return isValid;
  });
  Logger.log("Number of players before filtering: ".concat(players.length));
  Logger.log("Number of players after filtering: ".concat(validPlayers.length));
  Logger.log("Sample player data: ".concat(JSON.stringify(validPlayers[0])));
  return validPlayers;
}
function writeTeamsToSheet(sheet, teamsAndSubs) {
  sheet.clear();
  var rowIndex = 0;
  var teamColors = ["#FFF2CC", "#D9EAD3", "#C9DAF8", "#F4CCCC", "#FFD966", "#B6D7A8", "#9FC5E8", "#EA9999"];
  var headerColor = "#4A86E8";
  var subHeaderColor = "#A4C2F4";
  TIME_SLOTS.forEach(function (timeSlot, slotIndex) {
    // Write time slot header
    sheet.getRange(rowIndex + 1, 1, 1, 6).merge().setValue(timeSlot).setFontWeight("bold").setBackground(headerColor).setFontColor("#ffffff").setFontSize(14).setHorizontalAlignment("center");
    rowIndex++;
    var timeSlotTeams = teamsAndSubs.teams.filter(function (team) {
      return team.timeSlot === timeSlot;
    });
    timeSlotTeams.forEach(function (team, teamIndex) {
      var teamColor = teamColors[(slotIndex * 4 + teamIndex) % teamColors.length];

      // Write team header
      sheet.getRange(rowIndex + 1, 1, 1, 5).merge().setValue(team.name).setFontWeight("bold").setBackground(teamColor).setFontColor("#000000").setFontSize(12).setHorizontalAlignment("center");

      // Add Team Total in the same row
      var totalCell = sheet.getRange(rowIndex + 1, 6);
      totalCell.setFontWeight("bold").setBackground(teamColor).setFontColor("#000000").setFontSize(12).setHorizontalAlignment("right");

      // Add formula for team total using column and row references
      var startRow = rowIndex + 3;
      var endRow = startRow + TEAM_SIZE - 1;
      var totalFormula = "SUM($F".concat(startRow, ":$F").concat(endRow, ")");
      totalCell.setFormula("\"Total: \" & TEXT(".concat(totalFormula, ", \"0.0\")"));
      rowIndex++;

      // Write player header
      var headerRange = sheet.getRange(rowIndex + 1, 1, 1, 6);
      headerRange.setValues([["Discord", "Riot ID", "Current Rank", "Peak Rank", "Lobby Host", "Avg Rank"]]).setFontWeight("bold").setBackground(teamColor).setFontColor("#000000").setHorizontalAlignment("center");
      rowIndex++;

      // Write player data
      team.players.forEach(function (player) {
        var playerRow = [player.discordUsername, player.riotID, getRankName(player.currentRank), getRankName(player.peakRank), player.lobbyHost, player.averageRank.toFixed(2)];
        var range = sheet.getRange(rowIndex + 1, 1, 1, playerRow.length);
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
    var substitutes = teamsAndSubs.substitutes[timeSlot];
    if (substitutes && substitutes.length > 0) {
      // Write substitutes header
      sheet.getRange(rowIndex + 1, 1, 1, 6).merge().setValue("Substitutes").setFontWeight("bold").setBackground(subHeaderColor).setFontColor("#000000").setFontSize(12).setHorizontalAlignment("center");
      rowIndex++;

      // Write substitutes column headers
      var subHeaderRange = sheet.getRange(rowIndex + 1, 1, 1, 6);
      subHeaderRange.setValues([["Discord", "Riot ID", "Current Rank", "Peak Rank", "Lobby Host", "Avg Rank"]]).setFontWeight("bold").setBackground(subHeaderColor).setFontColor("#000000").setHorizontalAlignment("center");
      rowIndex++;

      // Write substitute player data
      substitutes.forEach(function (sub) {
        var subRow = [sub.discordUsername, sub.riotID, getRankName(sub.currentRank), getRankName(sub.peakRank), sub.lobbyHost, sub.averageRank.toFixed(2)];
        var range = sheet.getRange(rowIndex + 1, 1, 1, subRow.length);
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
function generateDiscordPings() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var teamsSheet = ss.getSheetByName("Teams");
  if (!teamsSheet) {
    Logger.log("Error: Teams sheet not found.");
    throw new Error("Teams sheet not found. Please create teams first.");
  }

  // Get all data from the Teams sheet
  var data = teamsSheet.getDataRange().getValues();
  Logger.log("Total rows in Teams sheet: ".concat(data.length));

  // Initialize variables
  var currentTimeSlot = null;
  var currentTeam = null;
  var teams = [];
  var substitutes = {};
  var currentSection = null; // Possible values: null, "team", "players", "substitutes", "substitutesPlayers"

  // Process each row in the Teams sheet
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var firstCell = row[0].toString().trim();
    Logger.log("Processing row ".concat(i + 1, ": \"").concat(firstCell, "\""));

    // Detect Time Slot
    if (row.length === 6 && (firstCell.includes("CEST") || firstCell.includes("WEST"))) {
      currentTimeSlot = firstCell;
      currentSection = "timeSlot";
      if (!substitutes[currentTimeSlot]) {
        substitutes[currentTimeSlot] = [];
      }
      Logger.log("Detected Time Slot: \"".concat(currentTimeSlot, "\""));
      continue;
    }

    // Detect Team Header
    if (firstCell.startsWith("Team")) {
      currentTeam = {
        name: firstCell,
        // e.g., "Team 1"
        timeSlot: currentTimeSlot,
        players: []
      };
      teams.push(currentTeam);
      currentSection = "team";
      Logger.log("Detected Team: \"".concat(currentTeam.name, "\" under Time Slot: \"").concat(currentTimeSlot, "\""));
      continue;
    }

    // Detect "Discord" header indicating the start of Players section for a Team
    if (firstCell === "Discord" && currentSection === "team") {
      currentSection = "players";
      Logger.log("Detected Players section under Team: \"".concat(currentTeam.name, "\""));
      continue;
    }

    // Detect "Substitutes" header
    if (firstCell === "Substitutes") {
      currentTeam = null;
      currentSection = "substitutes";
      Logger.log("Detected Substitutes section under Time Slot: \"".concat(currentTimeSlot, "\""));
      continue;
    }

    // Detect "Discord" header indicating the start of Players section for Substitutes
    if (firstCell === "Discord" && currentSection === "substitutes") {
      currentSection = "substitutesPlayers";
      Logger.log("Detected Players section under Substitutes for Time Slot: \"".concat(currentTimeSlot, "\""));
      continue;
    }

    // Process Player Rows for Teams
    if (currentSection === "players" && firstCell !== "") {
      var player = {
        discordUsername: firstCell.replace(/^@/, '').trim(),
        // Remove "@" if present
        riotID: row[1] ? row[1].toString().trim() : "",
        lobbyHost: row[4] ? row[4].toString().trim().toLowerCase() === "yes" : false
      };
      currentTeam.players.push(player);
      Logger.log("Added Player to Team \"".concat(currentTeam.name, "\": \"@").concat(player.discordUsername, "\" (Lobby Host: ").concat(player.lobbyHost, ")"));
      continue;
    }

    // Process Player Rows for Substitutes
    if (currentSection === "substitutesPlayers" && firstCell !== "") {
      var substitute = {
        discordUsername: firstCell.replace(/^@/, '').trim(),
        // Remove "@" if present
        riotID: row[1] ? row[1].toString().trim() : "",
        lobbyHost: row[4] ? row[4].toString().trim().toLowerCase() === "yes" : false
      };
      substitutes[currentTimeSlot].push(substitute);
      Logger.log("Added Substitute to Time Slot \"".concat(currentTimeSlot, "\": \"@").concat(substitute.discordUsername, "\" (Lobby Host: ").concat(substitute.lobbyHost, ")"));
      continue;
    }

    // Reset section if encountering an empty row
    if (firstCell === "") {
      currentSection = null;
      Logger.log("Encountered empty row. Resetting current section.");
      continue;
    }
  }
  Logger.log("Total Teams Parsed: ".concat(teams.length));
  Logger.log("Total Substitutes Parsed: ".concat(JSON.stringify(substitutes)));

  // Create pings content
  var currentDate = new Date();
  var gameDay = PropertiesService.getScriptProperties().getProperty('GAME_DAY') || "Saturday";
  var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var gameDayIndex = daysOfWeek.indexOf(gameDay);
  var currentDayIndex = currentDate.getDay();
  var daysUntilGame = (7 + gameDayIndex - currentDayIndex) % 7;
  var nextGameDay = new Date(currentDate);
  nextGameDay.setDate(currentDate.getDate() + daysUntilGame);
  var formattedDate = nextGameDay.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  });
  Logger.log("Game Day: \"".concat(gameDay, "\", Date: \"").concat(formattedDate, "\""));

  // Create the content array
  var contentArray = [];

  // Add title as first element
  contentArray.push("# Here are the teams for ".concat(gameDay, ", ").concat(formattedDate, "!"));
  Logger.log("Added title to contentArray.");

  // Group teams by time slot
  var timeSlots = _toConsumableArray(new Set(teams.map(function (team) {
    return team.timeSlot;
  })));
  Logger.log("Unique Time Slots: ".concat(timeSlots.join(", ")));
  timeSlots.forEach(function (timeSlot) {
    var timeSlotTeams = teams.filter(function (team) {
      return team.timeSlot === timeSlot;
    });
    var timeSlotSubstitutes = substitutes[timeSlot] || [];
    if (timeSlotTeams.length > 0 || timeSlotSubstitutes.length > 0) {
      // Add time slot header with "Timeslot"
      contentArray.push("## ".concat(timeSlot, " Timeslot"));
      Logger.log("Added Time Slot Header: \"".concat(timeSlot, " Timeslot\""));

      // Group teams into pairs (e.g., Team 1 & Team 2)
      for (var _i = 0; _i < timeSlotTeams.length; _i += 2) {
        var pair = timeSlotTeams.slice(_i, _i + 2);
        Logger.log("Processing Team Pair: \"".concat(pair.map(function (t) {
          return t.name;
        }).join(" & "), "\""));

        // Assign one Lobby Host per pair
        var lobbyHosts = pair.flatMap(function (team) {
          return team.players;
        }).filter(function (player) {
          return player.lobbyHost;
        });
        var selectedHost = null;
        if (lobbyHosts.length > 0) {
          selectedHost = lobbyHosts[0]; // Select the first Lobby Host found
          Logger.log("Selected Lobby Host: \"@".concat(selectedHost.discordUsername, "\" for Team Pair: \"").concat(pair.map(function (t) {
            return t.name;
          }).join(" & "), "\""));
        } else {
          Logger.log("No Lobby Host found for Team Pair: \"".concat(pair.map(function (t) {
            return t.name;
          }).join(" & "), "\""));
        }

        // Add Lobby Host section if a host is selected
        if (selectedHost) {
          contentArray.push("### Lobby Host");
          contentArray.push("@".concat(selectedHost.discordUsername));
          contentArray.push(''); // Blank line after Lobby Host
          Logger.log("Added Lobby Host Section: \"@".concat(selectedHost.discordUsername, "\""));
        }

        // Add each team in the pair
        pair.forEach(function (team) {
          contentArray.push("### ".concat(team.name));
          Logger.log("Added Team Header: \"".concat(team.name, "\""));
          team.players.forEach(function (player) {
            contentArray.push("@".concat(player.discordUsername));
            Logger.log("Added Player Mention: \"@".concat(player.discordUsername, "\""));
          });
          contentArray.push(''); // Blank line after each team
          Logger.log("Added blank line after Team: \"".concat(team.name, "\""));
        });
      }

      // Add substitutes section if there are any
      if (timeSlotSubstitutes.length > 0) {
        contentArray.push("### Substitutes");
        Logger.log("Added Substitutes Header for Time Slot: \"".concat(timeSlot, " Timeslot\""));
        timeSlotSubstitutes.forEach(function (sub) {
          contentArray.push("@".concat(sub.discordUsername));
          Logger.log("Added Substitute Mention: \"@".concat(sub.discordUsername, "\""));
        });
        contentArray.push(''); // Blank line after substitutes
        Logger.log("Added blank line after Substitutes for Time Slot: \"".concat(timeSlot, " Timeslot\""));
      }

      // Add separator
      contentArray.push(''); // Blank line after separator
      Logger.log("Added separator for Time Slot: \"".concat(timeSlot, " Timeslot\""));
    }
  });

  // Join all text for potential direct usage (e.g., sending via API)
  var discordPingText = contentArray.join('\n');
  Logger.log("Generated Discord Ping Text:\n" + discordPingText);

  // Invoke the write function to write to the "Discord Pings" sheet
  try {
    var discordPingsSheet = ss.getSheetByName("Discord Pings") || ss.insertSheet("Discord Pings");
    writeDiscordPingsToSheet(discordPingsSheet, discordPingText);
    Logger.log("Successfully wrote Discord pings to the 'Discord Pings' sheet.");
  } catch (error) {
    Logger.log("Error writing to Discord Pings sheet: ".concat(error.message));
    throw error;
  }

  // Optionally, return the ping text if needed elsewhere
  return discordPingText;
}
function writeDiscordPingsToSheet(sheet, pings) {
  sheet.clear();
  Logger.log("Cleared existing content in Discord Pings sheet.");
  var lines = pings.split("\n");
  var numRows = lines.length;
  var range = sheet.getRange(1, 1, numRows, 1);
  Logger.log("Total lines to write: ".concat(numRows));

  // Set values and basic formatting
  range.setValues(lines.map(function (line) {
    return [line];
  }));
  range.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  range.setVerticalAlignment("top");
  Logger.log("Set values and basic formatting.");

  // Apply formatting based on line content
  for (var i = 0; i < numRows; i++) {
    var cell = range.getCell(i + 1, 1);
    var content = lines[i].trim();
    Logger.log("Formatting row ".concat(i + 1, ": \"").concat(content, "\""));
    if (content.startsWith("# ")) {
      // Title Header: Darker Blue
      cell.setFontWeight("bold").setFontSize(18).setBackground("#002B80") // Darker Blue
      .setFontColor("#ffffff");
      Logger.log("Formatted Title: \"".concat(content, "\""));
    } else if (content.startsWith("## ") && content.endsWith("Timeslot")) {
      // Timeslot Headers: Original Blue
      cell.setFontWeight("bold").setFontSize(14).setBackground("#4A86E8") // Original Blue
      .setFontColor("#ffffff");
      Logger.log("Formatted Timeslot Header: \"".concat(content, "\""));
    } else if (content.startsWith("### Lobby Host")) {
      // Lobby Host Headers: Light Blue
      cell.setFontWeight("bold").setFontSize(13).setBackground("#CFE2F3") // Light Blue
      .setFontColor("#000000"); // Black text
      Logger.log("Formatted Lobby Host Header: \"".concat(content, "\""));
    } else if (content.startsWith("### Team")) {
      // Team Headers: Light Blue
      cell.setFontWeight("bold").setFontSize(13).setBackground("#CFE2F3") // Light Blue
      .setFontColor("#000000"); // Black text
      Logger.log("Formatted Team Header: \"".concat(content, "\""));
    } else if (content.startsWith("### Substitutes")) {
      // Substitutes Header: Different Shade of Blue
      cell.setFontWeight("bold").setFontSize(13).setBackground("#A9D0F5") // Light Sky Blue
      .setFontColor("#000000"); // Black text
      Logger.log("Formatted Substitutes Header: \"".concat(content, "\""));
    } else if (content.startsWith("@")) {
      // Player Names: Indented
      cell.setFontSize(11).setFontColor("#000000"); // Black test
      Logger.log("Formatted Player Mention: \"".concat(content, "\""));
    } else if (content === "") {
      // Empty Lines: Clear Content and Remove Background
      cell.setValue("").setBackground(null); // Remove any background color
      Logger.log("Cleared empty row ".concat(i + 1));
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
function setConditionalFormatting(range) {
  var rules = [{
    rank: "Iron",
    color: "#464646"
  }, {
    rank: "Bronze",
    color: "#a6824c"
  }, {
    rank: "Silver",
    color: "#dce1dc"
  }, {
    rank: "Gold",
    color: "#dc8e21"
  }, {
    rank: "Platinum",
    color: "#27697a"
  }, {
    rank: "Diamond",
    color: "#c688f7"
  }, {
    rank: "Ascendant",
    color: "#40b57e"
  }, {
    rank: "Immortal",
    color: "#953640"
  }, {
    rank: "Radiant",
    color: "#f2dc95"
  }];
  var conditionalFormatRules = rules.map(function (rule) {
    return SpreadsheetApp.newConditionalFormatRule().setRanges([range]).whenTextContains(rule.rank).setBackground(rule.color).setFontColor(getContrastColor(rule.color)).build();
  });
  range.getSheet().setConditionalFormatRules(range.getSheet().getConditionalFormatRules().concat(conditionalFormatRules));
}
function getContrastColor(hexcolor) {
  var r = parseInt(hexcolor.substr(1, 2), 16);
  var g = parseInt(hexcolor.substr(3, 2), 16);
  var b = parseInt(hexcolor.substr(5, 2), 16);
  var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
function getRankValue(rank) {
  var ranks = {
    "Iron 1": 1,
    "Iron 2": 3,
    "Iron 3": 6,
    "Bronze 1": 10,
    "Bronze 2": 12,
    "Bronze 3": 15,
    "Silver 1": 20,
    "Silver 2": 22,
    "Silver 3": 25,
    "Gold 1": 30,
    "Gold 2": 32,
    "Gold 3": 35,
    "Platinum 1": 40,
    "Platinum 2": 42,
    "Platinum 3": 45,
    "Diamond 1": 50,
    "Diamond 2": 52,
    "Diamond 3": 55,
    "Ascendant 1": 60,
    "Ascendant 2": 65,
    "Ascendant 3": 70,
    "Immortal 1": 80,
    "Immortal 2": 85,
    "Immortal 3": 95,
    "Radiant": 110
  };
  return ranks[rank] || 0;
}
function getRankName(rankValue) {
  var rankNames = {
    1: "Iron 1",
    3: "Iron 2",
    6: "Iron 3",
    10: "Bronze 1",
    12: "Bronze 2",
    15: "Bronze 3",
    20: "Silver 1",
    22: "Silver 2",
    25: "Silver 3",
    30: "Gold 1",
    32: "Gold 2",
    35: "Gold 3",
    40: "Platinum 1",
    42: "Platinum 2",
    45: "Platinum 3",
    50: "Diamond 1",
    52: "Diamond 2",
    55: "Diamond 3",
    60: "Ascendant 1",
    65: "Ascendant 2",
    70: "Ascendant 3",
    80: "Immortal 1",
    85: "Immortal 2",
    95: "Immortal 3",
    110: "Radiant"
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

/***** TEAM BALANCING LOGIC FUNCTIONS *****/
function createOptimalTeams(players) {
  var result = {
    teams: [],
    substitutes: {}
  };
  var assignedPlayers = new Set();

  // Ensure TIME_SLOTS is defined and not empty
  if (!TIME_SLOTS || TIME_SLOTS.length === 0) {
    Logger.log("Error: TIME_SLOTS is undefined or empty");
    return result;
  }

  // Sort players based on the number of available time slots (ascending)
  players.sort(function (a, b) {
    return a.timeSlots.length - b.timeSlots.length;
  });

  // Process each time slot
  TIME_SLOTS.forEach(function (timeSlot, slotIndex) {
    var timeSlotPlayers = [];

    // First, add players who can only play in this time slot
    players.forEach(function (player) {
      if (player.timeSlots.length === 1 && player.timeSlots[0] === timeSlot && !assignedPlayers.has(player.discordUsername)) {
        timeSlotPlayers.push(player);
      }
    });

    // Then, add players who haven't played yet and can play in this slot
    players.forEach(function (player) {
      if (player.timeSlots.includes(timeSlot) && !assignedPlayers.has(player.discordUsername) && !timeSlotPlayers.includes(player)) {
        timeSlotPlayers.push(player);
      }
    });

    // Finally, add any remaining available players
    players.forEach(function (player) {
      if (player.timeSlots.includes(timeSlot) && !timeSlotPlayers.includes(player)) {
        timeSlotPlayers.push(player);
      }
    });

    // Create teams for this time slot
    var slotResult = createOptimalTeamsForTimeSlot(timeSlotPlayers, timeSlot, assignedPlayers);
    result.teams = result.teams.concat(slotResult.teams);
    result.substitutes[timeSlot] = slotResult.substitutes;
    assignedPlayers = new Set([].concat(_toConsumableArray(assignedPlayers), _toConsumableArray(slotResult.assignedPlayers)));
    Logger.log("Created ".concat(slotResult.teams.length, " teams for time slot: ").concat(timeSlot));
    Logger.log("Substitutes for time slot ".concat(timeSlot, ": ").concat(slotResult.substitutes.length));
  });
  return result;
}
function createOptimalTeamsForTimeSlot(players, timeSlot, assignedPlayers) {
  var numPlayers = players.length;
  var maxTeams = Math.floor(numPlayers / TEAM_SIZE);

  // Ensure even number of teams and all teams have exactly TEAM_SIZE players
  var adjustedNumTeams = Math.floor(maxTeams / 2) * 2;
  var teams = [];

  // Initialize empty teams
  for (var i = 0; i < adjustedNumTeams; i++) {
    teams.push({
      name: "Team ".concat(i + 1),
      timeSlot: timeSlot,
      players: [],
      total: 0 // total rank power of the team
    });
  }

  // Sort players: single time slot first, then unassigned, then by rank (descending)
  players.sort(function (a, b) {
    if (a.timeSlots.length !== b.timeSlots.length) {
      return a.timeSlots.length - b.timeSlots.length;
    }
    if (assignedPlayers.has(a.discordUsername) !== assignedPlayers.has(b.discordUsername)) {
      return assignedPlayers.has(a.discordUsername) ? 1 : -1;
    }
    return b.averageRank - a.averageRank;
  });

  // Distribute players evenly across teams
  var teamPlayers = players.slice(0, adjustedNumTeams * TEAM_SIZE);
  for (var _i2 = 0; _i2 < teamPlayers.length; _i2++) {
    var teamIndex = _i2 % adjustedNumTeams;
    teams[teamIndex].players.push(teamPlayers[_i2]);
    teams[teamIndex].total += teamPlayers[_i2].averageRank;
  }

  // Remaining players become substitutes
  var substitutes = players.slice(adjustedNumTeams * TEAM_SIZE);

  // Optimize team balance
  for (var iteration = 0; iteration < 100; iteration++) {
    var improved = false;
    for (var _i3 = 0; _i3 < teams.length; _i3++) {
      for (var j = _i3 + 1; j < teams.length; j++) {
        if (trySwapPlayers(teams[_i3], teams[j])) {
          improved = true;
        }
      }
    }
    if (!improved) break;
  }

  // Calculate team spread for logging
  var teamSpread = getTeamSpread(teams);
  Logger.log("Team spread for ".concat(timeSlot, ": ").concat(teamSpread.toFixed(2)));
  return {
    teams: teams,
    substitutes: substitutes,
    assignedPlayers: new Set([].concat(_toConsumableArray(assignedPlayers), _toConsumableArray(teams.flatMap(function (team) {
      return team.players.map(function (p) {
        return p.discordUsername;
      });
    }))))
  };
}
function trySwapPlayers(team1, team2) {
  for (var i = 0; i < team1.players.length; i++) {
    for (var j = 0; j < team2.players.length; j++) {
      var diff1 = team1.players[i].averageRank - team2.players[j].averageRank;
      var newTotal1 = team1.total - diff1;
      var newTotal2 = team2.total + diff1;
      if (Math.abs(newTotal1 - newTotal2) < Math.abs(team1.total - team2.total)) {
        // Swap players
        var temp = team1.players[i];
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
function getTeamSpread(teams) {
  var totals = teams.map(function (team) {
    return team.total;
  });
  return Math.max.apply(Math, _toConsumableArray(totals)) - Math.min.apply(Math, _toConsumableArray(totals));
}

var global = {};
global.onOpen = onOpen;
global.manageTimeSlots = manageTimeSlots;
global.sortPlayersIntoBalancedTeams = sortPlayersIntoBalancedTeams;
global.clearResponses = clearResponses;
global.generateDiscordPings = generateDiscordPings;
global.sum = sum;
