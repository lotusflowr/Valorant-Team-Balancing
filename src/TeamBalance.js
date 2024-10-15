
//here for testing jest, remove when first real jest test is done
export function sum(a, b) {
  if (typeof SpreadsheetApp != 'undefined') {
    var ui = SpreadsheetApp.getUi();
    ui.alert('sum works!', 'sum works!', ui.ButtonSet.OK);
  }
  return a + b;
}
