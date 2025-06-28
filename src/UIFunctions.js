import {
    getGameDay,
    setGameDay,
} from './TimeSlotManager.js';

import { sortPlayersIntoBalancedTeams } from './TeamBalancer.js';
import { generateDiscordPings } from './DiscordPings.js';
import { clearResponses } from './Utilities.js';
import { 
    saveColumnConfiguration,
    loadColumnConfiguration,
    resetColumnConfiguration,
    openColumnConfigurationSheet,
    showFormResponseHeaders
} from './ColumnConfigManager.js';

import { TEAM_SIZE } from './config.js';

/***** UI FUNCTIONS *****/

/**
 * Starting point
 * See Google Workspace Scripts reference
 */
export function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('SCRIPTS')
        .addItem('Balance Teams and Players', 'sortPlayersIntoBalancedTeams')
        .addItem('Generate Discord Pings', 'generateDiscordPings')
        .addSeparator()
        .addItem('Open Column Configuration', 'openColumnConfigurationSheet')
        .addItem('Save & Apply Column Config', 'saveColumnConfiguration')
        .addItem('Reset Column Config', 'resetColumnConfiguration')
        .addSeparator()
        .addItem('Manage Game Day', 'manageGameDay')
        .addItem('Clear Responses', 'clearResponses')
        .addToUi();
}

/**
 * Creates a UI for managing column configuration
 */
export function manageColumnConfiguration() {
    const ui = SpreadsheetApp.getUi();
    const result = ui.prompt(
        'Manage Column Configuration',
        `Column Configuration Management\n\n` +
        'Choose an option:\n' +
        '[1]: Open Column Configuration Sheet\n' +
        '[2]: Save Current Configuration\n' +
        '[3]: Load Saved Configuration\n' +
        '[4]: Reset to Defaults\n' +
        '[5]: Cancel',
        ui.ButtonSet.OK_CANCEL
    );

    if (result.getSelectedButton() == ui.Button.OK) {
        const choice = result.getResponseText().trim().toUpperCase();

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
                manageColumnConfiguration(); // Recursive call to try again
        }
    } else {
        ui.alert('Cancelled', 'Column configuration management was cancelled.', ui.ButtonSet.OK);
    }
}

/**
 * Creates a UI for managing the timeslots using UI prompts
 * @deprecated - Time slots are now managed through column configuration
 */
export function manageTimeSlots() {
    const ui = SpreadsheetApp.getUi();
    ui.alert(
        'Time Slots Management',
        'Time slots are now managed through the Column Configuration system.\n\n' +
        'To configure time slots:\n' +
        '1. Use "Open Column Configuration"\n' +
        '2. Find the "timeSlots" row\n' +
        '3. Set the "Source Column" to the column containing time slot data (e.g., "E")\n' +
        '4. Save the configuration\n\n' +
        'Time slots will be automatically extracted from your form responses.',
        ui.ButtonSet.OK
    );
}

export function changeGameDay() {
    const ui = SpreadsheetApp.getUi();
    const GAME_DAY = getGameDay();
    const result = ui.prompt(
        'Change Game Day',
        `Current Game Day: ${GAME_DAY}\n\n` +
        'Enter the new game day (e.g., "Sunday", "Monday", etc.):',
        ui.ButtonSet.OK_CANCEL
    );

    if (result.getSelectedButton() == ui.Button.OK) {
        const newGameDay = result.getResponseText().trim();
        if (newGameDay) {
            setGameDay(newGameDay);
            ui.alert('Game Day Updated', `Game day has been set to: ${newGameDay}`, ui.ButtonSet.OK);
        } else {
            ui.alert('No Input', 'No game day was entered. Keeping the current game day.', ui.ButtonSet.OK);
        }
    } else {
        ui.alert('Cancelled', 'Game day change was cancelled. Current game day remains unchanged.', ui.ButtonSet.OK);
    }
}

/**
 * Manages the game day setting
 */
export function manageGameDay() {
    const ui = SpreadsheetApp.getUi();
    const GAME_DAY = getGameDay();
    const result = ui.prompt(
        'Manage Game Day',
        `Current Game Day: ${GAME_DAY}\n\n` +
        'Enter the new game day (e.g., "Sunday", "Monday", etc.):',
        ui.ButtonSet.OK_CANCEL
    );

    if (result.getSelectedButton() == ui.Button.OK) {
        const newGameDay = result.getResponseText().trim();
        if (newGameDay) {
            setGameDay(newGameDay);
            ui.alert('Game Day Updated', `Game day has been set to: ${newGameDay}`, ui.ButtonSet.OK);
        } else {
            ui.alert('No Input', 'No game day was entered. Keeping the current game day.', ui.ButtonSet.OK);
        }
    } else {
        ui.alert('Cancelled', 'Game day change was cancelled. Current game day remains unchanged.', ui.ButtonSet.OK);
    }
}
