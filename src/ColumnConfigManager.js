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
        ['Column Key', 'Title', 'Width', 'Type', 'Display', 'Source Column']
    ];
    
    // Load saved configuration first
    const savedConfigData = PropertiesService.getScriptProperties().getProperty('COLUMN_CONFIG');
    let savedConfigs = [];
    if (savedConfigData) {
        savedConfigs = JSON.parse(savedConfigData);
        Logger.log('Loaded saved config: ' + JSON.stringify(savedConfigs));
    }
    
    // If no saved config, use defaults
    if (savedConfigs.length === 0) {
        savedConfigs = getDefaultConfig();
    }
    
    // Add saved configuration to table
    savedConfigs.forEach(config => {
        configData.push([
            config.key,
            config.title,
            config.width,
            config.type,
            config.display ? 'TRUE' : 'FALSE',
            config.sourceColumn || ''
        ]);
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
        ['COLUMN CONFIGURATION INSTRUCTIONS'],
        [''],
        ['QUICK START'],
        ['• Use the Display column (TRUE/FALSE) to control which columns appear in the output'],
        ['• All variables are available for logic, but only those with Display=TRUE are shown'],
        ['• If timeSlots is not displayed or is blank, all players are balanced as one group'],
        ['• To use Discord Pings, you must have discordUsername column present and displayed'],
        [''],
        ['COLUMN TYPES'],
        ['• data: Gets value from Form Responses sheet (e.g., riotID, discordUsername)'],
        ['• calculated: Computed value that depends on other columns (e.g., averageRank)'],
        ['• display: Empty column for manual input (e.g., preferredAgents, notes)'],
        [''],
        ['HOW TO CONFIGURE'],
        ['1. Edit "Title" to change column headers'],
        ['2. Edit "Width" to "auto" for auto-resize, or enter pixel width (e.g., 150)'],
        ['3. Edit "Type" using dropdown: data/calculated/display'],
        ['4. Order is automatic - just move rows up/down to change position'],
        ['5. "Source Column" shows which Form Responses column provides data'],
        ['6. Use "Save & Apply Column Config" to apply changes'],
        ['7. Use "Restore Default Config" to restore defaults'],
        ['8. Use "Restore from Last Save" to restore last saved configuration'],
        [''],
        ['SIMPLE REORDERING'],
        ['• To move a column: Hold the row number and drag up/down to desired position'],
        ['• To add a column: Insert a new row and fill in the details'],
        ['• To remove a column: Delete the row'],
        ['• Order is determined by row position (top to bottom)'],
        [''],
        ['CALCULATED COLUMNS'],
        ['• averageRank: Requires currentRank and peakRank to be configured'],
        [''],
        ['EXAMPLES'],
        ['• To add "Pronouns" column:'],
        ['  - Insert new row, Key: pronouns, Type: data'],
        ['• To move Discord to first: Drag Discord row to top'],
        ['• To remove column: Delete the row'],
        ['• To auto-resize: Set Width to "auto"'],
        [''],
        ['IMPORTANT NOTES'],
        ['• averageRank requires both currentRank and peakRank columns'],
        ['• Use "auto" width for automatic column sizing'],
        [''],
        ['VARIABLES USED IN CODE:'],
        ['• discordUsername: Required for Discord Pings'],
        ['• timeSlots: Used for time slot balancing (optional)'],
        ['• currentRank: Used for team balancing'],
        ['• peakRank: Used for team balancing'],
        ['• lobbyHost: Used for Discord Pings'],
        ['• multipleGames: Used for team balancing'],
        ['• willSub: Used for substitute assignment'],
        ['• riotID: Used for display'],
        ['• pronouns: Used for display'],
        ['• duo: Used for display'],
        [''],
        ['AVAILABLE KEYS'],
        ['• riotID, discordUsername, currentRank, peakRank, lobbyHost, averageRank, timeSlots'],
        ['• pronouns, multipleGames, willSub, duo'],
        [''],
        ['KEY REQUIREMENTS'],
        ['• Key must be lowercase with no spaces or special characters'],
        ['• Key is used internally by the code to identify the column'],
        ['• Examples: riotID, discordUsername, currentRank (not "Riot ID" or "Discord Username")'],
    ];
    const instructionStartRow = configData.length + 3;
    const instructionRange = configSheet.getRange(instructionStartRow, 1, instructions.length, 1);
    instructionRange.setValues(instructions);
    
    // Style the instructions
    const instructionHeaderRange = configSheet.getRange(instructionStartRow, 1, 1, 1);
    instructionHeaderRange.setFontWeight('bold')
        .setFontSize(14)
        .setBackground('#4A86E8')
        .setFontColor('white');
    
    // Style section headers
    const sectionHeaders = [
        instructionStartRow + 2,  // Quick Start
        instructionStartRow + 9,  // Column Types
        instructionStartRow + 13, // How to Configure
        instructionStartRow + 24, // Simple Reordering
        instructionStartRow + 30, // Calculated Columns
        instructionStartRow + 33, // Examples
        instructionStartRow + 39, // Important Notes
        instructionStartRow + 44, // Available Keys
        instructionStartRow + 47  // Key Requirements
    ];
    
    sectionHeaders.forEach(rowIndex => {
        const sectionRange = configSheet.getRange(rowIndex, 1, 1, 1);
        sectionRange.setFontWeight('bold')
            .setFontSize(12)
            .setBackground('#E8F0FE')
            .setFontColor('#1A73E8');
    });
    
    SpreadsheetApp.getUi().alert('Column Configuration sheet opened! Edit the table above, then use "Save & Apply Column Config" to apply changes.');
}

