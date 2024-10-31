import { DEFAULT_TIME_SLOTS } from './config.js';

export function getTimeSlots() {
    const scriptProperties = PropertiesService.getScriptProperties();
    const storedTimeSlots = scriptProperties.getProperty('TIME_SLOTS');
    return storedTimeSlots ? JSON.parse(storedTimeSlots) : DEFAULT_TIME_SLOTS;
}

export function setTimeSlots(newTimeSlots) {
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('TIME_SLOTS', JSON.stringify(newTimeSlots));
}

export function getGameDay() {
    const scriptProperties = PropertiesService.getScriptProperties();
    return scriptProperties.getProperty('GAME_DAY') || "Saturday"; // Default to Saturday if not set
}

export function setGameDay(newGameDay) {
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('GAME_DAY', newGameDay);
}
