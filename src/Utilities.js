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

// Sequential list of ranks for easier rank-to-points conversion
const RANK_ORDER = [
  "Iron 1", "Iron 2", "Iron 3",
  "Bronze 1", "Bronze 2", "Bronze 3",
  "Silver 1", "Silver 2", "Silver 3",
  "Gold 1", "Gold 2", "Gold 3",
  "Platinum 1", "Platinum 2", "Platinum 3",
  "Diamond 1", "Diamond 2", "Diamond 3",
  "Ascendant 1", "Ascendant 2", "Ascendant 3",
  "Immortal 1", "Immortal 2", "Immortal 3",
  "Radiant"
];

export function getRankValue(rank) {
  const index = RANK_ORDER.indexOf(rank);
  return index === -1 ? 0 : index + 1;
}

export function getRankName(rankValue) {
  // Values are one-indexed in getRankValue
  return RANK_ORDER[rankValue - 1] || "Unranked";
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
