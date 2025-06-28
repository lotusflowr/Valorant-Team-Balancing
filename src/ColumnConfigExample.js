import { OUTPUT_SHEET_CONFIG } from './config.js';

/**
 * Example: How to modify column order and configuration
 * 
 * NEW: You can now edit columns directly in the spreadsheet!
 * 
 * 1. Go to SCRIPTS menu → Manage Column Configuration → Open Column Configuration Sheet
 * 2. Edit the columns directly in the spreadsheet
 * 3. Save using SCRIPTS menu → Save Column Configuration
 * 
 * The configuration sheet will have these columns:
 * - Column Key: The data key (e.g., 'riotID', 'discordUsername')
 * - Title: The header text shown in the output
 * - Width: Column width in pixels
 * - Type: 'data' (from player data), 'calculated' (computed), or 'display' (show only)
 * - Order: Column order (1=first, 2=second, etc.)
 * - Description: What the column contains
 * 
 * Example modifications you can make in the spreadsheet:
 */

// Example 1: Move Discord to first column
// In the spreadsheet, change the Order column:
// - discordUsername: Order = 1
// - riotID: Order = 2
// - currentRank: Order = 3
// etc.

// Example 2: Add a new "Preferred Agents" column
// Add a new row in the spreadsheet:
// - Column Key: preferredAgents
// - Title: Preferred Agents
// - Width: 120
// - Type: display
// - Order: 8
// - Description: Player's preferred agents

// Example 3: Remove a column
// Simply delete the row from the spreadsheet or set Order to 0

/**
 * STEP-BY-STEP GUIDE: How to add a "Preferred Agents" column
 * 
 * 1. Open the Column Configuration sheet:
 *    SCRIPTS → Manage Column Configuration → Open Column Configuration Sheet
 * 
 * 2. Add a new row at the bottom of the configuration table:
 *    - Column Key: preferredAgents
 *    - Title: Preferred Agents
 *    - Width: 120
 *    - Type: display (use dropdown)
 *    - Order: 8 (or wherever you want it to appear)
 *    - Description: Player's preferred agents
 * 
 * 3. Save the configuration:
 *    SCRIPTS → Save Column Configuration
 * 
 * 4. The column will now appear in your team output sheets!
 * 
 * WHAT HAPPENS:
 * - The "Preferred Agents" column will appear in position 8
 * - It will be empty (no data source)
 * - You can manually type in agent preferences
 * - The column will persist in all future team generations
 */

/**
 * COLUMN TYPE EXPLANATION:
 * 
 * data: Gets value from player data
 * - Example: riotID, discordUsername, currentRank
 * - These pull from the form responses
 * 
 * calculated: Computed value
 * - Example: averageRank (calculated from current + peak rank)
 * - These are automatically computed
 * 
 * display: Show only, no data source
 * - Example: preferredAgents, notes, role
 * - These appear empty and ready for manual input
 * - Perfect for information you want to add manually
 */

/**
 * COMMON USE CASES:
 * 
 * 1. Add "Preferred Agents":
 *    Key: preferredAgents, Type: display, Order: 8
 * 
 * 2. Add "Notes":
 *    Key: notes, Type: display, Order: 9
 * 
 * 3. Add "Role":
 *    Key: role, Type: display, Order: 10
 * 
 * 4. Move Discord to first:
 *    Find discordUsername row, change Order to 1
 * 
 * 5. Remove Lobby Host:
 *    Delete the lobbyHost row or set Order to 0
 */

/**
 * AVAILABLE COLUMN KEYS:
 * 
 * Data columns (from form responses):
 * - riotID, discordUsername, currentRank, peakRank
 * - lobbyHost, pronouns, multipleGames, willSub, duo
 * 
 * Calculated columns:
 * - averageRank
 * 
 * Display columns (you can add these):
 * - preferredAgents, notes, role, availability
 * - Any custom key you want (e.g., "teamNotes", "captain")
 */

/**
 * TROUBLESHOOTING:
 * 
 * Q: My new column doesn't appear?
 * A: Make sure you saved the configuration and regenerated teams
 * 
 * Q: Column appears but is empty?
 * A: That's correct for "display" type columns - they're ready for manual input
 * 
 * Q: Column order is wrong?
 * A: Check the "Order" values - lower numbers appear first
 * 
 * Q: Want to remove a column?
 * A: Delete the row or set Order to 0, then save
 */

/**
 * How to use the ColumnWriter with the new system:
 * 
 * 1. The ColumnWriter automatically uses the configured column order
 * 2. Headers are automatically generated from the 'title' property
 * 3. Data is automatically mapped based on the 'key' property
 * 4. Column widths are automatically applied
 * 5. Different column types are handled automatically
 * 
 * Example usage:
 * 
 * const writer = createColumnWriter(sheet);
 * 
 * // Write headers (automatically uses configured titles)
 * writer.writeHeaders(1);
 * 
 * // Write player data (automatically maps to correct columns)
 * writer.writePlayerRow(2, {
 *     riotID: "Player#1234",
 *     discordUsername: "@player",
 *     currentRank: 15, // Will be converted to "Gold 1"
 *     peakRank: 18,    // Will be converted to "Platinum 2"
 *     lobbyHost: "Yes",
 *     averageRank: 16.5,
 *     preferredAgents: "Jett, Reyna, Phoenix" // New display column
 * });
 * 
 * // Set column widths (automatically uses configured widths)
 * writer.setColumnWidths();
 */

/**
 * Benefits of the new spreadsheet-based system:
 * 
 * 1. VISUAL EDITING: Edit columns directly in the spreadsheet
 * 2. NO CODE CHANGES: Modify columns without touching code
 * 3. IMMEDIATE FEEDBACK: See changes instantly
 * 4. EASY REORDERING: Just change the Order column
 * 5. EASY ADDITION: Add new rows for new columns
 * 6. EASY REMOVAL: Delete rows or set Order to 0
 * 7. DATA VALIDATION: Dropdown menus for Type and Order
 * 8. PERSISTENCE: Settings are saved and loaded automatically
 * 9. RESET CAPABILITY: Reset to defaults anytime
 * 10. TYPE SAFETY: Different column types (data, calculated, display)
 * 
 * Column Types:
 * - 'data': Gets value from player data (e.g., riotID, discordUsername)
 * - 'calculated': Computed value (e.g., averageRank)
 * - 'display': Show only, no data source (e.g., preferredAgents)
 */

/**
 * Available column keys you can use:
 * 
 * Data columns (from player input):
 * - riotID: Player's Riot ID
 * - discordUsername: Discord username
 * - currentRank: Current competitive rank
 * - peakRank: Peak competitive rank
 * - lobbyHost: Whether player can host lobby
 * - pronouns: Player pronouns
 * - multipleGames: Can play multiple games
 * - willSub: Willing to be substitute
 * - duo: Duo partner preference
 * 
 * Calculated columns:
 * - averageRank: Average of current and peak rank
 * 
 * Display columns (you can add these):
 * - preferredAgents: Player's preferred agents
 * - notes: Any additional notes
 * - role: Player's preferred role
 * - availability: Player's availability
 * 
 * To add a new display column:
 * 1. Add a new row in the Column Configuration sheet
 * 2. Set Column Key to your new key (e.g., 'preferredAgents')
 * 3. Set Type to 'display'
 * 4. Set Order to where you want it to appear
 * 5. Save the configuration
 * 6. The column will appear in your output (empty, but ready for data)
 */ 