/**
 * Gets the default configuration
 */
function getDefaultConfig() {
    return [
        { key: 'discordUsername', title: 'Discord', width: 'auto', type: 'data', display: true, sourceColumn: 'B' },
        { key: 'riotID', title: 'Riot ID', width: 'auto', type: 'data', display: true, sourceColumn: 'C' },
        { key: 'pronouns', title: 'Pronouns', width: 'auto', type: 'data', display: true, sourceColumn: 'D' },
        { key: 'timeSlots', title: 'Time Slots', width: 'auto', type: 'data', display: true, sourceColumn: 'E' },
        { key: 'multipleGames', title: 'Multiple Games', width: 'auto', type: 'data', display: true, sourceColumn: 'F' },
        { key: 'willSub', title: 'Will Sub', width: 'auto', type: 'data', display: true, sourceColumn: 'G' },
        { key: 'lobbyHost', title: 'Lobby Host', width: 'auto', type: 'data', display: true, sourceColumn: 'H' },
        { key: 'duo', title: 'Duo', width: 'auto', type: 'data', display: true, sourceColumn: 'I' },
        { key: 'currentRank', title: 'Current Rank', width: 'auto', type: 'data', display: true, sourceColumn: 'J' },
        { key: 'peakRank', title: 'Peak Rank', width: 'auto', type: 'data', display: true, sourceColumn: 'K' },
        { key: 'averageRank', title: 'Avg Rank', width: 'auto', type: 'calculated', display: true, sourceColumn: '' }
    ];
}

/**
 * Gets the source column information for a given key
 */
function getSourceColumnForKey(key, sourceColumns) {
    // Return empty string for all keys as requested
    return '';
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
        const allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
        // Only process rows until the first empty row in Column A
        const data = [];
        for (let i = 0; i < allData.length; i++) {
            if (!allData[i][0] || allData[i][0].toString().trim() === '') break;
            data.push(allData[i]);
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
                sourceColumn: (row[5] || '').toString().trim()
            }));
        
        Logger.log('Parsed configs: ' + JSON.stringify(configs));
        
        // For output, only include columns with display=true
        const displayColumns = configs.filter(c => c.display);
        Logger.log('Display columns: ' + JSON.stringify(displayColumns));
        
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
            SpreadsheetApp.getUi().alert('Info', 'No saved column configuration found. Use "Restore Default Config" to create defaults.', SpreadsheetApp.getUi().ButtonSet.OK);
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
 * Restore column configuration to defaults
 */
