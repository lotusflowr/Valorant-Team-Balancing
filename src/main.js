// Import UI functions
import {
    onOpen,
    manageColumnConfiguration
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

// Import column configuration functions
import {
    saveColumnConfiguration,
    loadColumnConfiguration,
    resetColumnConfiguration,
    openColumnConfigurationSheet,
    showFormResponseHeaders
} from './ColumnConfigManager.js';

// Expose functions to the global scope for Google Apps Script
var global = {};
global.onOpen = onOpen;
global.manageColumnConfiguration = manageColumnConfiguration;
global.sortPlayersIntoBalancedTeams = sortPlayersIntoBalancedTeams;
global.generateDiscordPings = generateDiscordPings;
global.clearResponses = clearResponses;
global.saveColumnConfiguration = saveColumnConfiguration;
global.loadColumnConfiguration = loadColumnConfiguration;
global.resetColumnConfiguration = resetColumnConfiguration;
global.openColumnConfigurationSheet = openColumnConfigurationSheet;
global.showFormResponseHeaders = showFormResponseHeaders;
