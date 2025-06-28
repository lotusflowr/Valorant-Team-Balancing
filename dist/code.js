/** @OnlyCurrentDoc */

// ============================================================================
// CORE SETTINGS
// ============================================================================
var TEAM_SIZE = 5;

// ============================================================================
// OUTPUT SHEET CONFIGURATION (Teams Sheet)
// ============================================================================
var OUTPUT_SHEET_CONFIG = {
  // Flexible column order - you can reorder these as needed
  // Each entry defines: { key: 'dataKey', width: pixelWidth|'auto', title: 'Header Text', type: 'data|calculated|display' }
  columns: [{
    key: 'riotID',
    width: 'auto',
    title: 'Riot ID',
    type: 'data'
  }, {
    key: 'discordUsername',
    width: 'auto',
    title: 'Discord',
    type: 'data'
  }, {
    key: 'currentRank',
    width: 'auto',
    title: 'Current Rank',
    type: 'data'
  }, {
    key: 'peakRank',
    width: 'auto',
    title: 'Peak Rank',
    type: 'data'
  }, {
    key: 'lobbyHost',
    width: 'auto',
    title: 'Lobby Host',
    type: 'data'
  }, {
    key: 'averageRank',
    width: 'auto',
    title: 'Avg Rank',
    type: 'calculated'
  }],
  // Total number of columns (calculated automatically)
  get totalColumns() {
    return this.columns.length;
  },
  // Get column index by key (1-indexed for getRange)
  getColumnIndex: function getColumnIndex(key) {
    return this.columns.findIndex(function (col) {
      return col.key === key;
    }) + 1;
  },
  // Get column width by key
  getColumnWidth: function getColumnWidth(key) {
    var col = this.columns.find(function (col) {
      return col.key === key;
    });
    return col ? col.width : 'auto'; // default to auto
  },
  // Get all column titles
  getColumnTitles: function getColumnTitles() {
    return this.columns.map(function (col) {
      return col.title;
    });
  },
  // Get data keys in order
  getDataKeys: function getDataKeys() {
    return this.columns.map(function (col) {
      return col.key;
    });
  },
  // Get column type by key
  getColumnType: function getColumnType(key) {
    var col = this.columns.find(function (col) {
      return col.key === key;
    });
    return col ? col.type : 'data';
  }
};

// ============================================================================
// DISCORD PINGS CONFIGURATION
// ============================================================================
var DISCORD_PINGS_CONFIG = {
  column: 1,
  // Single column output
  minWidth: 300,
  rowHeight: 21
};

// ============================================================================
// VISUAL STYLING
// ============================================================================
var STYLING = {
  // Colors
  colors: {
    team: ["#FFF2CC", "#D9EAD3", "#C9DAF8", "#F4CCCC", "#FFD966", "#B6D7A8", "#9FC5E8", "#EA9999"],
    header: "#4A86E8",
    subHeader: "#A4C2F4",
    substitute: "#F3F3F3",
    discord: {
      title: "#002B80",
      timeslot: "#4A86E8",
      lobbyHost: "#CFE2F3",
      substitutes: "#A9D0F5"
    },
    text: {
      white: "#ffffff",
      black: "#000000"
    },
    border: "#000000"
  },
  // Font sizes
  fontSize: {
    title: 18,
    timeslot: 14,
    teamHeader: 12,
    subHeader: 11,
    player: 11,
    "default": 11
  },
  // Row heights
  rowHeight: {
    "default": 21
  }
};

function getGameDay() {
  var scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty('GAME_DAY') || "Saturday"; // Default to Saturday if not set
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

// Sequential list of ranks for easier rank-to-points conversion
var RANK_ORDER = ["Iron 1", "Iron 2", "Iron 3", "Bronze 1", "Bronze 2", "Bronze 3", "Silver 1", "Silver 2", "Silver 3", "Gold 1", "Gold 2", "Gold 3", "Platinum 1", "Platinum 2", "Platinum 3", "Diamond 1", "Diamond 2", "Diamond 3", "Ascendant 1", "Ascendant 2", "Ascendant 3", "Immortal 1", "Immortal 2", "Immortal 3", "Radiant"];
function getRankValue(rank) {
  var index = RANK_ORDER.indexOf(rank);
  return index === -1 ? 0 : index + 1;
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

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return (String )(t); }

/**
 * Utility class for writing data to sheets with flexible column configuration
 */
var ColumnWriter = /*#__PURE__*/function () {
  function ColumnWriter(sheet) {
    _classCallCheck(this, ColumnWriter);
    this.sheet = sheet;
    this.config = OUTPUT_SHEET_CONFIG;
    this.loadDisplayConfig();
  }

  /**
   * Load the display configuration from script properties
   */
  return _createClass(ColumnWriter, [{
    key: "loadDisplayConfig",
    value: function loadDisplayConfig() {
      try {
        var configData = PropertiesService.getScriptProperties().getProperty('COLUMN_CONFIG');
        if (configData) {
          var configs = JSON.parse(configData);
          // Filter to only display columns
          this.displayConfigs = configs.filter(function (config) {
            return config.display === true;
          });
          Logger.log("Loaded ".concat(this.displayConfigs.length, " display columns from config"));
        } else {
          // Fallback to OUTPUT_SHEET_CONFIG
          this.displayConfigs = this.config.columns;
          Logger.log("Using fallback config with ".concat(this.displayConfigs.length, " columns"));
        }
      } catch (error) {
        Logger.log("Error loading display config: ".concat(error.message));
        // Fallback to OUTPUT_SHEET_CONFIG
        this.displayConfigs = this.config.columns;
      }
    }

    /**
     * Write a row of data using the configured column order (only display columns)
     * @param {number} rowIndex - The row index to write to (1-indexed)
     * @param {Object} playerData - The player data object
     * @param {Object} options - Additional options for formatting
     */
  }, {
    key: "writePlayerRow",
    value: function writePlayerRow(rowIndex, playerData) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var backgroundColor = options.backgroundColor,
        _options$textColor = options.textColor,
        textColor = _options$textColor === void 0 ? STYLING.colors.text.black : _options$textColor,
        _options$fontSize = options.fontSize,
        fontSize = _options$fontSize === void 0 ? STYLING.fontSize.player : _options$fontSize;

      // Build the row data based on display config
      var rowData = this.displayConfigs.map(function (config) {
        var key = config.key;
        switch (key) {
          case 'riotID':
            return playerData.riotID || '';
          case 'discordUsername':
            return playerData.discordUsername || '';
          case 'timeSlots':
            return Array.isArray(playerData.timeSlots) ? playerData.timeSlots.join(', ') : playerData.timeSlots || '';
          case 'currentRank':
            return playerData.currentRank || '';
          case 'peakRank':
            return playerData.peakRank || '';
          case 'lobbyHost':
            return playerData.lobbyHost || '';
          case 'averageRank':
            return playerData.averageRank ? playerData.averageRank.toFixed(2) : '';
          case 'pronouns':
            return playerData.pronouns || '';
          case 'preferredAgents':
            return playerData.preferredAgents || '';
          case 'multipleGames':
            return playerData.multipleGames || '';
          case 'willSub':
            return playerData.willSub || '';
          case 'duo':
            return playerData.duo || '';
          case 'comments':
            return playerData.comments || '';
          default:
            return playerData[key] || '';
        }
      });

      // Write the data
      var range = this.sheet.getRange(rowIndex, 1, 1, rowData.length);
      range.setValues([rowData]);

      // Apply formatting
      if (backgroundColor) {
        range.setBackground(backgroundColor);
      }
      range.setFontColor(textColor);
      range.setFontSize(fontSize);
      range.setHorizontalAlignment("center");
      range.setVerticalAlignment("middle");
      range.setBorder(true, true, true, true, true, true, STYLING.colors.border, SpreadsheetApp.BorderStyle.SOLID);
      return range;
    }

    /**
     * Write column headers using the configured titles
     * @param {number} rowIndex - The row index to write headers to (1-indexed)
     * @param {Object} options - Additional options for formatting
     */
  }, {
    key: "writeHeaders",
    value: function writeHeaders(rowIndex) {
      var _this = this;
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _options$backgroundCo = options.backgroundColor,
        backgroundColor = _options$backgroundCo === void 0 ? STYLING.colors.header : _options$backgroundCo,
        _options$textColor2 = options.textColor,
        textColor = _options$textColor2 === void 0 ? STYLING.colors.text.white : _options$textColor2,
        _options$fontSize2 = options.fontSize,
        fontSize = _options$fontSize2 === void 0 ? STYLING.fontSize.teamHeader : _options$fontSize2,
        _options$fontWeight = options.fontWeight,
        fontWeight = _options$fontWeight === void 0 ? "bold" : _options$fontWeight,
        _options$useAutoTitle = options.useAutoTitles,
        useAutoTitles = _options$useAutoTitle === void 0 ? false : _options$useAutoTitle;
      var headers;
      if (useAutoTitles) {
        // Try to get headers from the first row of the sheet
        try {
          var firstRow = this.sheet.getRange(1, 1, 1, this.displayConfigs.length).getValues()[0];
          headers = firstRow.map(function (cell, index) {
            if (cell && cell.toString().trim()) {
              return cell.toString().trim();
            } else {
              // Fallback to configured title
              return _this.displayConfigs[index] ? _this.displayConfigs[index].title : "Column ".concat(index + 1);
            }
          });
        } catch (error) {
          // Fallback to configured titles
          headers = this.displayConfigs.map(function (config) {
            return config.title;
          });
        }
      } else {
        headers = this.displayConfigs.map(function (config) {
          return config.title;
        });
      }
      var range = this.sheet.getRange(rowIndex, 1, 1, headers.length);
      range.setValues([headers]);

      // Apply formatting
      range.setBackground(backgroundColor);
      range.setFontColor(textColor);
      range.setFontSize(fontSize);
      range.setFontWeight(fontWeight);
      range.setHorizontalAlignment("center");
      range.setBorder(true, true, true, true, true, true, STYLING.colors.border, SpreadsheetApp.BorderStyle.SOLID);
      return range;
    }

    /**
     * Write a merged header (for time slots, team names, etc.)
     * @param {number} rowIndex - The row index to write to (1-indexed)
     * @param {string} text - The text to write
     * @param {Object} options - Additional options for formatting
     */
  }, {
    key: "writeMergedHeader",
    value: function writeMergedHeader(rowIndex, text) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var _options$backgroundCo2 = options.backgroundColor,
        backgroundColor = _options$backgroundCo2 === void 0 ? STYLING.colors.header : _options$backgroundCo2,
        _options$textColor3 = options.textColor,
        textColor = _options$textColor3 === void 0 ? STYLING.colors.text.white : _options$textColor3,
        _options$fontSize3 = options.fontSize,
        fontSize = _options$fontSize3 === void 0 ? STYLING.fontSize.timeslot : _options$fontSize3,
        _options$fontWeight2 = options.fontWeight,
        fontWeight = _options$fontWeight2 === void 0 ? "bold" : _options$fontWeight2,
        _options$mergeAll = options.mergeAll,
        mergeAll = _options$mergeAll === void 0 ? true : _options$mergeAll;
      var numColumns = mergeAll ? this.displayConfigs.length : this.displayConfigs.length - 1;
      var range = this.sheet.getRange(rowIndex, 1, 1, numColumns);

      // Always merge the range, regardless of mergeAll setting
      range.merge();
      range.setValue(text);
      range.setBackground(backgroundColor);
      range.setFontColor(textColor);
      range.setFontSize(fontSize);
      range.setFontWeight(fontWeight);
      range.setHorizontalAlignment("center");
      return range;
    }

    /**
     * Set column widths based on configuration
     */
  }, {
    key: "setColumnWidths",
    value: function setColumnWidths() {
      var _this2 = this;
      this.displayConfigs.forEach(function (config, index) {
        if (config.width !== 'auto') {
          _this2.sheet.setColumnWidth(index + 1, config.width);
        }
      });
    }

    /**
     * Auto-resize all columns (only for actual data columns)
     */
  }, {
    key: "autoResizeColumns",
    value: function autoResizeColumns() {
      try {
        var numColumns = this.displayConfigs.length;
        this.sheet.autoResizeColumns(1, numColumns);
        Logger.log("Auto-resized ".concat(numColumns, " columns in sheet: ").concat(this.sheet.getName()));
      } catch (error) {
        Logger.log("Error auto-resizing columns: ".concat(error.message));
      }
    }

    /**
     * Auto-resize rows
     */
  }, {
    key: "autoResizeRows",
    value: function autoResizeRows() {
      try {
        var lastRow = this.sheet.getLastRow();
        if (lastRow > 0) {
          this.sheet.autoResizeRows(1, lastRow);
          Logger.log("Auto-resized ".concat(lastRow, " rows in sheet: ").concat(this.sheet.getName()));
        }
      } catch (error) {
        Logger.log("Error auto-resizing rows: ".concat(error.message));
      }
    }

    /**
     * Get the total number of columns
     */
  }, {
    key: "getTotalColumns",
    value: function getTotalColumns() {
      return this.displayConfigs.length;
    }

    /**
     * Get column index by data key (1-indexed)
     */
  }, {
    key: "getColumnIndex",
    value: function getColumnIndex(key) {
      return this.displayConfigs.findIndex(function (config) {
        return config.key === key;
      }) + 1;
    }

    /**
     * Get column width by data key
     */
  }, {
    key: "getColumnWidth",
    value: function getColumnWidth(key) {
      var config = this.displayConfigs.find(function (config) {
        return config.key === key;
      });
      return config ? config.width : 'auto';
    }

    /**
     * Get column type by data key
     */
  }, {
    key: "getColumnType",
    value: function getColumnType(key) {
      var config = this.displayConfigs.find(function (config) {
        return config.key === key;
      });
      return config ? config.type : null;
    }

    /**
     * Get all available column keys
     */
  }, {
    key: "getAvailableKeys",
    value: function getAvailableKeys() {
      return this.displayConfigs.map(function (config) {
        return config.key;
      });
    }

    /**
     * Check if a key exists in the configuration
     */
  }, {
    key: "hasKey",
    value: function hasKey(key) {
      return this.displayConfigs.some(function (config) {
        return config.key === key;
      });
    }
  }]);
}();