export function restoreDefaultConfiguration() {
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
            ['Column Key', 'Title', 'Width', 'Type', 'Display', 'Source Column']
        ];
        const headerRange = sheet.getRange(1, 1, 1, 6);
        headerRange.setValues(headers);
        headerRange.setBackground('#4A86E8').setFontColor('white').setFontWeight('bold');
        
        // Convert default configs to table format
        const configData = getDefaultConfig().map(config => [
            config.key,
            config.title,
            config.width,
            config.type,
            config.display ? 'TRUE' : 'FALSE',
            config.sourceColumn || ''
        ]);
        
        // Write configuration data
        const dataRange = sheet.getRange(2, 1, configData.length, 6);
        dataRange.setValues(configData);
        
        // Add data validation for Type column
        const typeRange = sheet.getRange(2, 4, configData.length, 1);
        const typeRule = SpreadsheetApp.newDataValidation()
            .requireValueInList(['data', 'calculated', 'display'], true)
            .setAllowInvalid(false)
            .build();
        typeRange.setDataValidation(typeRule);
        
        // Add data validation for Display column
        const displayRange = sheet.getRange(2, 5, configData.length, 1);
        const displayRule = SpreadsheetApp.newDataValidation()
            .requireValueInList(['TRUE', 'FALSE'], true)
            .setAllowInvalid(false)
            .build();
        displayRange.setDataValidation(displayRule);
        
        // Autofit config sheet after writing config table
        sheet.autoResizeColumns(1, 6);
        
        // Write instructions well below the config table
        const instructions = [
            ['COLUMN CONFIGURATION INSTRUCTIONS'],
            [''],
            ['QUICK START'],
            ['• Use the Display column (TRUE/FALSE) to control which columns appear in the output'],
            ['• All variables are available for logic, but only those with Display=TRUE are shown'],
            ['• If timeSlots is not displayed or is blank, all players are balanced as one group'],
            ['• To use Discord Pings, you must have discordUsername column present and displayed'],
            [''],
            ['COLUMN TYPES'],
            ['• data: Gets value from Form Responses sheet (e.g., riotID, discordUsername)'],
            ['• calculated: Computed value that depends on other columns (e.g., averageRank)'],
            ['• display: Empty column for manual input (e.g., preferredAgents, notes)'],
            [''],
            ['HOW TO CONFIGURE'],
            ['1. Edit "Title" to change column headers'],
            ['2. Edit "Width" to "auto" for auto-resize, or enter pixel width (e.g., 150)'],
            ['3. Edit "Type" using dropdown: data/calculated/display'],
            ['4. Order is automatic - just move rows up/down to change position'],
            ['5. "Source Column" shows which Form Responses column provides data'],
            ['6. Use "Save & Apply Column Config" to apply changes'],
            ['7. Use "Restore Default Config" to restore defaults'],
            ['8. Use "Restore from Last Save" to restore last saved configuration'],
            [''],
            ['SIMPLE REORDERING'],
            ['• To move a column: Hold the row number and drag up/down to desired position'],
            ['• To add a column: Insert a new row and fill in the details'],
            ['• To remove a column: Delete the row'],
            ['• Order is determined by row position (top to bottom)'],
            [''],
            ['CALCULATED COLUMNS'],
            ['• averageRank: Requires currentRank and peakRank to be configured'],
            [''],
            ['EXAMPLES'],
            ['• To add "Pronouns" column:'],
            ['  - Insert new row, Key: pronouns, Type: data'],
            ['• To move Discord to first: Drag Discord row to top'],
            ['• To remove column: Delete the row'],
            ['• To auto-resize: Set Width to "auto"'],
            [''],
            ['IMPORTANT NOTES'],
            ['• averageRank requires both currentRank and peakRank columns'],
            ['• Use "auto" width for automatic column sizing'],
            [''],
            ['VARIABLES USED IN CODE:'],
            ['• discordUsername: Required for Discord Pings'],
            ['• timeSlots: Used for time slot balancing (optional)'],
            ['• currentRank: Used for team balancing'],
            ['• peakRank: Used for team balancing'],
            ['• lobbyHost: Used for Discord Pings'],
            ['• multipleGames: Used for team balancing'],
            ['• willSub: Used for substitute assignment'],
            ['• riotID: Used for display'],
            ['• pronouns: Used for display'],
            ['• duo: Used for display'],
            [''],
            ['AVAILABLE KEYS'],
            ['• riotID, discordUsername, currentRank, peakRank, lobbyHost, averageRank, timeSlots'],
            ['• pronouns, multipleGames, willSub, duo'],
            [''],
            ['KEY REQUIREMENTS'],
            ['• Key must be lowercase with no spaces or special characters'],
            ['• Key is used internally by the code to identify the column'],
            ['• Examples: riotID, discordUsername, currentRank (not "Riot ID" or "Discord Username")'],
        ];
        const instructionStartRow = configData.length + 3;
        const instructionRange = sheet.getRange(instructionStartRow, 1, instructions.length, 1);
        instructionRange.setValues(instructions);
        
        // Style the instructions
        const instructionHeaderRange = sheet.getRange(instructionStartRow, 1, 1, 1);
        instructionHeaderRange.setFontWeight('bold')
            .setFontSize(14)
            .setBackground('#4A86E8')
            .setFontColor('white');
        
        // Style section headers
        const sectionHeaders = [
            instructionStartRow + 2,  // Quick Start
            instructionStartRow + 9,  // Column Types
            instructionStartRow + 13, // How to Configure
            instructionStartRow + 24, // Simple Reordering
            instructionStartRow + 30, // Calculated Columns
            instructionStartRow + 33, // Examples
            instructionStartRow + 39, // Important Notes
            instructionStartRow + 44, // Available Keys
            instructionStartRow + 47  // Key Requirements
        ];
        
        sectionHeaders.forEach(rowIndex => {
            const sectionRange = sheet.getRange(rowIndex, 1, 1, 1);
            sectionRange.setFontWeight('bold')
                .setFontSize(12)
                .setBackground('#E8F0FE')
                .setFontColor('#1A73E8');
        });
        
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
 * Restore column configuration from last saved configuration
 */
