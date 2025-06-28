import { OUTPUT_SHEET_CONFIG, STYLING } from './config.js';

/**
 * Column Configuration Manager
 * Allows users to configure column display order, titles, and types
 */

/**
 * Opens the Column Configuration sheet for editing
 */
export function openColumnConfigurationSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let configSheet = ss.getSheetByName('Column Configuration');
    
    if (!configSheet) {
        configSheet = ss.insertSheet('Column Configuration');
    }
    
    // Clear existing content
    configSheet.clear();
    
    // Get actual column headers from Form Responses sheet
    const formSheet = ss.getSheetByName('Form Responses 1');
    let sourceColumns = [];
    
    if (formSheet) {
        const headers = formSheet.getRange(1, 1, 1, formSheet.getLastColumn()).getValues()[0];
        sourceColumns = headers.map((header, index) => ({
            column: String.fromCharCode(65 + index), // A, B, C, etc.
            index: index + 1,
            header: header || `Column ${index + 1}`
        }));
    }
    
    // Create configuration table
    const configData = [
        ['Column Key', 'Title', 'Width', 'Type', 'Display', 'Source Column', 'Description']
    ];
    
    // Add existing configuration
    OUTPUT_SHEET_CONFIG.columns.forEach((col, index) => {
        const sourceCol = getSourceColumnForKey(col.key, sourceColumns);
        configData.push([
            col.key,
            col.title,
            col.width,
            col.type,
            'TRUE', // Default to display
            sourceCol,
            getDescriptionForKey(col.key)
        ]);
    });
    
    // Add all available keys (not just display columns)
    const allKeys = [
        { key: 'riotID', title: 'Riot ID', width: 'auto', type: 'data', display: 'TRUE', source: 'C', desc: 'Player\'s Riot ID (from Column C)' },
        { key: 'discordUsername', title: 'Discord', width: 'auto', type: 'data', display: 'TRUE', source: 'B', desc: 'Player\'s Discord username (from Column B)' },
        { key: 'currentRank', title: 'Current Rank', width: 'auto', type: 'data', display: 'TRUE', source: 'J', desc: 'Player\'s current rank (from Column J)' },
        { key: 'peakRank', title: 'Peak Rank', width: 'auto', type: 'data', display: 'TRUE', source: 'K', desc: 'Player\'s peak rank (from Column K)' },
        { key: 'lobbyHost', title: 'Lobby Host', width: 'auto', type: 'data', display: 'TRUE', source: 'H', desc: 'Whether player is lobby host (from Column H)' },
        { key: 'averageRank', title: 'Avg Rank', width: 'auto', type: 'calculated', display: 'TRUE', source: 'N/A', desc: 'Calculated: (currentRank + peakRank) / 2 (requires currentRank and peakRank)' },
        { key: 'timeSlots', title: 'Time Slots', width: 'auto', type: 'data', display: 'FALSE', source: 'E', desc: 'Player\'s preferred time slots (from Column E)' },
        { key: 'pronouns', title: 'Pronouns', width: 'auto', type: 'data', display: 'FALSE', source: 'D', desc: 'Player\'s pronouns (from Column D)' },
        { key: 'multipleGames', title: 'Multiple Games', width: 'auto', type: 'data', display: 'FALSE', source: 'F', desc: 'Whether player wants multiple games (from Column F)' },
        { key: 'willSub', title: 'Will Sub', width: 'auto', type: 'data', display: 'FALSE', source: 'G', desc: 'Whether player is willing to sub (from Column G)' },
        { key: 'duo', title: 'Duo', width: 'auto', type: 'data', display: 'FALSE', source: 'I', desc: 'Player\'s duo partner (from Column I)' },
        { key: 'comments', title: 'Comments', width: 'auto', type: 'data', display: 'FALSE', source: 'L', desc: 'Player comments (from Column L)' },
        { key: 'preferredAgents', title: 'Preferred Agents', width: 'auto', type: 'display', display: 'FALSE', source: 'N/A', desc: 'Display only - for manual input' },
        { key: 'notes', title: 'Notes', width: 'auto', type: 'display', display: 'FALSE', source: 'N/A', desc: 'Display only - for manual input' },
        { key: 'role', title: 'Role', width: 'auto', type: 'display', display: 'FALSE', source: 'N/A', desc: 'Display only - for manual input' },
        { key: 'availability', title: 'Availability', width: 'auto', type: 'display', display: 'FALSE', source: 'N/A', desc: 'Display only - for manual input' }
    ];
    // Only add keys not already in configData
    allKeys.forEach(keyObj => {
        if (!configData.some(row => row[0] === keyObj.key)) {
            configData.push([
                keyObj.key,
                keyObj.title,
                keyObj.width,
                keyObj.type,
                keyObj.display,
                keyObj.source,
                keyObj.desc
            ]);
        }
    });
    
    // Write configuration table
    const range = configSheet.getRange(1, 1, configData.length, configData[0].length);
    range.setValues(configData);
    
    // Style header row
    const headerRange = configSheet.getRange(1, 1, 1, configData[0].length);
    headerRange.setBackground('#4A86E8').setFontColor('white').setFontWeight('bold');
    
    // Add data validation for Type column
    const typeRange = configSheet.getRange(2, 4, configData.length - 1, 1);
    const typeRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['data', 'calculated', 'display'], true)
        .setAllowInvalid(false)
        .build();
    typeRange.setDataValidation(typeRule);
    
    // Add data validation for Display column
    const displayRange = configSheet.getRange(2, 5, configData.length - 1, 1);
    const displayRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['TRUE', 'FALSE'], true)
        .setAllowInvalid(false)
        .build();
    displayRange.setDataValidation(displayRule);
    
    // Autofit config sheet after writing config table
    configSheet.autoResizeColumns(1, configData[0].length);
    
    // Write instructions well below the config table
    const instructions = [
        ['Instructions:'],
        [''],
        ['• Use the Display column (TRUE/FALSE) to control which columns appear in the output.'],
        ['• All variables are available for logic, but only those with Display=TRUE are shown in the output.'],
        ['• If timeSlots is not displayed or is blank for all players, all players are balanced as one group and no time slot headers are shown.'],
        ['• To use Discord Pings, you must have the discordUsername column present and displayed in the output sheet.'],
        ['COLUMN TYPES:'],
        ['• data: Gets value from Form Responses sheet (e.g., riotID, discordUsername)'],
        ['• calculated: Computed value that depends on other columns (e.g., averageRank)'],
        ['• display: Empty column for manual input (e.g., preferredAgents, notes)'],
        [''],
        ['HOW TO CONFIGURE:'],
        ['1. Edit "Title" to change column headers'],
        ['2. Edit "Width" to "auto" for auto-resize, or enter pixel width (e.g., 150)'],
        ['3. Edit "Type" using dropdown: data/calculated/display'],
        ['4. Order is automatic - just move rows up/down to change position'],
        ['5. "Source Column" shows which Form Responses column provides data'],
        ['6. Use "Save & Apply Column Config" to apply changes'],
        ['7. Use "Reset Column Config" to restore defaults'],
        [''],
        ['SIMPLE REORDERING:'],
        ['• To move a column: Cut the row and paste it in the desired position'],
        ['• To add a column: Insert a new row and fill in the details'],
        ['• To remove a column: Delete the row'],
        ['• Order is determined by row position (top to bottom)'],
        [''],
        ['DATA SOURCES (Form Responses columns):'],
        ['• riotID → Column C (Riot ID)'],
        ['• discordUsername → Column B (Discord Username)'],
        ['• timeSlots → Column E (Time slots)'],
        ['• currentRank → Column J (Current Competitive Rank)'],
        ['• peakRank → Column K (Peak Competitive Rank)'],
        ['• lobbyHost → Column H (Lobby Host)'],
        ['• pronouns → Column D (Pronouns)'],
        ['• multipleGames → Column F (Multiple Games)'],
        ['• willSub → Column G (Substitute)'],
        ['• duo → Column I (Duo)'],
        ['• comments → Column L ((Optional) Comments)'],
        [''],
        ['CALCULATED COLUMNS:'],
        ['• averageRank: Requires currentRank and peakRank to be configured'],
        [''],
        ['EXAMPLES:'],
        ['• To add "Preferred Agents" column:'],
        ['  - Insert new row, Key: preferredAgents, Type: display'],
        ['• To move Discord to first: Cut Discord row, paste at top'],
        ['• To remove column: Delete the row'],
        ['• To auto-resize: Set Width to "auto"'],
        [''],
        ['IMPORTANT:'],
        ['• timeSlots column is required for team balancing'],
        ['• averageRank requires both currentRank and peakRank columns'],
        ['• Use "auto" width for automatic column sizing'],
        ['• Save after making changes to apply them'],
        ['AVAILABLE KEYS (add as needed):'],
        ['• riotID, discordUsername, currentRank, peakRank, lobbyHost, averageRank, timeSlots'],
        ['• pronouns, multipleGames, willSub, duo, comments, preferredAgents, notes, role, availability'],
    ];
    const instructionStartRow = configData.length + 3;
    const instructionRange = configSheet.getRange(instructionStartRow, 1, instructions.length, 1);
    instructionRange.setValues(instructions);
    
    // Freeze header row
    configSheet.setFrozenRows(1);
    
    SpreadsheetApp.getUi().alert('Column Configuration sheet opened! Edit the table above, then use "Save & Apply Column Config" to apply changes.');
}

