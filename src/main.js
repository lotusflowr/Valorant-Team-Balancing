// Import UI functions
import {
    onOpen,
    manageTimeSlots,
    printPlayersAsTestCases
} from './UIFunctions.js';

// Import team balancer functions
import {
    sortPlayersIntoBalancedTeams
} from './TeamBalancer.js';

// Import Discord pings functions
import {
    generateDiscordPings
} from './DiscordPings.js';

// Import utilities
import {
    clearResponses
} from './Utilities.js';

// Expose functions to the global scope for Google Apps Script
var global = {};
global.onOpen = onOpen;
global.manageTimeSlots = manageTimeSlots;
global.sortPlayersIntoBalancedTeams = sortPlayersIntoBalancedTeams;
global.generateDiscordPings = generateDiscordPings;
global.clearResponses = clearResponses;
global.printPlayersAsTestCases = printPlayersAsTestCases;
    
