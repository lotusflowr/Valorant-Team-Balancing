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

/** @OnlyCurrentDoc */
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
  ui.createMenu('SCRIPTS').addItem('Manage Time Slots', 'manageTimeSlots').addItem('Balance Teams and Players', 'sortPlayersIntoBalancedTeams').addItem('Clear Responses', 'clearResponses').addItem('Hi', 'sum').addToUi();
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
    var teamsAndSubs = TeamBalanceModule.createOptimalTeams(allPlayers);
    Logger.log("Teams and substitutes created: " + JSON.stringify(teamsAndSubs));
    writeTeamsToSheet(teamsSheet, teamsAndSubs);
    Logger.log("Teams written to sheet");
    var discordPings = createDiscordPings(teamsAndSubs.teams, teamsAndSubs.substitutes);

    // Write Discord pings to a new sheet
    var discordPingsSheet = ss.getSheetByName("Discord Pings") || ss.insertSheet("Discord Pings");
    writeDiscordPingsToSheet(discordPingsSheet, discordPings);
    Logger.log("Discord Pings completed");
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
function createDiscordPings(teams, substitutes) {
  var currentDate = new Date();
  var nextGameDay = new Date(currentDate.setDate(currentDate.getDate() + (7 + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(GAME_DAY) - currentDate.getDay()) % 7));
  var formattedDate = nextGameDay.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  });
  var pings = "# Here are the teams for ".concat(GAME_DAY, ", ").concat(formattedDate, "!\n\n");
  TIME_SLOTS.forEach(function (timeSlot, slotIndex) {
    var timeSlotTeams = teams.filter(function (team) {
      return team.timeSlot === timeSlot;
    });
    var timeSlotSubstitutes = substitutes[timeSlot] || [];
    if (timeSlotTeams.length > 0 || timeSlotSubstitutes.length > 0) {
      pings += "## TIMESLOT ".concat(slotIndex + 1, "\n\n");
      var _loop = function _loop(i) {
        var twoTeams = timeSlotTeams.slice(i, i + 2);
        var lobbyHost = twoTeams.flatMap(function (team) {
          return team.players;
        }).find(function (player) {
          return player.lobbyHost === "Yes";
        });
        if (lobbyHost) {
          if (timeSlotTeams.length > 2) {
            pings += "### LOBBY HOST **Team ".concat(i + 1, " & ").concat(i + 2, "**\n@").concat(lobbyHost.discordUsername, "\n\n");
          } else {
            pings += "### LOBBY HOST\n@".concat(lobbyHost.discordUsername, "\n\n");
          }
        }
        twoTeams.forEach(function (team, index) {
          pings += "### Team ".concat(i + index + 1, "\n");
          team.players.forEach(function (player) {
            pings += "@".concat(player.discordUsername, "\n");
          });
          pings += "\n";
        });
      };
      for (var i = 0; i < timeSlotTeams.length; i += 2) {
        _loop(i);
      }
      if (timeSlotSubstitutes.length > 0) {
        pings += "### Substitutes\n";
        timeSlotSubstitutes.forEach(function (sub) {
          pings += "@".concat(sub.discordUsername, "\n");
        });
        pings += "\n";
      }
    }
  });
  return pings;
}
function writeDiscordPingsToSheet(sheet, pings) {
  sheet.clear();
  var lines = pings.split("\n");
  var numRows = lines.length;
  var range = sheet.getRange(1, 1, numRows, 1);

  // Set values and basic formatting
  range.setValues(lines.map(function (line) {
    return [line];
  }));
  range.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  range.setVerticalAlignment("top");

  // Apply formatting based on line content
  for (var i = 0; i < numRows; i++) {
    var cell = range.getCell(i + 1, 1);
    var content = lines[i];
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
    "Iron 2": 5,
    "Iron 3": 10,
    "Bronze 1": 15,
    "Bronze 2": 20,
    "Bronze 3": 25,
    "Silver 1": 35,
    "Silver 2": 40,
    "Silver 3": 45,
    "Gold 1": 55,
    "Gold 2": 60,
    "Gold 3": 65,
    "Platinum 1": 75,
    "Platinum 2": 80,
    "Platinum 3": 85,
    "Diamond 1": 95,
    "Diamond 2": 100,
    "Diamond 3": 110,
    "Ascendant 1": 125,
    "Ascendant 2": 130,
    "Ascendant 3": 140,
    "Immortal 1": 160,
    "Immortal 2": 165,
    "Immortal 3": 180,
    "Radiant": 220
  };
  return ranks[rank] || 0;
}
function getRankName(rankValue) {
  var rankNames = {
    1: "Iron 1",
    5: "Iron 2",
    10: "Iron 3",
    15: "Bronze 1",
    20: "Bronze 2",
    25: "Bronze 3",
    35: "Silver 1",
    40: "Silver 2",
    45: "Silver 3",
    55: "Gold 1",
    60: "Gold 2",
    65: "Gold 3",
    75: "Platinum 1",
    80: "Platinum 2",
    85: "Platinum 3",
    95: "Diamond 1",
    100: "Diamond 2",
    110: "Diamond 3",
    125: "Ascendant 1",
    130: "Ascendant 2",
    140: "Ascendant 3",
    160: "Immortal 1",
    165: "Immortal 2",
    180: "Immortal 3",
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

var global = {};
global.onOpen = onOpen;
global.manageTimeSlots = manageTimeSlots;
global.sortPlayersIntoBalancedTeams = sortPlayersIntoBalancedTeams;
global.clearResponses = clearResponses;
global.sum = sum;
