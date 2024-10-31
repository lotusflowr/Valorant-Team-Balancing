// Import constants
import { DEFAULT_TIME_SLOTS, TIME_SLOTS_COLUMN, TEAM_SIZE } from './config.js';

// Import UI functions
import {
    onOpen,
    manageTimeSlots,
    manageTimeSlotsMenu,
    changeGameDay,
    manuallyInputTimeSlots,
    setAutomaticTimeSlots
} from './uiFunctions.js';

// Import time slot manager functions
import {
    getTimeSlots,
    setTimeSlots,
    getGameDay,
    setGameDay
} from './timeSlotManager.js';

// Import player data functions
import {
    getPlayersData,
    writeTeamsToSheet
} from './playerData.js';

// Import team balancer functions
import {
    sortPlayersIntoBalancedTeams,
    createOptimalTeams,
    createOptimalTeamsForTimeSlot,
    trySwapPlayers,
    getTeamSpread
} from './teamBalancer.js';

// Import Discord pings functions
import {
    generateDiscordPings,
    writeDiscordPingsToSheet
} from './discordPings.js';

// Import utilities
import {
    getRankValue,
    getRankName,
    setConditionalFormatting,
    getContrastColor,
    clearResponses
} from './utilities.js';


// Expose functions to the global scope for Google Apps Script
global.onOpen = onOpen;
global.manageTimeSlots = manageTimeSlots;
global.sortPlayersIntoBalancedTeams = sortPlayersIntoBalancedTeams;
global.generateDiscordPings = generateDiscordPings;
global.clearResponses = clearResponses;
