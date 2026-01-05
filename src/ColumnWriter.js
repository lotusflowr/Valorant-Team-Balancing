import { OUTPUT_SHEET_CONFIG, STYLING } from './config.js';
import { getRankName } from './Utilities.js';

/**
 * Utility class for writing data to sheets with flexible column configuration
 */
export class ColumnWriter {
    constructor(sheet) {
        this.sheet = sheet;
        this.config = OUTPUT_SHEET_CONFIG;
        this.loadDisplayConfig();
    }

    /**
     * Load the display configuration from script properties
     */
    loadDisplayConfig() {
        try {
            const configData = PropertiesService.getScriptProperties().getProperty('COLUMN_CONFIG');
            if (configData) {
                const configs = JSON.parse(configData);
                // Filter to only display columns
                this.displayConfigs = configs.filter(config => config.display === true);
                Logger.log(`Loaded ${this.displayConfigs.length} display columns from config`);
            } else {
                // Fallback to OUTPUT_SHEET_CONFIG
                this.displayConfigs = this.config.columns;
                Logger.log(`Using fallback config with ${this.displayConfigs.length} columns`);
            }
        } catch (error) {
            Logger.log(`Error loading display config: ${error.message}`);
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
    writePlayerRow(rowIndex, playerData, options = {}) {
        const { backgroundColor, textColor = STYLING.colors.text.black, fontSize = STYLING.fontSize.player } = options;
        
        // Build the row data based on display config
        const rowData = this.displayConfigs.map(config => {
            const key = config.key;
            
            switch (key) {
                case 'riotID':
                    return playerData.riotID || '';
                case 'discordUsername':
                    return playerData.discordUsername || '';
                case 'timeSlots':
                    return Array.isArray(playerData.timeSlots) ? playerData.timeSlots.join(', ') : (playerData.timeSlots || '');
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
        const range = this.sheet.getRange(rowIndex, 1, 1, rowData.length);
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
    writeHeaders(rowIndex, options = {}) {
        const { 
            backgroundColor = STYLING.colors.header, 
            textColor = STYLING.colors.text.white, 
            fontSize = STYLING.fontSize.columnHeader,
            fontWeight = "bold",
            useAutoTitles = false
        } = options;

        let headers;
        if (useAutoTitles) {
            // Try to get headers from the first row of the sheet
            try {
                const firstRow = this.sheet.getRange(1, 1, 1, this.displayConfigs.length).getValues()[0];
                headers = firstRow.map((cell, index) => {
                    if (cell && cell.toString().trim()) {
                        return cell.toString().trim();
                    } else {
                        // Fallback to configured title
                        return this.displayConfigs[index] ? this.displayConfigs[index].title : `Column ${index + 1}`;
                    }
                });
            } catch (error) {
                // Fallback to configured titles
                headers = this.displayConfigs.map(config => config.title);
            }
        } else {
            headers = this.displayConfigs.map(config => config.title);
        }

        const range = this.sheet.getRange(rowIndex, 1, 1, headers.length);
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
    writeMergedHeader(rowIndex, text, options = {}) {
        const { 
            backgroundColor = STYLING.colors.header, 
            textColor = STYLING.colors.text.white, 
            fontSize = STYLING.fontSize.timeslot,
            fontWeight = "bold",
            mergeAll = true
        } = options;

        const numColumns = mergeAll ? this.displayConfigs.length : this.displayConfigs.length - 1;
        const range = this.sheet.getRange(rowIndex, 1, 1, numColumns);
        
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
    setColumnWidths() {
        this.displayConfigs.forEach((config, index) => {
            if (config.width !== 'auto') {
                this.sheet.setColumnWidth(index + 1, config.width);
            }
        });
    }

    /**
     * Auto-resize all columns (only for actual data columns)
     */
    autoResizeColumns() {
        try {
            const numColumns = this.displayConfigs.length;
            this.sheet.autoResizeColumns(1, numColumns);
            
            // Add 10px to each column for better spacing
            for (let col = 1; col <= numColumns; col++) {
                const currentWidth = this.sheet.getColumnWidth(col);
                this.sheet.setColumnWidth(col, currentWidth + 10);
            }
            
            Logger.log(`Auto-resized ${numColumns} columns in sheet: ${this.sheet.getName()}`);
        } catch (error) {
            Logger.log(`Error auto-resizing columns: ${error.message}`);
        }
    }

    /**
     * Auto-resize rows
     */
    autoResizeRows() {
        try {
            const lastRow = this.sheet.getLastRow();
            if (lastRow > 0) {
                this.sheet.autoResizeRows(1, lastRow);
                Logger.log(`Auto-resized ${lastRow} rows in sheet: ${this.sheet.getName()}`);
            }
        } catch (error) {
            Logger.log(`Error auto-resizing rows: ${error.message}`);
        }
    }

    /**
     * Get the total number of columns
     */
    getTotalColumns() {
        return this.displayConfigs.length;
    }

    /**
     * Get column index by data key (1-indexed)
     */
    getColumnIndex(key) {
        return this.displayConfigs.findIndex(config => config.key === key) + 1;
    }

    /**
     * Get column width by data key
     */
    getColumnWidth(key) {
        const config = this.displayConfigs.find(config => config.key === key);
        return config ? config.width : 'auto';
    }

    /**
     * Get column type by data key
     */
    getColumnType(key) {
        const config = this.displayConfigs.find(config => config.key === key);
        return config ? config.type : null;
    }

    /**
     * Get all available column keys
     */
    getAvailableKeys() {
        return this.displayConfigs.map(config => config.key);
    }

    /**
     * Check if a key exists in the configuration
     */
    hasKey(key) {
        return this.displayConfigs.some(config => config.key === key);
    }
}

/**
 * Factory function to create a ColumnWriter instance
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to write to
 * @returns {ColumnWriter} - A new ColumnWriter instance
 */
export function createColumnWriter(sheet) {
    return new ColumnWriter(sheet);
} 