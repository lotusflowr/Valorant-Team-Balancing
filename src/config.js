// ============================================================================
// CORE SETTINGS
// ============================================================================
export const TEAM_SIZE = 5;
export const DEFAULT_GAME_DAY = "Saturday";

// ============================================================================
// INPUT SHEET CONFIGURATION (Player Data Sheet)
// ============================================================================
export const INPUT_SHEET_CONFIG = {
    // Column mapping for input sheet (0-indexed)
    columns: {
        TIMESTAMP: 0,           // Column A - Timestamp
        DISCORD_USERNAME: 1,    // Column B - Discord Username
        RIOT_ID: 2,            // Column C - Riot ID
        PRONOUNS: 3,           // Column D - Pronouns
        TIME_SLOTS: 4,         // Column E - Time slots
        MULTIPLE_GAMES: 5,     // Column F - Multiple Games
        WILL_SUB: 6,           // Column G - Substitute
        LOBBY_HOST: 7,         // Column H - Lobby Host
        DUO: 8,                // Column I - Duo
        CURRENT_RANK: 9,       // Column J - Current Competitive Rank
        PEAK_RANK: 10,         // Column K - Peak Competitive Rank
        COMMENTS: 11           // Column L - (Optional) Comments
    },
    
    // Column names for validation and logging
    columnNames: {
        0: "Timestamp",           // Column A
        1: "Discord Username",    // Column B
        2: "Riot ID",            // Column C
        3: "Pronouns",           // Column D
        4: "Time slots",         // Column E
        5: "Multiple Games",     // Column F
        6: "Substitute",         // Column G
        7: "Lobby Host",         // Column H
        8: "Duo",                // Column I
        9: "Current Competitive Rank", // Column J
        10: "Peak Competitive Rank",   // Column K
        11: "(Optional) Comments"      // Column L
    }
};

// ============================================================================
// OUTPUT SHEET CONFIGURATION (Teams Sheet)
// ============================================================================
export const OUTPUT_SHEET_CONFIG = {
    // Flexible column order - you can reorder these as needed
    // Each entry defines: { key: 'dataKey', width: pixelWidth|'auto', title: 'Header Text', type: 'data|calculated|display' }
    columns: [
        { key: 'riotID', width: 'auto', title: 'Riot ID', type: 'data' },
        { key: 'discordUsername', width: 'auto', title: 'Discord', type: 'data' },
        { key: 'currentRank', width: 'auto', title: 'Current Rank', type: 'data' },
        { key: 'peakRank', width: 'auto', title: 'Peak Rank', type: 'data' },
        { key: 'lobbyHost', width: 'auto', title: 'Lobby Host', type: 'data' },
        { key: 'averageRank', width: 'auto', title: 'Avg Rank', type: 'calculated' }
    ],
    
    // Total number of columns (calculated automatically)
    get totalColumns() {
        return this.columns.length;
    },
    
    // Get column index by key (1-indexed for getRange)
    getColumnIndex(key) {
        return this.columns.findIndex(col => col.key === key) + 1;
    },
    
    // Get column width by key
    getColumnWidth(key) {
        const col = this.columns.find(col => col.key === key);
        return col ? col.width : 'auto'; // default to auto
    },
    
    // Get all column titles
    getColumnTitles() {
        return this.columns.map(col => col.title);
    },
    
    // Get data keys in order
    getDataKeys() {
        return this.columns.map(col => col.key);
    },

    // Get column type by key
    getColumnType(key) {
        const col = this.columns.find(col => col.key === key);
        return col ? col.type : 'data';
    }
};

// ============================================================================
// TEAMS SHEET CONFIGURATION (for Discord Pings)
// ============================================================================
export const TEAMS_SHEET_CONFIG = {
    columns: {
        DISCORD: 0,
        RIOT_ID: 1,
        LOBBY_HOST: 4
    },
    
    columnNames: {
        0: "Discord",
        1: "Riot ID", 
        4: "Lobby Host"
    }
};

// ============================================================================
// DISCORD PINGS CONFIGURATION
// ============================================================================
export const DISCORD_PINGS_CONFIG = {
    column: 1, // Single column output
    minWidth: 300,
    rowHeight: 21
};

// ============================================================================
// VISUAL STYLING
// ============================================================================
export const STYLING = {
    // Colors
    colors: {
        team: ["#FFF2CC", "#D9EAD3", "#C9DAF8", "#F4CCCC", "#FFD966", "#B6D7A8", "#9FC5E8", "#EA9999"],
        header: "#4A86E8",
        subHeader: "#A4C2F4",
        substitute: "#F3F3F3",
        discord: {
            title: "#002B80",
            timeslot: "#4A86E8",
            lobbyHost: "#CFE2F3",
            substitutes: "#A9D0F5"
        },
        text: {
            white: "#ffffff",
            black: "#000000"
        },
        border: "#000000"
    },
    
    // Font sizes
    fontSize: {
        title: 18,
        timeslot: 14,
        teamName: 12,
        columnHeader: 11,
        subHeader: 11,
        player: 11,
        default: 11
    },
    
    // Row heights
    rowHeight: {
        default: 21
    }
};

// ============================================================================
// VALIDATION RULES
// ============================================================================
export const VALIDATION = {
    minPlayersRequired: 2
}; 