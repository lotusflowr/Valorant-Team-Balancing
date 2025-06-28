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
    restoreDefaultConfiguration,
    restoreFromLastSave,
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
        .addItem('⚖️ Balance Teams and Players', 'sortPlayersIntoBalancedTeams')
        .addItem('🔔 Generate Discord Pings', 'generateDiscordPings')
        .addSeparator()
        .addItem('⚙️ Load Column Configuration', 'openColumnConfigurationSheet')
        .addItem('💾 Save & Apply Config', 'saveColumnConfiguration')
        .addItem('♻️ Restore from Last Save', 'restoreFromLastSave')
        .addItem('🧹 Reset Config to Default', 'restoreDefaultConfiguration')
        .addSeparator()
        .addItem('📅 Change Game Day', 'changeGameDay')
        .addItem('🧽 Clear Responses', 'clearResponses')
        .addToUi();
}

export function changeGameDay() {
    const ui = SpreadsheetApp.getUi();
    const GAME_DAY = getGameDay();
    const result = ui.prompt(
        'Change Game Day',
        `Current Game Day: ${GAME_DAY}\n\n` +
        'Choose a day:\n' +
        '[1]: Sunday\n' +
        '[2]: Monday\n' +
        '[3]: Tuesday\n' +
        '[4]: Wednesday\n' +
        '[5]: Thursday\n' +
        '[6]: Friday\n' +
        '[7]: Saturday\n\n' +
        'Enter a number (1-7):',
        ui.ButtonSet.OK_CANCEL
    );

    if (result.getSelectedButton() == ui.Button.OK) {
        const choice = result.getResponseText().trim();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        if (choice >= 1 && choice <= 7) {
            const selectedDay = days[choice - 1];
            setGameDay(selectedDay);
            ui.alert('Game Day Updated', `Game day has been set to: ${selectedDay}`, ui.ButtonSet.OK);
        } else {
            ui.alert('Invalid Choice', 'Please enter a number between 1 and 7.', ui.ButtonSet.OK);
        }
    } else {
        ui.alert('Cancelled', 'Game day change was cancelled. Current game day remains unchanged.', ui.ButtonSet.OK);
    }
}