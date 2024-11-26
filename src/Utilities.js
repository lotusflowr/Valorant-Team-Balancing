export function setConditionalFormatting(range) {
  const rules = [
    { rank: "Iron", color: "#464646" },
    { rank: "Bronze", color: "#a6824c" },
    { rank: "Silver", color: "#dce1dc" },
    { rank: "Gold", color: "#dc8e21" },
    { rank: "Platinum", color: "#27697a" },
    { rank: "Diamond", color: "#c688f7" },
    { rank: "Ascendant", color: "#40b57e" },
    { rank: "Immortal", color: "#953640" },
    { rank: "Radiant", color: "#f2dc95" }
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

export function getContrastColor(hexcolor) {
  const r = parseInt(hexcolor.substr(1, 2), 16);
  const g = parseInt(hexcolor.substr(3, 2), 16);
  const b = parseInt(hexcolor.substr(5, 2), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#000000" : "#ffffff";
}

export function getRankValue(rank) {
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

export function getRankName(rankValue) {
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

export function clearResponses() {
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