/**
 * Gets the source column information for a given key
 */
function getSourceColumnForKey(key, sourceColumns) {
    const keyToColumnMap = {
        'riotID': 'C', // Column C - Riot ID
        'discordUsername': 'B', // Column B - Discord Username  
        'timeSlots': 'E', // Column E - Time slots
        'currentRank': 'J', // Column J - Current Competitive Rank
        'peakRank': 'K', // Column K - Peak Competitive Rank
        'lobbyHost': 'H', // Column H - Lobby Host
        'pronouns': 'D', // Column D - Pronouns
        'multipleGames': 'F', // Column F - Multiple Games
        'willSub': 'G', // Column G - Substitute
        'duo': 'I', // Column I - Duo
        'comments': 'L', // Column L - (Optional) Comments
        'averageRank': 'calculated' // This is calculated, not from source
    };
    
    const columnLetter = keyToColumnMap[key];
    if (!columnLetter || columnLetter === 'calculated') {
        return 'N/A';
    }
    
    return columnLetter; // Just return the letter
}

/**
 * Gets description for a column key
 */
function getDescriptionForKey(key) {
    const descriptions = {
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
export function saveColumnConfiguration() {
    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = ss.getSheetByName('Column Configuration');
        
        if (!sheet) {
            SpreadsheetApp.getUi().alert('Error', 'Column Configuration sheet not found. Please open it first.', SpreadsheetApp.getUi().ButtonSet.OK);
            return;
        }
        
        // Get data from the sheet (skip header rows)
        const allData = sheet.getRange(3, 1, sheet.getLastRow() - 2, 6).getValues();
        // Only process rows until the first empty row in Column A
        const data = [];
        for (let i = 0; i < allData.length; i++) {
            if (!allData[i][0] || allData[i][0].toString().trim() === '') break;
            // Pad row to length 7
            const row = [...allData[i]];
            while (row.length < 7) row.push('');
            data.push(row);
        }
        Logger.log('Saving config rows: ' + JSON.stringify(data));
        // Filter out empty rows and build configuration
        const configs = data
            .filter(row => row[0] && row[0].toString().trim())
            .map((row, index) => ({
                key: (row[0] || '').toString().trim(),
                title: (row[1] || '').toString().trim() || (row[0] || '').toString().trim(),
                width: (row[2] || '').toString().trim() || 'auto',
                type: (row[3] || '').toString().trim() || 'data',
                display: ((row[4] || '').toString().trim().toUpperCase() === 'TRUE'),
                sourceColumn: (row[5] || '').toString().trim(),
                description: (row[6] || '').toString().trim()
            }));
        // For output, only include columns with display=true
        const displayColumns = configs.filter(c => c.display);
        updateOutputSheetConfig(displayColumns);
        // Save all configs for logic use
        PropertiesService.getScriptProperties().setProperty('COLUMN_CONFIG', JSON.stringify(configs));
        
        SpreadsheetApp.getUi().alert('Success', `Column configuration saved and applied successfully! ${configs.length} columns configured.`, SpreadsheetApp.getUi().ButtonSet.OK);
        
    } catch (error) {
        Logger.log(`Error saving column configuration: ${error.message}`);
        SpreadsheetApp.getUi().alert('Error', `Failed to save column configuration: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    }
}

/**
 * Load column configuration from script properties
 */
export function loadColumnConfiguration() {
    try {
        const configData = PropertiesService.getScriptProperties().getProperty('COLUMN_CONFIG');
        if (!configData) {
            SpreadsheetApp.getUi().alert('Info', 'No saved column configuration found. Use "Reset Column Config" to create defaults.', SpreadsheetApp.getUi().ButtonSet.OK);
            return;
        }
        
        const configs = JSON.parse(configData);
        updateOutputSheetConfig(configs);
        
        SpreadsheetApp.getUi().alert('Success', 'Column configuration loaded successfully!', SpreadsheetApp.getUi().ButtonSet.OK);
        
    } catch (error) {
        Logger.log(`Error loading column configuration: ${error.message}`);
        SpreadsheetApp.getUi().alert('Error', `Failed to load column configuration: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    }
}

/**
 * Reset column configuration to defaults
 */
export function resetColumnConfiguration() {
    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = ss.getSheetByName('Column Configuration');
        
        if (!sheet) {
            sheet = ss.insertSheet('Column Configuration');
        }
        
        // Clear existing content
        sheet.clear();
        
        // Set up headers
        const headers = [
            ['Column Key', 'Title', 'Width', 'Type', 'Display', 'Source Column', 'Description']
        ];
        const headerRange = sheet.getRange(1, 1, 1, 7);
        headerRange.setValues(headers);
        headerRange.setBackground('#4A86E8').setFontColor('white').setFontWeight('bold');
        // Default configuration
        const defaultConfigs = [
            ['riotID', 'Riot ID', 'auto', 'data', 'TRUE', 'C', 'Player\'s Riot ID (from Column C)'],
            ['discordUsername', 'Discord', 'auto', 'data', 'TRUE', 'B', 'Player\'s Discord username (from Column B)'],
            ['currentRank', 'Current Rank', 'auto', 'data', 'TRUE', 'J', 'Player\'s current rank (from Column J)'],
            ['peakRank', 'Peak Rank', 'auto', 'data', 'TRUE', 'K', 'Player\'s peak rank (from Column K)'],
            ['lobbyHost', 'Lobby Host', 'auto', 'data', 'TRUE', 'H', 'Whether player is lobby host (from Column H)'],
            ['averageRank', 'Avg Rank', 'auto', 'calculated', 'TRUE', 'N/A', 'Calculated: (currentRank + peakRank) / 2 (requires currentRank and peakRank)']
        ];
        const dataRange = sheet.getRange(2, 1, defaultConfigs.length, 7);
        dataRange.setValues(defaultConfigs);
        // Add data validation for Type column
        const typeRange = sheet.getRange(2, 4, defaultConfigs.length, 1);
        const typeRule = SpreadsheetApp.newDataValidation()
            .requireValueInList(['data', 'calculated', 'display'], true)
            .setAllowInvalid(false)
            .build();
        typeRange.setDataValidation(typeRule);
        // Add data validation for Display column
        const displayRange = sheet.getRange(2, 5, defaultConfigs.length, 1);
        const displayRule = SpreadsheetApp.newDataValidation()
            .requireValueInList(['TRUE', 'FALSE'], true)
            .setAllowInvalid(false)
            .build();
        displayRange.setDataValidation(displayRule);
        // Autofit config sheet after writing config table
        sheet.autoResizeColumns(1, 7);
        // Write instructions well below the config table
        const instructions = [
            ['Instructions:'],
            [''],
            ['• Use the Display column (TRUE/FALSE) to control which columns appear in the output.'],
            ['• All variables are available for logic, but only those with Display=TRUE are shown in the output.'],
            ['• If timeSlots is not displayed or is blank for all players, all players are balanced as one group and no time slot headers are shown.'],
            ['• To use Discord Pings, you must have the discordUsername column present and displayed in the output sheet.'],
            ['COLUMN TYPES:'],
            ['• data: Gets value from Form Responses sheet (e.g., riotID, discordUsername)'],
            ['• calculated: Computed value that depends on other columns (e.g., averageRank)'],
            ['• display: Empty column for manual input (e.g., preferredAgents, notes)'],
            [''],
            ['HOW TO CONFIGURE:'],
            ['1. Edit "Title" to change column headers'],
            ['2. Edit "Width" to "auto" for auto-resize, or enter pixel width (e.g., 150)'],
            ['3. Edit "Type" using dropdown: data/calculated/display'],
            ['4. Order is automatic - just move rows up/down to change position'],
            ['5. "Source Column" shows which Form Responses column provides data'],
            ['6. Use "Save & Apply Column Config" to apply changes'],
            ['7. Use "Reset Column Config" to restore defaults'],
            [''],
            ['SIMPLE REORDERING:'],
            ['• To move a column: Cut the row and paste it in the desired position'],
            ['• To add a column: Insert a new row and fill in the details'],
            ['• To remove a column: Delete the row'],
            ['• Order is determined by row position (top to bottom)'],
            [''],
            ['DATA SOURCES (Form Responses columns):'],
            ['• riotID → Column C (Riot ID)'],
            ['• discordUsername → Column B (Discord Username)'],
            ['• timeSlots → Column E (Time slots)'],
            ['• currentRank → Column J (Current Competitive Rank)'],
            ['• peakRank → Column K (Peak Competitive Rank)'],
            ['• lobbyHost → Column H (Lobby Host)'],
            ['• pronouns → Column D (Pronouns)'],
            ['• multipleGames → Column F (Multiple Games)'],
            ['• willSub → Column G (Substitute)'],
            ['• duo → Column I (Duo)'],
            ['• comments → Column L ((Optional) Comments)'],
            [''],
            ['CALCULATED COLUMNS:'],
            ['• averageRank: Requires currentRank and peakRank to be configured'],
            [''],
            ['EXAMPLES:'],
            ['• To add "Preferred Agents" column:'],
            ['  - Insert new row, Key: preferredAgents, Type: display'],
            ['• To move Discord to first: Cut Discord row, paste at top'],
            ['• To remove column: Delete the row'],
            ['• To auto-resize: Set Width to "auto"'],
            [''],
            ['IMPORTANT:'],
            ['• timeSlots column is required for team balancing'],
            ['• averageRank requires both currentRank and peakRank columns'],
            ['• Use "auto" width for automatic column sizing'],
            ['• Save after making changes to apply them'],
            ['AVAILABLE KEYS (add as needed):'],
            ['• riotID, discordUsername, currentRank, peakRank, lobbyHost, averageRank, timeSlots'],
            ['• pronouns, multipleGames, willSub, duo, comments, preferredAgents, notes, role, availability'],
        ];
        const instructionStartRow = defaultConfigs.length + 3;
        const instructionRange = sheet.getRange(instructionStartRow, 1, instructions.length, 1);
        instructionRange.setValues(instructions);
        // Freeze header row
        sheet.setFrozenRows(1);
        // Apply the configuration immediately
        saveColumnConfiguration();
        SpreadsheetApp.getUi().alert('Success', 'Column configuration has been reset to defaults and applied successfully!', SpreadsheetApp.getUi().ButtonSet.OK);
        
    } catch (error) {
        Logger.log(`Error resetting column configuration: ${error.message}`);
        SpreadsheetApp.getUi().alert('Error', `Failed to reset column configuration: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    }
}

/**
 * Update the OUTPUT_SHEET_CONFIG with new configuration
 */
function updateOutputSheetConfig(configs) {
    // Convert configs to the format expected by OUTPUT_SHEET_CONFIG
    const columns = configs.map(config => ({
        key: config.key,
        width: config.width,
        title: config.title,
        type: config.type
    }));
    
    // Update the global config (this will be used by the team balancer)
    OUTPUT_SHEET_CONFIG.columns = columns;
    
    Logger.log(`Updated OUTPUT_SHEET_CONFIG with ${columns.length} columns`);
}

/**
 * Shows the actual column headers from Form Responses sheet
 */
export function showFormResponseHeaders() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const formSheet = ss.getSheetByName('Form Responses 1');
    
    if (!formSheet) {
        SpreadsheetApp.getUi().alert('Form Responses 1 sheet not found!');
        return;
    }
    
    const headers = formSheet.getRange(1, 1, 1, formSheet.getLastColumn()).getValues()[0];
    let headerInfo = 'FORM RESPONSES COLUMNS:\n\n';
    
    headers.forEach((header, index) => {
        const columnLetter = String.fromCharCode(65 + index);
        headerInfo += `${columnLetter}: ${header || 'Empty'}\n`;
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