/**
 * Factory function to create a ColumnWriter instance
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to write to
 * @returns {ColumnWriter} - A new ColumnWriter instance
 */
function createColumnWriter(sheet) {
  return new ColumnWriter(sheet);
}

function getColumnConfig$1() {
  var configData = PropertiesService.getScriptProperties().getProperty('COLUMN_CONFIG');
  if (configData) {
    return JSON.parse(configData);
  }
  return [];
}
function getInputColumnIndex(key, config) {
  var entry = config.find(function (c) {
    return c.key === key;
  });
  if (!entry || !entry.sourceColumn || entry.sourceColumn === 'N/A') return null;
  // Convert column letter to 0-based index
  return entry.sourceColumn.charCodeAt(0) - 65;
}
function getPlayersData(sheet) {
  var config = getColumnConfig$1();
  var data = sheet.getDataRange().getValues();
  Logger.log("Raw data: ".concat(JSON.stringify(data.slice(0, 2))));
  if (data.length < 2) {
    Logger.log("Not enough data in the sheet. Make sure there's at least one player entry.");
    return [];
  }
  var players = data.slice(1).map(function (row) {
    var player = {};
    config.forEach(function (col) {
      var idx = getInputColumnIndex(col.key, config);
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
  var validPlayers = players.filter(function (player) {
    var current = getRankValue(player.currentRank);
    var peak = getRankValue(player.peakRank);
    var isValid = current > 0 || peak > 0;
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
function writeTeamsToSheet(sheet, teamsAndSubs, TIME_SLOTS) {
  sheet.clear();
  var rowIndex = 0;

  // Create column writer for flexible column handling
  var writer = createColumnWriter(sheet);

  // Check if we have time slot-based teams or single group teams
  var hasTimeSlots = teamsAndSubs.teams.some(function (team) {
    return team.timeSlot !== "All Players";
  });
  if (!hasTimeSlots) {
    // Single group - no time slot headers
    Logger.log("Writing teams without time slot headers");
    teamsAndSubs.teams.forEach(function (team, teamIndex) {
      var teamColor = STYLING.colors.team[teamIndex % STYLING.colors.team.length];
      var sortedPlayers = team.players.sort(function (a, b) {
        return b.averageRank - a.averageRank;
      });

      // Write team header (merged, leaving space for total)
      writer.writeMergedHeader(rowIndex + 1, team.name, {
        backgroundColor: teamColor,
        textColor: STYLING.colors.text.black,
        fontSize: STYLING.fontSize.teamHeader,
        mergeAll: false // Don't merge the last column (for total)
      });

      // Add Team Total in the last column
      var totalCell = sheet.getRange(rowIndex + 1, writer.getTotalColumns());
      totalCell.setFontWeight("bold").setBackground(teamColor).setFontColor(STYLING.colors.text.black).setFontSize(STYLING.fontSize.teamHeader).setHorizontalAlignment("right");

      // Add formula for team total
      var startRow = rowIndex + 3;
      var endRow = startRow + TEAM_SIZE - 1;
      var avgRankCol = writer.getColumnIndex('averageRank');
      var totalFormula = "SUM(".concat(String.fromCharCode(64 + avgRankCol)).concat(startRow, ":").concat(String.fromCharCode(64 + avgRankCol)).concat(endRow, ")");
      totalCell.setFormula("=\"Total: \" & TEXT(".concat(totalFormula, ", \"0.0\")"));
      rowIndex++;

      // Write player headers
      writer.writeHeaders(rowIndex + 1, {
        backgroundColor: teamColor,
        textColor: STYLING.colors.text.black,
        fontSize: STYLING.fontSize.teamHeader
      });
      rowIndex++;

      // Write player data
      sortedPlayers.forEach(function (player) {
        writer.writePlayerRow(rowIndex + 1, player, {
          backgroundColor: teamColor,
          textColor: STYLING.colors.text.black,
          fontSize: STYLING.fontSize.player
        });

        // Apply conditional formatting to rank columns
        var currentRankCol = writer.getColumnIndex('currentRank');
        writer.getColumnIndex('peakRank');
        var rankRange = sheet.getRange(rowIndex + 1, currentRankCol, 1, 2);
        setConditionalFormatting(rankRange);
        rowIndex++;
      });
      rowIndex++; // Add an empty row between teams
    });

    // Write substitutes if any
    var substitutes = teamsAndSubs.substitutes["All Players"];
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
      substitutes.forEach(function (sub) {
        writer.writePlayerRow(rowIndex + 1, sub, {
          backgroundColor: STYLING.colors.substitute,
          textColor: STYLING.colors.text.black,
          fontSize: STYLING.fontSize.player
        });

        // Apply conditional formatting to rank columns
        var currentRankCol = writer.getColumnIndex('currentRank');
        writer.getColumnIndex('peakRank');
        var rankRange = sheet.getRange(rowIndex + 1, currentRankCol, 1, 2);
        setConditionalFormatting(rankRange);
        rowIndex++;
      });
    }
  } else {
    // Time slot-based teams - use existing logic
    TIME_SLOTS.forEach(function (timeSlot, slotIndex) {
      // Write time slot header
      writer.writeMergedHeader(rowIndex + 1, timeSlot, {
        backgroundColor: STYLING.colors.header,
        textColor: STYLING.colors.text.white,
        fontSize: STYLING.fontSize.timeslot
      });
      rowIndex++;
      var timeSlotTeams = teamsAndSubs.teams.filter(function (team) {
        return team.timeSlot === timeSlot;
      });
      timeSlotTeams.forEach(function (team, teamIndex) {
        var teamColor = STYLING.colors.team[(slotIndex * 4 + teamIndex) % STYLING.colors.team.length];
        var sortedPlayers = team.players.sort(function (a, b) {
          return b.averageRank - a.averageRank;
        });

        // Write team header (merged, leaving space for total)
        writer.writeMergedHeader(rowIndex + 1, team.name, {
          backgroundColor: teamColor,
          textColor: STYLING.colors.text.black,
          fontSize: STYLING.fontSize.teamHeader,
          mergeAll: false // Don't merge the last column (for total)
        });

        // Add Team Total in the last column
        var totalCell = sheet.getRange(rowIndex + 1, writer.getTotalColumns());
        totalCell.setFontWeight("bold").setBackground(teamColor).setFontColor(STYLING.colors.text.black).setFontSize(STYLING.fontSize.teamHeader).setHorizontalAlignment("right");

        // Add formula for team total
        var startRow = rowIndex + 3;
        var endRow = startRow + TEAM_SIZE - 1;
        var avgRankCol = writer.getColumnIndex('averageRank');
        var totalFormula = "SUM(".concat(String.fromCharCode(64 + avgRankCol)).concat(startRow, ":").concat(String.fromCharCode(64 + avgRankCol)).concat(endRow, ")");
        totalCell.setFormula("=\"Total: \" & TEXT(".concat(totalFormula, ", \"0.0\")"));
        rowIndex++;

        // Write player headers
        writer.writeHeaders(rowIndex + 1, {
          backgroundColor: teamColor,
          textColor: STYLING.colors.text.black,
          fontSize: STYLING.fontSize.teamHeader
        });
        rowIndex++;

        // Write player data
        sortedPlayers.forEach(function (player) {
          writer.writePlayerRow(rowIndex + 1, player, {
            backgroundColor: teamColor,
            textColor: STYLING.colors.text.black,
            fontSize: STYLING.fontSize.player
          });

          // Apply conditional formatting to rank columns
          var currentRankCol = writer.getColumnIndex('currentRank');
          writer.getColumnIndex('peakRank');
          var rankRange = sheet.getRange(rowIndex + 1, currentRankCol, 1, 2);
          setConditionalFormatting(rankRange);
          rowIndex++;
        });
        rowIndex++; // Add an empty row between teams
      });

      // Write substitutes for this time slot
      var substitutes = teamsAndSubs.substitutes[timeSlot];
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
        substitutes.forEach(function (sub) {
          writer.writePlayerRow(rowIndex + 1, sub, {
            backgroundColor: STYLING.colors.substitute,
            textColor: STYLING.colors.text.black,
            fontSize: STYLING.fontSize.player
          });

          // Apply conditional formatting to rank columns
          var currentRankCol = writer.getColumnIndex('currentRank');
          writer.getColumnIndex('peakRank');
          var rankRange = sheet.getRange(rowIndex + 1, currentRankCol, 1, 2);
          setConditionalFormatting(rankRange);
          rowIndex++;
        });
        rowIndex++; // Add an empty row after substitutes
      }
    });
  }

  // Set column widths and auto-resize
  writer.setColumnWidths();
  // After all data/formatting is done, autofit only the data columns
  writer.autoResizeColumns();
  writer.autoResizeRows();
}

function _toConsumableArray$2(r) { return _arrayWithoutHoles$2(r) || _iterableToArray$2(r) || _unsupportedIterableToArray$2(r) || _nonIterableSpread$2(); }
function _nonIterableSpread$2() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray$2(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray$2(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$2(r, a) : void 0; } }
function _iterableToArray$2(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles$2(r) { if (Array.isArray(r)) return _arrayLikeToArray$2(r); }
function _arrayLikeToArray$2(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function applyLatestColumnConfig() {
  var configData = PropertiesService.getScriptProperties().getProperty('COLUMN_CONFIG');
  if (configData) {
    var configs = JSON.parse(configData);
    OUTPUT_SHEET_CONFIG.columns = configs.map(function (config) {
      return {
        key: config.key,
        width: config.width,
        title: config.title,
        type: config.type
      };
    });
  }
}
function getTimeSlotsFromConfig() {
  var configData = PropertiesService.getScriptProperties().getProperty('COLUMN_CONFIG');
  if (configData) {
    var configs = JSON.parse(configData);
    var timeSlotsConfig = configs.find(function (c) {
      return c.key === 'timeSlots';
    });
    if (timeSlotsConfig && timeSlotsConfig.sourceColumn) {
      // Extract time slots from the source column
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var playersSheet = ss.getSheets()[0];
      var columnIndex = timeSlotsConfig.sourceColumn.charCodeAt(0) - 65; // Convert A=0, B=1, etc.

      if (playersSheet.getLastRow() > 1) {
        var timeSlotsRange = playersSheet.getRange(2, columnIndex + 1, playersSheet.getLastRow() - 1, 1);
        var timeSlotValues = timeSlotsRange.getValues().flat().filter(Boolean);

        // Split any combined time slots and get unique values
        var splitTimeSlots = timeSlotValues.flatMap(function (slot) {
          return slot.toString().split(',').map(function (s) {
            return s.trim();
          }).filter(function (s) {
            return s !== '';
          });
        });
        var uniqueTimeSlots = _toConsumableArray$2(new Set(splitTimeSlots));
        Logger.log("Extracted time slots from config: ".concat(uniqueTimeSlots.join(', ')));
        return uniqueTimeSlots;
      }
    }
  }
  return [];
}
function sortPlayersIntoBalancedTeams() {
  applyLatestColumnConfig();
  Logger.log("sortPlayersIntoBalancedTeams function started");

  // Get time slots from config instead of global TIME_SLOTS
  var TIME_SLOTS = getTimeSlotsFromConfig();
  getGameDay(); // Refresh GAME_DAY at the start of the function

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
    var teamsAndSubs = createOptimalTeams(allPlayers, TIME_SLOTS);
    Logger.log("Teams and substitutes created: " + JSON.stringify(teamsAndSubs));
    writeTeamsToSheet(teamsSheet, teamsAndSubs, TIME_SLOTS);
    Logger.log("Teams written to sheet");
  } catch (e) {
    Logger.log("Error: ".concat(e.message));
    throw e;
  }
  Logger.log("sortPlayersIntoBalancedTeams function completed");
}

/***** TEAM BALANCING LOGIC FUNCTIONS *****/
function createOptimalTeams(players, timeSlots) {
  var result = {
    teams: [],
    substitutes: {}
  };
  var globalAssignedPlayers = new Set(); // Track players assigned across all time slots
  var tempAssignedPlayers = new Set(); // Track temporary assignments for current slot

  // Check if we have time slots from config
  if (!timeSlots || timeSlots.length === 0) {
    Logger.log("No time slots configured - balancing all players as one group");
    // Balance all players as one group
    var slotResult = createOptimalTeamsForTimeSlot(players, "All Players", tempAssignedPlayers);
    result.teams = slotResult.teams;
    result.substitutes = {
      "All Players": slotResult.substitutes
    };
    return result;
  }
  Logger.log("Processing ".concat(timeSlots.length, " time slots from config: ").concat(timeSlots.join(', ')));

  // Process each time slot from config
  timeSlots.forEach(function (timeSlot) {
    Logger.log("\nProcessing time slot: ".concat(timeSlot));
    var timeSlotPlayers = [];

    // First, add unassigned players who can play in this time slot
    var unassignedPlayers = players.filter(function (p) {
      if (!p.timeSlots || !p.timeSlots.toString().trim()) return false;
      if (globalAssignedPlayers.has(p.discordUsername)) return false;

      // Split time slots by comma and check if any match
      var playerTimeSlots = p.timeSlots.toString().split(',').map(function (s) {
        return s.trim();
      });
      var hasTimeSlot = playerTimeSlots.some(function (slot) {
        return slot.toLowerCase() === timeSlot.toLowerCase();
      });
      return hasTimeSlot;
    });
    Logger.log("Found ".concat(unassignedPlayers.length, " unassigned players for ").concat(timeSlot, ": ").concat(unassignedPlayers.map(function (p) {
      return p.discordUsername;
    }).join(', ')));

    // Add unassigned players first
    unassignedPlayers.forEach(function (player) {
      timeSlotPlayers.push(player);
      Logger.log("Added unassigned player: ".concat(player.discordUsername, " (Rank: ").concat(player.currentRank, ")"));
    });

    // Only if we don't have enough players for teams, add players who have already played
    if (timeSlotPlayers.length < TEAM_SIZE * 2) {
      Logger.log("Not enough unassigned players (".concat(timeSlotPlayers.length, "), looking for multi-game players..."));

      // Add players who have already played but can play multiple games
      players.forEach(function (player) {
        if (!player.timeSlots || !player.timeSlots.toString().trim()) return;
        if (!globalAssignedPlayers.has(player.discordUsername)) return;
        if (timeSlotPlayers.includes(player)) return;
        if (!player.multipleGames || player.multipleGames.toLowerCase() !== 'yes') return;

        // Split time slots by comma and check if any match
        var playerTimeSlots = player.timeSlots.toString().split(',').map(function (s) {
          return s.trim();
        });
        var hasTimeSlot = playerTimeSlots.some(function (slot) {
          return slot.toLowerCase() === timeSlot.toLowerCase();
        });
        if (hasTimeSlot) {
          timeSlotPlayers.push(player);
          Logger.log("Added multi-game player: ".concat(player.discordUsername, " (Rank: ").concat(player.currentRank, ", multipleGames: ").concat(player.multipleGames, ")"));
        }
      });
      Logger.log("After adding multi-game players: ".concat(timeSlotPlayers.length, " total players"));
    }

    // Create teams for this time slot
    var slotResult = createOptimalTeamsForTimeSlot(timeSlotPlayers, timeSlot, tempAssignedPlayers);

    // Update global assignments
    slotResult.teams.forEach(function (team) {
      team.players.forEach(function (player) {
        globalAssignedPlayers.add(player.discordUsername);
        tempAssignedPlayers.add(player.discordUsername);
      });
    });

    // Add players as substitutes if they've already played in a team OR are willing to sub
    result.substitutes[timeSlot] = slotResult.substitutes.filter(function (sub) {
      return globalAssignedPlayers.has(sub.discordUsername) || sub.willSub && sub.willSub.toLowerCase() === 'yes';
    });
    result.teams = result.teams.concat(slotResult.teams);
    Logger.log("\nCreated ".concat(slotResult.teams.length, " teams for time slot: ").concat(timeSlot));
    Logger.log("Substitutes for time slot ".concat(timeSlot, ": ").concat(result.substitutes[timeSlot].length));
    Logger.log("Current global assigned players: ".concat(Array.from(globalAssignedPlayers).join(', ')));
  });

  // After processing all time slots, mark players as permanently assigned if they don't want to play multiple games
  result.teams.forEach(function (team) {
    team.players.forEach(function (player) {
      if (!player.multipleGames || player.multipleGames.toLowerCase() !== 'yes') {
        globalAssignedPlayers.add(player.discordUsername);
        Logger.log("Marked as permanently assigned (no multiple games): ".concat(player.discordUsername, " (multipleGames: ").concat(player.multipleGames, ")"));
      } else {
        Logger.log("Player can play multiple games: ".concat(player.discordUsername, " (multipleGames: ").concat(player.multipleGames, ")"));
      }
    });
  });
  return result;
}
function createOptimalTeamsForTimeSlot(players, timeSlot, assignedPlayers) {
  var numPlayers = players.length;
  // Calculate the max number of full teams (must be even, each with TEAM_SIZE players)
  var maxFullTeams = Math.floor(numPlayers / TEAM_SIZE);
  if (maxFullTeams % 2 !== 0) maxFullTeams -= 1; // ensure even
  Logger.log("\nCreating teams for ".concat(timeSlot, ":"));
  Logger.log("Total players: ".concat(numPlayers));
  Logger.log("Maximum possible full teams: ".concat(maxFullTeams));

  // If we don't have enough players for at least 2 teams of TEAM_SIZE, return empty result
  if (maxFullTeams < 2) {
    Logger.log("Not enough players for 2 teams (need ".concat(TEAM_SIZE * 2, " players, have ").concat(numPlayers, ")"));
    return {
      teams: [],
      substitutes: players.filter(function (p) {
        return p.willSub && p.willSub.toLowerCase() === 'yes';
      }),
      assignedPlayers: new Set()
    };
  }
  var numTeams = maxFullTeams;
  Logger.log("Creating ".concat(numTeams, " teams"));
  var teams = [];

  // Initialize empty teams
  for (var i = 0; i < numTeams; i++) {
    teams.push({
      name: "Team ".concat(i + 1),
      timeSlot: timeSlot,
      players: [],
      total: 0
    });
  }

  // Separate players into unassigned and previously assigned groups
  var unassignedPlayers = players.filter(function (p) {
    return !assignedPlayers.has(p.discordUsername);
  });
  var previouslyAssignedPlayers = players.filter(function (p) {
    return assignedPlayers.has(p.discordUsername);
  });
  Logger.log("\nUnassigned players: ".concat(unassignedPlayers.map(function (p) {
    return p.discordUsername;
  }).join(', ')));
  Logger.log("Previously assigned players: ".concat(previouslyAssignedPlayers.map(function (p) {
    return p.discordUsername;
  }).join(', ')));

  // First, distribute unassigned players to ensure everyone plays
  var allTeamPlayers = [].concat(_toConsumableArray$2(unassignedPlayers), _toConsumableArray$2(previouslyAssignedPlayers)).slice(0, numTeams * TEAM_SIZE);
  Logger.log("\nDistributing ".concat(allTeamPlayers.length, " players to teams"));
  for (var _i = 0; _i < allTeamPlayers.length; _i++) {
    var round = Math.floor(_i / numTeams);
    var position = _i % numTeams;
    var teamIndex = round % 2 === 0 ? position : numTeams - 1 - position;
    teams[teamIndex].players.push(allTeamPlayers[_i]);
    teams[teamIndex].total += Math.sqrt(allTeamPlayers[_i].averageRank); // Use square root for balancing
    Logger.log("Added ".concat(allTeamPlayers[_i].discordUsername, " to Team ").concat(teamIndex + 1));
  }

  // Verify all teams have exactly TEAM_SIZE players
  teams = teams.filter(function (team) {
    return team.players.length === TEAM_SIZE;
  });
  Logger.log("\nTeams after filtering for complete teams: ".concat(teams.length));

  // If we don't have at least 2 teams after filtering, return empty result
  if (teams.length < 2) {
    Logger.log("Not enough complete teams after filtering (have ".concat(teams.length, ", need 2)"));
    return {
      teams: [],
      substitutes: players.filter(function (p) {
        return p.willSub && p.willSub.toLowerCase() === 'yes';
      }),
      assignedPlayers: new Set()
    };
  }

  // Remaining players become substitutes
  var assignedPlayerNames = teams.flatMap(function (team) {
    return team.players.map(function (p) {
      return p.discordUsername;
    });
  });
  var substitutes = players.filter(function (p) {
    return !assignedPlayerNames.includes(p.discordUsername);
  });

  // Optimize team balance
  var targetTotal = teams.reduce(function (sum, team) {
    return sum + team.total;
  }, 0) / teams.length;
  Logger.log("\nOptimizing team balance (target total: ".concat(targetTotal.toFixed(2), ")"));
  for (var iteration = 0; iteration < 100; iteration++) {
    var improved = false;
    for (var _i2 = 0; _i2 < teams.length; _i2++) {
      for (var j = _i2 + 1; j < teams.length; j++) {
        if (trySwapPlayers(teams[_i2], teams[j])) {
          improved = true;
        }
      }
    }
    if (!improved) break;
  }

  // Calculate final team spread for logging
  var teamSpread = getTeamSpread(teams);
  Logger.log("\nFinal team spread for ".concat(timeSlot, ": ").concat(teamSpread.toFixed(2)));
  teams.forEach(function (team, index) {
    Logger.log("Team ".concat(index + 1, " total: ").concat(team.total.toFixed(2)));
    Logger.log("Team ".concat(index + 1, " players: ").concat(team.players.map(function (p) {
      return p.discordUsername;
    }).join(', ')));
  });
  return {
    teams: teams,
    substitutes: substitutes,
    assignedPlayers: new Set([].concat(_toConsumableArray$2(assignedPlayers), _toConsumableArray$2(teams.flatMap(function (team) {
      return team.players.map(function (p) {
        return p.discordUsername;
      });
    }))))
  };
}
function trySwapPlayers(team1, team2) {
  for (var i = 0; i < team1.players.length; i++) {
    for (var j = 0; j < team2.players.length; j++) {
      var player1 = team1.players[i];
      var player2 = team2.players[j];

      // Skip if either player doesn't want to play multiple games
      if (player1.multipleGames && player1.multipleGames.toLowerCase() !== 'yes') {
        continue;
      }
      if (player2.multipleGames && player2.multipleGames.toLowerCase() !== 'yes') {
        continue;
      }

      // Calculate new totals if we swap these players
      var newTotal1 = team1.total - Math.sqrt(player1.averageRank) + Math.sqrt(player2.averageRank);
      var newTotal2 = team2.total - Math.sqrt(player2.averageRank) + Math.sqrt(player1.averageRank);

      // Check if this swap improves balance
      var currentDiff = Math.abs(team1.total - team2.total);
      var newDiff = Math.abs(newTotal1 - newTotal2);
      if (newDiff < currentDiff) {
        // Perform the swap
        var temp = team1.players[i];
        team1.players[i] = team2.players[j];
        team2.players[j] = temp;
        team1.total = newTotal1;
        team2.total = newTotal2;
        Logger.log("Swapped ".concat(player1.discordUsername, " and ").concat(player2.discordUsername, " between teams"));
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
  return Math.max.apply(Math, _toConsumableArray$2(totals)) - Math.min.apply(Math, _toConsumableArray$2(totals));
}

function _toConsumableArray$1(r) { return _arrayWithoutHoles$1(r) || _iterableToArray$1(r) || _unsupportedIterableToArray$1(r) || _nonIterableSpread$1(); }
function _nonIterableSpread$1() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray$1(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray$1(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$1(r, a) : void 0; } }
function _iterableToArray$1(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles$1(r) { if (Array.isArray(r)) return _arrayLikeToArray$1(r); }
function _arrayLikeToArray$1(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function getColumnConfig() {
  var configData = PropertiesService.getScriptProperties().getProperty('COLUMN_CONFIG');
  if (configData) {
    return JSON.parse(configData);
  }
  return [];
}
function findDiscordColumn(teamsSheet) {
  var config = getColumnConfig();
  var discordConfig = config.find(function (c) {
    return c.key === 'discordUsername';
  });
  if (!discordConfig) {
    throw new Error('discordUsername column not configured. Please add it to your column configuration.');
  }

  // Check first, second, and third rows for headers (time slots can push headers to row 2 or 3)
  var firstRow = teamsSheet.getRange(1, 1, 1, teamsSheet.getLastColumn()).getValues()[0];
  var secondRow = teamsSheet.getRange(2, 1, 1, teamsSheet.getLastColumn()).getValues()[0];
  var thirdRow = teamsSheet.getRange(3, 1, 1, teamsSheet.getLastColumn()).getValues()[0];
  Logger.log("First row: ".concat(JSON.stringify(firstRow)));
  Logger.log("Second row: ".concat(JSON.stringify(secondRow)));
  Logger.log("Third row: ".concat(JSON.stringify(thirdRow)));
  Logger.log("Looking for Discord column with title: \"".concat(discordConfig.title, "\""));

  // Try to find the Discord column in any of the first three rows
  var rows = [firstRow, secondRow, thirdRow];
  for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    var headerRow = rows[rowIndex];
    Logger.log("Checking row ".concat(rowIndex + 1, " for Discord column..."));
    for (var i = 0; i < headerRow.length; i++) {
      var headerValue = headerRow[i] ? headerRow[i].toString().trim() : '';
      Logger.log("Column ".concat(i, ": \"").concat(headerValue, "\""));
      if (headerValue.toLowerCase() === discordConfig.title.toLowerCase()) {
        Logger.log("Found Discord column at index ".concat(i, " with title: ").concat(headerValue, " in row ").concat(rowIndex + 1));
        return i;
      }
    }
  }

  // If exact match not found, try partial matches in all three rows
  for (var _rowIndex = 0; _rowIndex < rows.length; _rowIndex++) {
    var _headerRow = rows[_rowIndex];
    Logger.log("Checking row ".concat(_rowIndex + 1, " for partial Discord matches..."));
    for (var _i = 0; _i < _headerRow.length; _i++) {
      var _headerValue = _headerRow[_i] ? _headerRow[_i].toString().trim() : '';
      if (_headerValue.toLowerCase().includes('discord') || _headerValue.toLowerCase().includes('username')) {
        Logger.log("Found potential Discord column at index ".concat(_i, " with title: ").concat(_headerValue, " in row ").concat(_rowIndex + 1));
        return _i;
      }
    }
  }
  throw new Error("Discord column with title \"".concat(discordConfig.title, "\" not found in Teams sheet. Available headers in row 1: ").concat(firstRow.join(', '), ". Available headers in row 2: ").concat(secondRow.join(', '), ". Available headers in row 3: ").concat(thirdRow.join(', ')));
}
function generateDiscordPings() {
  Logger.log("Starting Discord Pings generation");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var teamsSheet = ss.getSheetByName("Teams");
  if (!teamsSheet) {
    throw new Error("Teams sheet not found. Please create teams first.");
  }
  var allData = teamsSheet.getDataRange().getValues();
  Logger.log("Total rows in Teams sheet: ".concat(allData.length));

  // Find the Discord column
  var discordColIndex = findDiscordColumn(teamsSheet);
  Logger.log("Discord column index: ".concat(discordColIndex));

  // Find the Lobby Host column if it exists
  var config = getColumnConfig();
  var lobbyHostConfig = config.find(function (c) {
    return c.key === 'lobbyHost';
  });
  var lobbyHostColIndex = null;
  if (lobbyHostConfig) {
    // Check first, second, and third rows for lobby host column
    var firstRow = teamsSheet.getRange(1, 1, 1, teamsSheet.getLastColumn()).getValues()[0];
    var secondRow = teamsSheet.getRange(2, 1, 1, teamsSheet.getLastColumn()).getValues()[0];
    var thirdRow = teamsSheet.getRange(3, 1, 1, teamsSheet.getLastColumn()).getValues()[0];
    for (var rowIndex = 0; rowIndex < 3; rowIndex++) {
      var headerRow = rowIndex === 0 ? firstRow : rowIndex === 1 ? secondRow : thirdRow;
      for (var i = 0; i < headerRow.length; i++) {
        var headerValue = headerRow[i] ? headerRow[i].toString().trim() : '';
        if (headerValue.toLowerCase() === lobbyHostConfig.title.toLowerCase()) {
          lobbyHostColIndex = i;
          Logger.log("Found Lobby Host column at index ".concat(i, " with title: ").concat(headerValue, " in row ").concat(rowIndex + 1));
          break;
        }
      }
      if (lobbyHostColIndex !== null) break;
    }
  }

  // Initialize variables
  var currentTimeSlot = null;
  var currentTeam = null;
  var teams = [];
  var substitutes = {};
  var currentSection = null; // Possible values: null, "team", "players", "substitutes", "substitutesPlayers"

  // Process each row in the Teams sheet
  var _loop = function _loop() {
      var row = allData[_i2];
      var firstCell = row[0] ? row[0].toString().trim() : '';
      Logger.log("Processing row ".concat(_i2 + 1, ": \"").concat(firstCell, "\""));

      // Detect Time Slot (look for time patterns and specific formats)
      var timePatterns = ['am', 'pm', 'pst', 'est', 'cst', 'mst', 'utc', 'gmt'];
      var hasTimePattern = timePatterns.some(function (pattern) {
        return firstCell.toLowerCase().includes(pattern);
      });

      // Time slots should contain time patterns AND be in a specific format (like "6pm PST/9pm EST")
      // Also check that it's not a team name or other content
      if (hasTimePattern && !firstCell.includes('Total') && !firstCell.startsWith('Team') && !firstCell.startsWith('Discord') && !firstCell.startsWith('Substitutes') && (firstCell.includes('/') || firstCell.includes(' ')) && firstCell.length > 5) {
        // Time slots are typically longer than team names
        currentTimeSlot = firstCell;
        currentSection = "timeSlot";
        if (!substitutes[currentTimeSlot]) {
          substitutes[currentTimeSlot] = [];
        }
        Logger.log("Detected Time Slot: \"".concat(currentTimeSlot, "\""));
        return 0; // continue
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
        Logger.log("Detected Team: \"".concat(currentTeam.name, "\" under Time Slot: \"").concat(currentTimeSlot, "\""));
        return 0; // continue
      }

      // Detect "Discord" header indicating the start of Players section for a Team
      if (firstCell === "Discord" && currentSection === "team") {
        currentSection = "players";
        Logger.log("Detected Players section under Team: \"".concat(currentTeam.name, "\""));
        return 0; // continue
      }

      // Detect "Substitutes" header
      if (firstCell === "Substitutes") {
        currentTeam = null;
        currentSection = "substitutes";
        Logger.log("Detected Substitutes section under Time Slot: \"".concat(currentTimeSlot, "\""));
        return 0; // continue
      }

      // Detect "Discord" header indicating the start of Players section for Substitutes
      if (firstCell === "Discord" && currentSection === "substitutes") {
        currentSection = "substitutesPlayers";
        Logger.log("Detected Players section under Substitutes for Time Slot: \"".concat(currentTimeSlot, "\""));
        return 0; // continue
      }

      // Process Player Rows for Teams
      if (currentSection === "players" && firstCell !== "") {
        // Since Discord column is at index 0, the first cell contains the Discord username
        var discordValue = firstCell;
        var lobbyHostValue = lobbyHostColIndex !== null ? row[lobbyHostColIndex] : null;
        if (discordValue && discordValue !== 'Discord') {
          var player = {
            discordUsername: discordValue.toString().replace(/^@/, '').trim(),
            riotID: row[1] ? row[1].toString().trim() : "",
            lobbyHost: lobbyHostValue ? lobbyHostValue.toString().trim().toLowerCase() === "yes" : false
          };
          currentTeam.players.push(player);
          Logger.log("Added Player to Team \"".concat(currentTeam.name, "\": \"@").concat(player.discordUsername, "\" (Lobby Host: ").concat(player.lobbyHost, ")"));
        }
        return 0; // continue
      }

      // Process Player Rows for Substitutes
      if (currentSection === "substitutesPlayers" && firstCell !== "") {
        // Since Discord column is at index 0, the first cell contains the Discord username
        var _discordValue = firstCell;
        var _lobbyHostValue = lobbyHostColIndex !== null ? row[lobbyHostColIndex] : null;
        if (_discordValue && _discordValue !== 'Discord') {
          var substitute = {
            discordUsername: _discordValue.toString().replace(/^@/, '').trim(),
            riotID: row[1] ? row[1].toString().trim() : "",
            lobbyHost: _lobbyHostValue ? _lobbyHostValue.toString().trim().toLowerCase() === "yes" : false
          };
          // Handle no timeslot scenario by using a default key
          var timeSlotKey = currentTimeSlot || "";
          if (!substitutes[timeSlotKey]) {
            substitutes[timeSlotKey] = [];
          }
          substitutes[timeSlotKey].push(substitute);
          Logger.log("Added Substitute to Time Slot \"".concat(timeSlotKey, "\": \"@").concat(substitute.discordUsername, "\" (Lobby Host: ").concat(substitute.lobbyHost, ")"));
        }
        return 0; // continue
      }

      // Reset section if encountering an empty row
      if (firstCell === "") {
        currentSection = null;
        Logger.log("Encountered empty row. Resetting current section.");
        return 0; // continue
      }
    },
    _ret;
  for (var _i2 = 0; _i2 < allData.length; _i2++) {
    _ret = _loop();
    if (_ret === 0) continue;
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
  var timeSlots = _toConsumableArray$1(new Set(teams.map(function (team) {
    return team.timeSlot;
  })));
  Logger.log("Unique Time Slots: ".concat(timeSlots.join(", ")));
  timeSlots.forEach(function (timeSlot) {
    var timeSlotTeams = teams.filter(function (team) {
      return team.timeSlot === timeSlot;
    });
    var timeSlotSubstitutes = substitutes[timeSlot] || [];
    if (timeSlotTeams.length > 0 || timeSlotSubstitutes.length > 0) {
      // Only add time slot header if it's not empty
      if (timeSlot && timeSlot !== "") {
        contentArray.push("## ".concat(timeSlot, " Timeslot"));
        Logger.log("Added Time Slot Header: \"".concat(timeSlot, " Timeslot\""));
      }

      // Group teams into pairs (e.g., Team 1 & Team 2)
      for (var _i3 = 0; _i3 < timeSlotTeams.length; _i3 += 2) {
        var pair = timeSlotTeams.slice(_i3, _i3 + 2);
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
          // Remove blank line after each team
          Logger.log("Added team \"".concat(team.name, "\" without blank line"));
        });
      }

      // Add substitutes section if there are any
      if (timeSlotSubstitutes.length > 0) {
        contentArray.push("### Substitutes");
        Logger.log("Added Substitutes Header for Time Slot: \"".concat(timeSlot || 'No Time Slot', "\""));
        timeSlotSubstitutes.forEach(function (sub) {
          contentArray.push("@".concat(sub.discordUsername));
          Logger.log("Added Substitute Mention: \"@".concat(sub.discordUsername, "\""));
        });
        contentArray.push(''); // Blank line after substitutes
        Logger.log("Added blank line after Substitutes for Time Slot: \"".concat(timeSlot || 'No Time Slot', "\""));
      }

      // Add separator
      contentArray.push(''); // Blank line after separator
      Logger.log("Added separator for Time Slot: \"".concat(timeSlot || 'No Time Slot', "\""));
    }
  });

  // Join all text for potential direct usage (e.g., sending via API)
  var discordPingText = contentArray.join('\n');
  Logger.log("Generated Discord Ping Text:\n".concat(discordPingText));

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
  var range = sheet.getRange(1, DISCORD_PINGS_CONFIG.column, numRows, 1);
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
    var cell = range.getCell(i + 1, DISCORD_PINGS_CONFIG.column);
    var content = lines[i].trim();
    Logger.log("Formatting row ".concat(i + 1, ": \"").concat(content, "\""));
    if (content.startsWith("# ")) {
      // Title Header: Darker Blue
      cell.setFontWeight("bold").setFontSize(STYLING.fontSize.title).setBackground(STYLING.colors.discord.title).setFontColor(STYLING.colors.text.white);
      Logger.log("Formatted Title: \"".concat(content, "\""));
    } else if (content.startsWith("## ") && content.endsWith("Timeslot")) {
      // Timeslot Headers: Original Blue
      cell.setFontWeight("bold").setFontSize(STYLING.fontSize.timeslot).setBackground(STYLING.colors.discord.timeslot).setFontColor(STYLING.colors.text.white);
      Logger.log("Formatted Timeslot Header: \"".concat(content, "\""));
    } else if (content.startsWith("### Lobby Host")) {
      // Lobby Host Headers: Same as Team Headers (Light Blue)
      cell.setFontWeight("bold").setFontSize(STYLING.fontSize.teamHeader).setBackground(STYLING.colors.discord.lobbyHost).setFontColor(STYLING.colors.text.black);
      Logger.log("Formatted Lobby Host Header: \"".concat(content, "\""));
    } else if (content.startsWith("### Team")) {
      // Team Headers: Light Blue
      cell.setFontWeight("bold").setFontSize(STYLING.fontSize.teamHeader).setBackground(STYLING.colors.discord.lobbyHost).setFontColor(STYLING.colors.text.black);
      Logger.log("Formatted Team Header: \"".concat(content, "\""));
    } else if (content.startsWith("### Substitutes")) {
      // Substitutes Header: Different Shade of Blue
      cell.setFontWeight("bold").setFontSize(STYLING.fontSize.teamHeader).setBackground(STYLING.colors.discord.substitutes).setFontColor(STYLING.colors.text.black);
      Logger.log("Formatted Substitutes Header: \"".concat(content, "\""));
    } else if (content.startsWith("@")) {
      // Player Names: Indented
      cell.setFontSize(STYLING.fontSize.player).setFontColor(STYLING.colors.text.black);
      Logger.log("Formatted Player Mention: \"".concat(content, "\""));
    } else if (content === "") {
      // Empty Lines: Clear Content and Remove Background
      cell.setValue("").setBackground(null);
      Logger.log("Cleared empty row ".concat(i + 1));
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

function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }

/**
 * Column Configuration Manager
 * Allows users to configure column display order, titles, and types
 */

/**
 * Opens the Column Configuration sheet for editing
 */
function openColumnConfigurationSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName('Column Configuration');
  if (!configSheet) {
    configSheet = ss.insertSheet('Column Configuration');
  }

  // Clear existing content
  configSheet.clear();

  // Get actual column headers from Form Responses sheet
  var formSheet = ss.getSheetByName('Form Responses 1');
  if (formSheet) {
    var headers = formSheet.getRange(1, 1, 1, formSheet.getLastColumn()).getValues()[0];
    headers.map(function (header, index) {
      return {
        column: String.fromCharCode(65 + index),
        // A, B, C, etc.
        index: index + 1,
        header: header || "Column ".concat(index + 1)
      };
    });
  }

  // Create configuration table
  var configData = [['Column Key', 'Title', 'Width', 'Type', 'Display', 'Source Column', 'Description']];

  // Add existing configuration
  OUTPUT_SHEET_CONFIG.columns.forEach(function (col, index) {
    var sourceCol = getSourceColumnForKey(col.key);
    configData.push([col.key, col.title, col.width, col.type, 'TRUE',
    // Default to display
    sourceCol, getDescriptionForKey(col.key)]);
  });

  // Add all available keys (not just display columns)
  var allKeys = [{
    key: 'riotID',
    title: 'Riot ID',
    width: 'auto',
    type: 'data',
    display: 'TRUE',
    source: 'C',
    desc: 'Player\'s Riot ID (from Column C)'
  }, {
    key: 'discordUsername',
    title: 'Discord',
    width: 'auto',
    type: 'data',
    display: 'TRUE',
    source: 'B',
    desc: 'Player\'s Discord username (from Column B)'
  }, {
    key: 'currentRank',
    title: 'Current Rank',
    width: 'auto',
    type: 'data',
    display: 'TRUE',
    source: 'J',
    desc: 'Player\'s current rank (from Column J)'
  }, {
    key: 'peakRank',
    title: 'Peak Rank',
    width: 'auto',
    type: 'data',
    display: 'TRUE',
    source: 'K',
    desc: 'Player\'s peak rank (from Column K)'
  }, {
    key: 'lobbyHost',
    title: 'Lobby Host',
    width: 'auto',
    type: 'data',
    display: 'TRUE',
    source: 'H',
    desc: 'Whether player is lobby host (from Column H)'
  }, {
    key: 'averageRank',
    title: 'Avg Rank',
    width: 'auto',
    type: 'calculated',
    display: 'TRUE',
    source: 'N/A',
    desc: 'Calculated: (currentRank + peakRank) / 2 (requires currentRank and peakRank)'
  }, {
    key: 'timeSlots',
    title: 'Time Slots',
    width: 'auto',
    type: 'data',
    display: 'FALSE',
    source: 'E',
    desc: 'Player\'s preferred time slots (from Column E)'
  }, {
    key: 'pronouns',
    title: 'Pronouns',
    width: 'auto',
    type: 'data',
    display: 'FALSE',
    source: 'D',
    desc: 'Player\'s pronouns (from Column D)'
  }, {
    key: 'multipleGames',
    title: 'Multiple Games',
    width: 'auto',
    type: 'data',
    display: 'FALSE',
    source: 'F',
    desc: 'Whether player wants multiple games (from Column F)'
  }, {
    key: 'willSub',
    title: 'Will Sub',
    width: 'auto',
    type: 'data',
    display: 'FALSE',
    source: 'G',
    desc: 'Whether player is willing to sub (from Column G)'
  }, {
    key: 'duo',
    title: 'Duo',
    width: 'auto',
    type: 'data',
    display: 'FALSE',
    source: 'I',
    desc: 'Player\'s duo partner (from Column I)'
  }, {
    key: 'comments',
    title: 'Comments',
    width: 'auto',
    type: 'data',
    display: 'FALSE',
    source: 'L',
    desc: 'Player comments (from Column L)'
  }, {
    key: 'preferredAgents',
    title: 'Preferred Agents',
    width: 'auto',
    type: 'display',
    display: 'FALSE',
    source: 'N/A',
    desc: 'Display only - for manual input'
  }, {
    key: 'notes',
    title: 'Notes',
    width: 'auto',
    type: 'display',
    display: 'FALSE',
    source: 'N/A',
    desc: 'Display only - for manual input'
  }, {
    key: 'role',
    title: 'Role',
    width: 'auto',
    type: 'display',
    display: 'FALSE',
    source: 'N/A',
    desc: 'Display only - for manual input'
  }, {
    key: 'availability',
    title: 'Availability',
    width: 'auto',
    type: 'display',
    display: 'FALSE',
    source: 'N/A',
    desc: 'Display only - for manual input'
  }];
  // Only add keys not already in configData
  allKeys.forEach(function (keyObj) {
    if (!configData.some(function (row) {
      return row[0] === keyObj.key;
    })) {
      configData.push([keyObj.key, keyObj.title, keyObj.width, keyObj.type, keyObj.display, keyObj.source, keyObj.desc]);
    }
  });

  // Write configuration table
  var range = configSheet.getRange(1, 1, configData.length, configData[0].length);
  range.setValues(configData);

  // Style header row
  var headerRange = configSheet.getRange(1, 1, 1, configData[0].length);
  headerRange.setBackground('#4A86E8').setFontColor('white').setFontWeight('bold');

  // Add data validation for Type column
  var typeRange = configSheet.getRange(2, 4, configData.length - 1, 1);
  var typeRule = SpreadsheetApp.newDataValidation().requireValueInList(['data', 'calculated', 'display'], true).setAllowInvalid(false).build();
  typeRange.setDataValidation(typeRule);

  // Add data validation for Display column
  var displayRange = configSheet.getRange(2, 5, configData.length - 1, 1);
  var displayRule = SpreadsheetApp.newDataValidation().requireValueInList(['TRUE', 'FALSE'], true).setAllowInvalid(false).build();
  displayRange.setDataValidation(displayRule);

  // Autofit config sheet after writing config table
  configSheet.autoResizeColumns(1, configData[0].length);

  // Write instructions well below the config table
  var instructions = [['Instructions:'], [''], ['• Use the Display column (TRUE/FALSE) to control which columns appear in the output.'], ['• All variables are available for logic, but only those with Display=TRUE are shown in the output.'], ['• If timeSlots is not displayed or is blank for all players, all players are balanced as one group and no time slot headers are shown.'], ['• To use Discord Pings, you must have the discordUsername column present and displayed in the output sheet.'], ['COLUMN TYPES:'], ['• data: Gets value from Form Responses sheet (e.g., riotID, discordUsername)'], ['• calculated: Computed value that depends on other columns (e.g., averageRank)'], ['• display: Empty column for manual input (e.g., preferredAgents, notes)'], [''], ['HOW TO CONFIGURE:'], ['1. Edit "Title" to change column headers'], ['2. Edit "Width" to "auto" for auto-resize, or enter pixel width (e.g., 150)'], ['3. Edit "Type" using dropdown: data/calculated/display'], ['4. Order is automatic - just move rows up/down to change position'], ['5. "Source Column" shows which Form Responses column provides data'], ['6. Use "Save & Apply Column Config" to apply changes'], ['7. Use "Reset Column Config" to restore defaults'], [''], ['SIMPLE REORDERING:'], ['• To move a column: Cut the row and paste it in the desired position'], ['• To add a column: Insert a new row and fill in the details'], ['• To remove a column: Delete the row'], ['• Order is determined by row position (top to bottom)'], [''], ['DATA SOURCES (Form Responses columns):'], ['• riotID → Column C (Riot ID)'], ['• discordUsername → Column B (Discord Username)'], ['• timeSlots → Column E (Time slots)'], ['• currentRank → Column J (Current Competitive Rank)'], ['• peakRank → Column K (Peak Competitive Rank)'], ['• lobbyHost → Column H (Lobby Host)'], ['• pronouns → Column D (Pronouns)'], ['• multipleGames → Column F (Multiple Games)'], ['• willSub → Column G (Substitute)'], ['• duo → Column I (Duo)'], ['• comments → Column L ((Optional) Comments)'], [''], ['CALCULATED COLUMNS:'], ['• averageRank: Requires currentRank and peakRank to be configured'], [''], ['EXAMPLES:'], ['• To add "Preferred Agents" column:'], ['  - Insert new row, Key: preferredAgents, Type: display'], ['• To move Discord to first: Cut Discord row, paste at top'], ['• To remove column: Delete the row'], ['• To auto-resize: Set Width to "auto"'], [''], ['IMPORTANT:'], ['• timeSlots column is required for team balancing'], ['• averageRank requires both currentRank and peakRank columns'], ['• Use "auto" width for automatic column sizing'], ['• Save after making changes to apply them'], ['AVAILABLE KEYS (add as needed):'], ['• riotID, discordUsername, currentRank, peakRank, lobbyHost, averageRank, timeSlots'], ['• pronouns, multipleGames, willSub, duo, comments, preferredAgents, notes, role, availability']];
  var instructionStartRow = configData.length + 3;
  var instructionRange = configSheet.getRange(instructionStartRow, 1, instructions.length, 1);
  instructionRange.setValues(instructions);

  // Freeze header row
  configSheet.setFrozenRows(1);
  SpreadsheetApp.getUi().alert('Column Configuration sheet opened! Edit the table above, then use "Save & Apply Column Config" to apply changes.');
}

/**
 * Gets the source column information for a given key
 */
function getSourceColumnForKey(key, sourceColumns) {
  var keyToColumnMap = {
    'riotID': 'C',
    // Column C - Riot ID
    'discordUsername': 'B',
    // Column B - Discord Username  
    'timeSlots': 'E',
    // Column E - Time slots
    'currentRank': 'J',
    // Column J - Current Competitive Rank
    'peakRank': 'K',
    // Column K - Peak Competitive Rank
    'lobbyHost': 'H',
    // Column H - Lobby Host
    'pronouns': 'D',
    // Column D - Pronouns
    'multipleGames': 'F',
    // Column F - Multiple Games
    'willSub': 'G',
    // Column G - Substitute
    'duo': 'I',
    // Column I - Duo
    'comments': 'L',
    // Column L - (Optional) Comments
    'averageRank': 'calculated' // This is calculated, not from source
  };
  var columnLetter = keyToColumnMap[key];
  if (!columnLetter || columnLetter === 'calculated') {
    return 'N/A';
  }
  return columnLetter; // Just return the letter
}

/**
 * Gets description for a column key
 */
function getDescriptionForKey(key) {
  var descriptions = {
    'riotID': 'Player\'s Riot ID (from Column C)',
    'discordUsername': 'Player\'s Discord username (from Column B)',
    'timeSlots': 'Player\'s preferred time slots (from Column E)',
    'currentRank': 'Player\'s current rank (from Column J)',
    'peakRank': 'Player\'s peak rank (from Column K)',
    'lobbyHost': 'Whether player is lobby host (from Column H)',
    'pronouns': 'Player\'s pronouns (from Column D)',
    'multipleGames': 'Whether player wants multiple games (from Column F)',
    'willSub': 'Whether player is willing to sub (from Column G)',
    'duo': 'Player\'s duo partner (from Column I)',
    'comments': 'Player comments (from Column L)',
    'averageRank': 'Calculated: (currentRank + peakRank) / 2 (requires currentRank and peakRank)',
    'preferredAgents': 'Display only - for manual input',
    'notes': 'Display only - for manual input',
    'role': 'Display only - for manual input',
    'availability': 'Display only - for manual input'
  };
  return descriptions[key] || 'Custom column';
}

/**
 * Save column configuration from the sheet
 */
function saveColumnConfiguration() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Column Configuration');
    if (!sheet) {
      SpreadsheetApp.getUi().alert('Error', 'Column Configuration sheet not found. Please open it first.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }

    // Get data from the sheet (skip header rows)
    var allData = sheet.getRange(3, 1, sheet.getLastRow() - 2, 6).getValues();
    // Only process rows until the first empty row in Column A
    var data = [];
    for (var i = 0; i < allData.length; i++) {
      if (!allData[i][0] || allData[i][0].toString().trim() === '') break;
      // Pad row to length 7
      var row = _toConsumableArray(allData[i]);
      while (row.length < 7) row.push('');
      data.push(row);
    }
    Logger.log('Saving config rows: ' + JSON.stringify(data));

    // Filter out empty rows and build configuration
    var configs = data.filter(function (row) {
      return row[0] && row[0].toString().trim();
    }).map(function (row, index) {
      return {
        key: (row[0] || '').toString().trim(),
        title: (row[1] || '').toString().trim() || (row[0] || '').toString().trim(),
        width: (row[2] || '').toString().trim() || 'auto',
        type: (row[3] || '').toString().trim() || 'data',
        display: (row[4] || '').toString().trim().toUpperCase() === 'TRUE',
        sourceColumn: (row[5] || '').toString().trim(),
        description: (row[6] || '').toString().trim()
      };
    });
    Logger.log('Parsed configs: ' + JSON.stringify(configs));

    // For output, only include columns with display=true
    var displayColumns = configs.filter(function (c) {
      return c.display;
    });
    Logger.log('Display columns: ' + JSON.stringify(displayColumns));
    updateOutputSheetConfig(displayColumns);
    // Save all configs for logic use
    PropertiesService.getScriptProperties().setProperty('COLUMN_CONFIG', JSON.stringify(configs));
    SpreadsheetApp.getUi().alert('Success', "Column configuration saved and applied successfully! ".concat(configs.length, " columns configured."), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    Logger.log("Error saving column configuration: ".concat(error.message));
    SpreadsheetApp.getUi().alert('Error', "Failed to save column configuration: ".concat(error.message), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Load column configuration from script properties
 */
function loadColumnConfiguration() {
  try {
    var configData = PropertiesService.getScriptProperties().getProperty('COLUMN_CONFIG');
    if (!configData) {
      SpreadsheetApp.getUi().alert('Info', 'No saved column configuration found. Use "Reset Column Config" to create defaults.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    var configs = JSON.parse(configData);
    updateOutputSheetConfig(configs);
    SpreadsheetApp.getUi().alert('Success', 'Column configuration loaded successfully!', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    Logger.log("Error loading column configuration: ".concat(error.message));
    SpreadsheetApp.getUi().alert('Error', "Failed to load column configuration: ".concat(error.message), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Reset column configuration to defaults
 */
function resetColumnConfiguration() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Column Configuration');
    if (!sheet) {
      sheet = ss.insertSheet('Column Configuration');
    }

    // Clear existing content
    sheet.clear();

    // Set up headers
    var headers = [['Column Key', 'Title', 'Width', 'Type', 'Display', 'Source Column', 'Description']];
    var headerRange = sheet.getRange(1, 1, 1, 7);
    headerRange.setValues(headers);
    headerRange.setBackground('#4A86E8').setFontColor('white').setFontWeight('bold');
    // Default configuration
    var defaultConfigs = [['riotID', 'Riot ID', 'auto', 'data', 'TRUE', 'C', 'Player\'s Riot ID (from Column C)'], ['discordUsername', 'Discord', 'auto', 'data', 'TRUE', 'B', 'Player\'s Discord username (from Column B)'], ['currentRank', 'Current Rank', 'auto', 'data', 'TRUE', 'J', 'Player\'s current rank (from Column J)'], ['peakRank', 'Peak Rank', 'auto', 'data', 'TRUE', 'K', 'Player\'s peak rank (from Column K)'], ['lobbyHost', 'Lobby Host', 'auto', 'data', 'TRUE', 'H', 'Whether player is lobby host (from Column H)'], ['averageRank', 'Avg Rank', 'auto', 'calculated', 'TRUE', 'N/A', 'Calculated: (currentRank + peakRank) / 2 (requires currentRank and peakRank)']];
    var dataRange = sheet.getRange(2, 1, defaultConfigs.length, 7);
    dataRange.setValues(defaultConfigs);
    // Add data validation for Type column
    var typeRange = sheet.getRange(2, 4, defaultConfigs.length, 1);
    var typeRule = SpreadsheetApp.newDataValidation().requireValueInList(['data', 'calculated', 'display'], true).setAllowInvalid(false).build();
    typeRange.setDataValidation(typeRule);
    // Add data validation for Display column
    var displayRange = sheet.getRange(2, 5, defaultConfigs.length, 1);
    var displayRule = SpreadsheetApp.newDataValidation().requireValueInList(['TRUE', 'FALSE'], true).setAllowInvalid(false).build();
    displayRange.setDataValidation(displayRule);
    // Autofit config sheet after writing config table
    sheet.autoResizeColumns(1, 7);
    // Write instructions well below the config table
    var instructions = [['Instructions:'], [''], ['• Use the Display column (TRUE/FALSE) to control which columns appear in the output.'], ['• All variables are available for logic, but only those with Display=TRUE are shown in the output.'], ['• If timeSlots is not displayed or is blank for all players, all players are balanced as one group and no time slot headers are shown.'], ['• To use Discord Pings, you must have the discordUsername column present and displayed in the output sheet.'], ['COLUMN TYPES:'], ['• data: Gets value from Form Responses sheet (e.g., riotID, discordUsername)'], ['• calculated: Computed value that depends on other columns (e.g., averageRank)'], ['• display: Empty column for manual input (e.g., preferredAgents, notes)'], [''], ['HOW TO CONFIGURE:'], ['1. Edit "Title" to change column headers'], ['2. Edit "Width" to "auto" for auto-resize, or enter pixel width (e.g., 150)'], ['3. Edit "Type" using dropdown: data/calculated/display'], ['4. Order is automatic - just move rows up/down to change position'], ['5. "Source Column" shows which Form Responses column provides data'], ['6. Use "Save & Apply Column Config" to apply changes'], ['7. Use "Reset Column Config" to restore defaults'], [''], ['SIMPLE REORDERING:'], ['• To move a column: Cut the row and paste it in the desired position'], ['• To add a column: Insert a new row and fill in the details'], ['• To remove a column: Delete the row'], ['• Order is determined by row position (top to bottom)'], [''], ['DATA SOURCES (Form Responses columns):'], ['• riotID → Column C (Riot ID)'], ['• discordUsername → Column B (Discord Username)'], ['• timeSlots → Column E (Time slots)'], ['• currentRank → Column J (Current Competitive Rank)'], ['• peakRank → Column K (Peak Competitive Rank)'], ['• lobbyHost → Column H (Lobby Host)'], ['• pronouns → Column D (Pronouns)'], ['• multipleGames → Column F (Multiple Games)'], ['• willSub → Column G (Substitute)'], ['• duo → Column I (Duo)'], ['• comments → Column L ((Optional) Comments)'], [''], ['CALCULATED COLUMNS:'], ['• averageRank: Requires currentRank and peakRank to be configured'], [''], ['EXAMPLES:'], ['• To add "Preferred Agents" column:'], ['  - Insert new row, Key: preferredAgents, Type: display'], ['• To move Discord to first: Cut Discord row, paste at top'], ['• To remove column: Delete the row'], ['• To auto-resize: Set Width to "auto"'], [''], ['IMPORTANT:'], ['• timeSlots column is required for team balancing'], ['• averageRank requires both currentRank and peakRank columns'], ['• Use "auto" width for automatic column sizing'], ['• Save after making changes to apply them'], ['AVAILABLE KEYS (add as needed):'], ['• riotID, discordUsername, currentRank, peakRank, lobbyHost, averageRank, timeSlots'], ['• pronouns, multipleGames, willSub, duo, comments, preferredAgents, notes, role, availability']];
    var instructionStartRow = defaultConfigs.length + 3;
    var instructionRange = sheet.getRange(instructionStartRow, 1, instructions.length, 1);
    instructionRange.setValues(instructions);
    // Freeze header row
    sheet.setFrozenRows(1);
    // Apply the configuration immediately
    saveColumnConfiguration();
    SpreadsheetApp.getUi().alert('Success', 'Column configuration has been reset to defaults and applied successfully!', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    Logger.log("Error resetting column configuration: ".concat(error.message));
    SpreadsheetApp.getUi().alert('Error', "Failed to reset column configuration: ".concat(error.message), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Update the OUTPUT_SHEET_CONFIG with new configuration
 */
function updateOutputSheetConfig(configs) {
  // Convert configs to the format expected by OUTPUT_SHEET_CONFIG
  var columns = configs.map(function (config) {
    return {
      key: config.key,
      width: config.width,
      title: config.title,
      type: config.type
    };
  });

  // Update the global config (this will be used by the team balancer)
  OUTPUT_SHEET_CONFIG.columns = columns;
  Logger.log("Updated OUTPUT_SHEET_CONFIG with ".concat(columns.length, " columns"));
}

/**
 * Shows the actual column headers from Form Responses sheet
 */
function showFormResponseHeaders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var formSheet = ss.getSheetByName('Form Responses 1');
  if (!formSheet) {
    SpreadsheetApp.getUi().alert('Form Responses 1 sheet not found!');
    return;
  }
  var headers = formSheet.getRange(1, 1, 1, formSheet.getLastColumn()).getValues()[0];
  var headerInfo = 'FORM RESPONSES COLUMNS:\n\n';
  headers.forEach(function (header, index) {
    var columnLetter = String.fromCharCode(65 + index);
    headerInfo += "".concat(columnLetter, ": ").concat(header || 'Empty', "\n");
  });
  headerInfo += '\nCURRENT MAPPING:\n';
  headerInfo += '• riotID → Column C (Riot ID)\n';
  headerInfo += '• discordUsername → Column B (Discord Username)\n';
  headerInfo += '• timeSlots → Column E (Time slots)\n';
  headerInfo += '• currentRank → Column J (Current Competitive Rank)\n';
  headerInfo += '• peakRank → Column K (Peak Competitive Rank)\n';
  headerInfo += '• lobbyHost → Column H (Lobby Host)\n';
  headerInfo += '• pronouns → Column D (Pronouns)\n';
  headerInfo += '• multipleGames → Column F (Multiple Games)\n';
  headerInfo += '• willSub → Column G (Substitute)\n';
  headerInfo += '• duo → Column I (Duo)\n';
  headerInfo += '• comments → Column L ((Optional) Comments)\n';
  headerInfo += '\nIMPORTANT NOTES:\n';
  headerInfo += '• timeSlots column is required for team balancing\n';
  headerInfo += '• averageRank is calculated from currentRank + peakRank\n';
  headerInfo += '• Use "auto" width in column config for automatic sizing\n';
  SpreadsheetApp.getUi().alert(headerInfo);
}

/***** UI FUNCTIONS *****/

/**
 * Starting point
 * See Google Workspace Scripts reference
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('SCRIPTS').addItem('Balance Teams and Players', 'sortPlayersIntoBalancedTeams').addItem('Generate Discord Pings', 'generateDiscordPings').addSeparator().addItem('Open Column Configuration', 'openColumnConfigurationSheet').addItem('Save & Apply Column Config', 'saveColumnConfiguration').addItem('Reset Column Config', 'resetColumnConfiguration').addSeparator().addItem('Manage Game Day', 'manageGameDay').addItem('Clear Responses', 'clearResponses').addToUi();
}

/**
 * Creates a UI for managing column configuration
 */
function manageColumnConfiguration() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt('Manage Column Configuration', "Column Configuration Management\n\n" + 'Choose an option:\n' + '[1]: Open Column Configuration Sheet\n' + '[2]: Save Current Configuration\n' + '[3]: Load Saved Configuration\n' + '[4]: Reset to Defaults\n' + '[5]: Cancel', ui.ButtonSet.OK_CANCEL);
  if (result.getSelectedButton() == ui.Button.OK) {
    var choice = result.getResponseText().trim().toUpperCase();
    switch (choice) {
      case '1':
        openColumnConfigurationSheet();
        break;
      case '2':
        saveColumnConfiguration();
        break;
      case '3':
        loadColumnConfiguration();
        break;
      case '4':
        resetColumnConfiguration();
        break;
      case '5':
        ui.alert('Cancelled', 'Column configuration management was cancelled.', ui.ButtonSet.OK);
        break;
      default:
        ui.alert('Invalid Choice', 'Please enter 1, 2, 3, 4, or 5.', ui.ButtonSet.OK);
        manageColumnConfiguration();
      // Recursive call to try again
    }
  } else {
    ui.alert('Cancelled', 'Column configuration management was cancelled.', ui.ButtonSet.OK);
  }
}

// Import UI functions

// Expose functions to the global scope for Google Apps Script
var global = {};
global.onOpen = onOpen;
global.manageColumnConfiguration = manageColumnConfiguration;
global.sortPlayersIntoBalancedTeams = sortPlayersIntoBalancedTeams;
global.generateDiscordPings = generateDiscordPings;
global.clearResponses = clearResponses;
global.saveColumnConfiguration = saveColumnConfiguration;
global.loadColumnConfiguration = loadColumnConfiguration;
global.resetColumnConfiguration = resetColumnConfiguration;
global.openColumnConfigurationSheet = openColumnConfigurationSheet;
global.showFormResponseHeaders = showFormResponseHeaders;
