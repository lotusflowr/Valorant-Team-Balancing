import { getScriptPropByName, setScriptPropByName } from './config.js';

export function getTimeSlots() {
    return getScriptPropByName('TIME_SLOTS');
}

export function setTimeSlots(newTimeSlots) {
    setScriptPropByName('TIME_SLOTS', newTimeSlots);
}

export function getGameDay() {
    return getScriptPropByName('GAME_DAY');
}

export function setGameDay(newGameDay) {
    setScriptPropByName('GAME_DAY', newGameDay);
}