export function restoreFromLastSave() {
    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = ss.getSheetByName('Column Configuration');
        
        if (!sheet) {
            sheet = ss.insertSheet('Column Configuration');
        }
        
        // Get the last saved configuration
        const savedConfigData = PropertiesService.getScriptProperties().getProperty('COLUMN_CONFIG');
        let savedConfigs = [];
        
        if (savedConfigData) {
            savedConfigs = JSON.parse(savedConfigData);
            Logger.log('Restoring saved config: ' + JSON.stringify(savedConfigs));
        }
        
        // If no saved config exists, show error
        if (savedConfigs.length === 0) {
            SpreadsheetApp.getUi().alert('No Saved Configuration', 'No saved configuration found. Use "Save & Apply Column Config" first to save a configuration.', SpreadsheetApp.getUi().ButtonSet.OK);
            return;
        }
        
        // Clear existing content
        sheet.clear();
        
        // Set up headers
        const headers = [
            ['Column Key', 'Title', 'Width', 'Type', 'Display', 'Source Column']
        ];
        const headerRange = sheet.getRange(1, 1, 1, 6);
        headerRange.setValues(headers);
        headerRange.setBackground('#4A86E8').setFontColor('white').setFontWeight('bold');
        
        // Convert saved configs to table format
        const configData = savedConfigs.map(config => [
            config.key,
            config.title,
            config.width,
            config.type,
            config.display ? 'TRUE' : 'FALSE',
            config.sourceColumn || ''
        ]);
        
        // Write configuration data
        const dataRange = sheet.getRange(2, 1, configData.length, 6);
        dataRange.setValues(configData);
        
        // Add data validation for Type column
        const typeRange = sheet.getRange(2, 4, configData.length, 1);
        const typeRule = SpreadsheetApp.newDataValidation()
            .requireValueInList(['data', 'calculated', 'display'], true)
            .setAllowInvalid(false)
            .build();
        typeRange.setDataValidation(typeRule);
        
        // Add data validation for Display column
        const displayRange = sheet.getRange(2, 5, configData.length, 1);
        const displayRule = SpreadsheetApp.newDataValidation()
            .requireValueInList(['TRUE', 'FALSE'], true)
            .setAllowInvalid(false)
            .build();
        displayRange.setDataValidation(displayRule);
        
        // Autofit config sheet after writing config table
        sheet.autoResizeColumns(1, 6);
        
        // Write instructions well below the config table
        const instructions = [
            ['COLUMN CONFIGURATION INSTRUCTIONS'],
            [''],
            ['QUICK START'],
            ['• Use the Display column (TRUE/FALSE) to control which columns appear in the output'],
            ['• All variables are available for logic, but only those with Display=TRUE are shown'],
            ['• If timeSlots is not displayed or is blank, all players are balanced as one group'],
            ['• To use Discord Pings, you must have discordUsername column present and displayed'],
            [''],
            ['COLUMN TYPES'],
            ['• data: Gets value from Form Responses sheet (e.g., riotID, discordUsername)'],
            ['• calculated: Computed value that depends on other columns (e.g., averageRank)'],
            ['• display: Empty column for manual input (e.g., preferredAgents, notes)'],
            [''],
            ['HOW TO CONFIGURE'],
            ['1. Edit "Title" to change column headers'],
            ['2. Edit "Width" to "auto" for auto-resize, or enter pixel width (e.g., 150)'],
            ['3. Edit "Type" using dropdown: data/calculated/display'],
            ['4. Order is automatic - just move rows up/down to change position'],
            ['5. "Source Column" shows which Form Responses column provides data'],
            ['6. Use "Save & Apply Column Config" to apply changes'],
            ['7. Use "Restore Default Config" to restore defaults'],
            ['8. Use "Restore from Last Save" to restore last saved configuration'],
            [''],
            ['SIMPLE REORDERING'],
            ['• To move a column: Hold the row number and drag up/down to desired position'],
            ['• To add a column: Insert a new row and fill in the details'],
            ['• To remove a column: Delete the row'],
            ['• Order is determined by row position (top to bottom)'],
            [''],
            ['CALCULATED COLUMNS'],
            ['• averageRank: Requires currentRank and peakRank to be configured'],
            [''],
            ['EXAMPLES'],
            ['• To add "Pronouns" column:'],
            ['  - Insert new row, Key: pronouns, Type: data'],
            ['• To move Discord to first: Drag Discord row to top'],
            ['• To remove column: Delete the row'],
            ['• To auto-resize: Set Width to "auto"'],
            [''],
            ['IMPORTANT NOTES'],
            ['• averageRank requires both currentRank and peakRank columns'],
            ['• Use "auto" width for automatic column sizing'],
            [''],
            ['VARIABLES USED IN CODE:'],
            ['• discordUsername: Required for Discord Pings'],
            ['• timeSlots: Used for time slot balancing (optional)'],
            ['• currentRank: Used for team balancing'],
            ['• peakRank: Used for team balancing'],
            ['• lobbyHost: Used for Discord Pings'],
            ['• multipleGames: Used for team balancing'],
            ['• willSub: Used for substitute assignment'],
            ['• riotID: Used for display'],
            ['• pronouns: Used for display'],
            ['• duo: Used for display'],
            [''],
            ['AVAILABLE KEYS'],
            ['• riotID, discordUsername, currentRank, peakRank, lobbyHost, averageRank, timeSlots'],
            ['• pronouns, multipleGames, willSub, duo'],
            [''],
            ['KEY REQUIREMENTS'],
            ['• Key must be lowercase with no spaces or special characters'],
            ['• Key is used internally by the code to identify the column'],
            ['• Examples: riotID, discordUsername, currentRank (not "Riot ID" or "Discord Username")'],
        ];
        const instructionStartRow = configData.length + 3;
        const instructionRange = sheet.getRange(instructionStartRow, 1, instructions.length, 1);
        instructionRange.setValues(instructions);
        
        // Style the instructions
        const instructionHeaderRange = sheet.getRange(instructionStartRow, 1, 1, 1);
        instructionHeaderRange.setFontWeight('bold')
            .setFontSize(14)
            .setBackground('#4A86E8')
            .setFontColor('white');
        
        // Style section headers
        const sectionHeaders = [
            instructionStartRow + 2,  // Quick Start
            instructionStartRow + 9,  // Column Types
            instructionStartRow + 13, // How to Configure
            instructionStartRow + 24, // Simple Reordering
            instructionStartRow + 30, // Calculated Columns
            instructionStartRow + 33, // Examples
            instructionStartRow + 39, // Important Notes
            instructionStartRow + 44, // Available Keys
            instructionStartRow + 47  // Key Requirements
        ];
        
        sectionHeaders.forEach(rowIndex => {
            const sectionRange = sheet.getRange(rowIndex, 1, 1, 1);
            sectionRange.setFontWeight('bold')
                .setFontSize(12)
                .setBackground('#E8F0FE')
                .setFontColor('#1A73E8');
        });
        
        // Freeze header row
        sheet.setFrozenRows(1);
        
        // Apply the configuration immediately
        saveColumnConfiguration();
        SpreadsheetApp.getUi().alert('Success', 'Column configuration has been restored from last save and applied successfully!', SpreadsheetApp.getUi().ButtonSet.OK);
        
    } catch (error) {
        Logger.log(`Error restoring from last save: ${error.message}`);
        SpreadsheetApp.getUi().alert('Error', `Failed to restore from last save: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
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
    
    SpreadsheetApp.getUi().alert('Form Response Headers', headerInfo, SpreadsheetApp.getUi().ButtonSet.OK);
} 