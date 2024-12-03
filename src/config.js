//DEFAULT APP SETTINGS
const DEFAULT_TIME_SLOTS = ["6pm PST/9pm EST", "7pm PST/10pm EST"];
const GAME_DAY = "Saturday";
const TEAM_SIZE = 5;
const SPLIT_LOBBIES_BY_RANK = false;
const MINIMUM_SUB_COUNT = 2; //defines how many sub players must be available for each lobby before a new lobby can be made

//SPREADHSHEET COLUMNS
const COLUMN_TIMESTAMP = 0;
const COLUMN_DISCORDNAME = 1;
const COLUMN_RIOTID = 2;
const COLUMN_PRONOUNS = 3;
const COLUMN_TIMESLOTS = 4;
const COLUMN_MULTIPLEGAMES = 5;
const COLUMN_WILLSUB = 6;
const COLUMN_WILLHOST = 7;
const COLUMN_DUOREQUEST = 8;
const COLUMN_CURRENTRANK = 9;
const COLUMN_PEAKRANK = 10;

//GETTERS/SETTERS
/**
 * Gets the stored script property if it exists. If it doesn't, gets the default config value for the given prop name
 *
 * @param {string} name - the name of the value to fetch
 */
export function getScriptPropByName(name) {
    const scriptProperties = PropertiesService.getScriptProperties();
    let scriptCol, defaultCol = '';
    switch (name.toLowerCase()) {
        case 'column_timestamp':
            scriptCol = scriptProperties.getProperty('COLUMN_TIMESTAMP')
            defaultCol = COLUMN_TIMESTAMP;
            break;
        case 'column_discordname':
            scriptCol = scriptProperties.getProperty('COLUMN_DISCORDNAME')
            defaultCol = COLUMN_DISCORDNAME;
            break;
        case 'column_riotid':
            scriptCol = scriptProperties.getProperty('COLUMN_RIOTID')
            defaultCol = COLUMN_RIOTID;
            break;
        case 'column_pronouns':
            scriptCol = scriptProperties.getProperty('COLUMN_PRONOUNS')
            defaultCol = COLUMN_PRONOUNS;
            break;
        case 'column_timeslots':
            scriptCol = scriptProperties.getProperty('COLUMN_TIMESLOTS')
            defaultCol = COLUMN_TIMESLOTS;
            break;
        case 'column_multiplegames':
            scriptCol = scriptProperties.getProperty('COLUMN_MULTIPLEGAMES')
            defaultCol = COLUMN_MULTIPLEGAMES;
            break;
        case 'column_willsub':
            scriptCol = scriptProperties.getProperty('COLUMN_WILLSUB')
            defaultCol = COLUMN_WILLSUB;
            break;
        case 'column_willhost':
            scriptCol = scriptProperties.getProperty('COLUMN_WILLHOST')
            defaultCol = COLUMN_WILLHOST;
            break;
        case 'column_duorequest':
            scriptCol = scriptProperties.getProperty('COLUMN_DUOREQUEST')
            defaultCol = COLUMN_DUOREQUEST;
            break;
        case 'column_currentrank':
            scriptCol = scriptProperties.getProperty('COLUMN_CURRENTRANK')
            defaultCol = COLUMN_CURRENTRANK;
            break;
        case 'column_peakrank':
            scriptCol = scriptProperties.getProperty('COLUMN_PEAKRANK')
            defaultCol = COLUMN_PEAKRANK;
            break;
        case 'time_slots':
            scriptCol = scriptProperties.getProperty('TIME_SLOTS')
            defaultCol = DEFAULT_TIME_SLOTS;
            break;
        case 'team_size':
            scriptCol = scriptProperties.getProperty('TEAM_SIZE')
            defaultCol = TEAM_SIZE;
            break;
        case 'split_lobbies_by_rank':
            scriptCol = scriptProperties.getProperty('SPLIT_LOBBIES_BY_RANK')
            defaultCol = SPLIT_LOBBIES_BY_RANK;
            break;
        case 'game_day':
            scriptCol = scriptProperties.getProperty('GAME_DAY')
            defaultCol = GAME_DAY;
            break;
        case 'minimum_sub_count':
            scriptCol = scriptProperties.getProperty('MINIMUM_SUB_COUNT')
            defaultCol = MINIMUM_SUB_COUNT;
            break;
        default:
            throw new Error("Could not find the requested config variable");
    }
    return scriptCol ? scriptCol : defaultCol;
}

/**
 * Sets a script property's value for the given prop name
 *
 * @param {string} name - the name of config/prop
 */
export function setScriptPropByName(name, value) {
    const scriptProperties = PropertiesService.getScriptProperties();
    let scriptCol, defaultCol = '';
    switch (name.toLowerCase()) {
        case 'column_timestamp':
            scriptProperties.setProperty('COLUMN_TIMESTAMP', value);
            break;
        case 'column_discordname':
            scriptProperties.setProperty('COLUMN_DISCORDNAME', value);
            break;
        case 'column_riotid':
            scriptProperties.setProperty('COLUMN_RIOTID', value);
            break;
        case 'column_pronouns':
            scriptProperties.setProperty('COLUMN_PRONOUNS', value);
            break;
        case 'column_timeslots':
            scriptProperties.setProperty('COLUMN_TIMESLOTS', value);
            break;
        case 'column_multiplegames':
            scriptProperties.setProperty('COLUMN_MULTIPLEGAMES', value);
            break;
        case 'column_willsub':
            scriptProperties.setProperty('COLUMN_WILLSUB', value);
            break;
        case 'column_willhost':
            scriptProperties.setProperty('COLUMN_WILLHOST', value);
            break;
        case 'column_duorequest':
            scriptProperties.setProperty('COLUMN_DUOREQUEST', value);
            break;
        case 'column_currentrank':
            scriptProperties.setProperty('COLUMN_CURRENTRANK', value);
            break;
        case 'column_peakrank':
            scriptProperties.setProperty('COLUMN_PEAKRANK', value);
            break;
        case 'time_slots':
            scriptProperties.setProperty('TIME_SLOTS', value);
            break;
        case 'team_size':
            scriptProperties.setProperty('TEAM_SIZE', value);
            break;
        case 'split_lobbies_by_rank':
            scriptProperties.setProperty('SPLIT_LOBBIES_BY_RANK', value);
            break;
        case 'game_day':
            scriptProperties.setProperty('GAME_DAY', value);
            break;
        case 'minimum_sub_count':
            scriptProperties.setProperty('MINIMUM_SUB_COUNT', value);
            break;
        default:
            throw new Error("Could not find the requested config variable");
    }
}
