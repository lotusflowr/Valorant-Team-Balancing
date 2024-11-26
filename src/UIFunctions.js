import {
    getTimeSlots,
    setTimeSlots,
    getGameDay,
    setGameDay,
} from './TimeSlotManager.js';

import { sortPlayersIntoBalancedTeams } from './TeamBalancer.js';
import { generateDiscordPings } from './DiscordPings.js';
import { clearResponses } from './Utilities.js';

import { DEFAULT_TIME_SLOTS, TIME_SLOTS_COLUMN, TEAM_SIZE } from './config.js';

/***** UI FUNCTIONS *****/

/**
 * Starting point
 * See Google Workspace Scripts reference
 */
export function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('SCRIPTS')
        .addItem('Manage Time Slots', 'manageTimeSlots')
        .addItem('Balance Teams and Players', 'sortPlayersIntoBalancedTeams')
        .addItem('Generate Discord Pings', 'generateDiscordPings')
        .addItem('Clear Responses', 'clearResponses')
        .addToUi();
}

/**
 * Creates a UI for managing the timeslots using UI prompts
 */
export function manageTimeSlots() {
    const ui = SpreadsheetApp.getUi();
    const GAME_DAY = getGameDay();
    const TIME_SLOTS = getTimeSlots();
    const result = ui.prompt(
        'Manage Time Slots and Game Day',
        `Current settings:\n` +
        `Game Day: ${GAME_DAY}\n` +
        `Time Slots: ${TIME_SLOTS.join(", ")}\n\n` +
        'Enter your choice:\n' +
        '[1]: Manage Time Slots\n' +
        '[2]: Change Game Day\n',
        ui.ButtonSet.OK_CANCEL
    );

    if (result.getSelectedButton() == ui.Button.OK) {
        const choice = result.getResponseText().trim().toUpperCase();

        switch (choice) {
            case '1':
                manageTimeSlotsMenu();
                break;
            case '2':
                changeGameDay();
                break;
            default:
                ui.alert('Invalid Choice', 'Please enter 1, 2, or click on Cancel.', ui.ButtonSet.OK);
                manageTimeSlots(); // Recursive call to try again
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
export function manageTimeSlotsMenu() {
    const ui = SpreadsheetApp.getUi();
    const TIME_SLOTS = getTimeSlots();
    const result = ui.prompt(
        'Manage Time Slots',
        `Current Time Slots: ${TIME_SLOTS.join(", ")}\n\n` +
        'Enter your choice:\n' +
        '[1]: Automatically determines the time slots from the "Time Slots" column (if available)\n' +
        '[2]: Manually input time slots\n' +
        '[3]: Cancel (Keep current time slots)',
        ui.ButtonSet.OK_CANCEL
    );

    if (result.getSelectedButton() == ui.Button.OK) {
        const choice = result.getResponseText().trim().toUpperCase();

        switch (choice) {
            case '1':
                setAutomaticTimeSlots();
                break;
            case '2':
                manuallyInputTimeSlots();
                break;
            case '3':
                ui.alert('Cancelled', 'Time slot management was cancelled. Current time slots remain unchanged.', ui.ButtonSet.OK);
                break;
            default:
                ui.alert('Invalid Choice', 'Please enter 1, 2, or 3.', ui.ButtonSet.OK);
                manageTimeSlotsMenu(); // Recursive call to try again
        }
    } else {
        // User clicked Cancel or closed the dialog
        ui.alert('Cancelled', 'Time slot management was cancelled. Current time slots remain unchanged.', ui.ButtonSet.OK);
    }
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
 * Allows the user to change the timeslots using values that they manually provide
 * Called from user input
 */
export function manuallyInputTimeSlots() {
    const ui = SpreadsheetApp.getUi();
    const result = ui.prompt(
        'Set Custom Time Slots',
        'Please enter time slots separated by commas (e.g., "6pm PST/9pm EST, 7pm PST/10pm EST"):',
        ui.ButtonSet.OK_CANCEL
    );

    const button = result.getSelectedButton();
    const text = result.getResponseText();

    if (button == ui.Button.OK) {
        if (text) {
            const newTimeSlots = text.split(',').map(slot => slot.trim());
            setTimeSlots(newTimeSlots); // Store the new time slots
            ui.alert('Time Slots Set', `Time slots have been set to: ${newTimeSlots.join(", ")}`, ui.ButtonSet.OK);
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
export function setAutomaticTimeSlots() {
    const ui = SpreadsheetApp.getUi();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0]; // Get the first sheet

    // Get time slots from the 5th column
    const timeSlotsRange = sheet.getRange(2, TIME_SLOTS_COLUMN, sheet.getLastRow() - 1, 1);
    const timeSlotValues = timeSlotsRange.getValues().flat().filter(Boolean);

    // Split any combined time slots
    const splitTimeSlots = timeSlotValues.flatMap(slot => slot.split(',').map(s => s.trim()));

    // Use Set to remove duplicates, then convert back to array
    const uniqueTimeSlots = [...new Set(splitTimeSlots)];

    if (uniqueTimeSlots.length > 0) {
        setTimeSlots(uniqueTimeSlots); // Store the new time slots
        ui.alert('Time Slots Updated', `Time slots have been set to: ${uniqueTimeSlots.join(", ")}`, ui.ButtonSet.OK);
    } else {
        ui.alert('No Time Slots Found', 'No time slots were found in the "Time Slots" column. Using current time slots.', ui.ButtonSet.OK);
    }
}
