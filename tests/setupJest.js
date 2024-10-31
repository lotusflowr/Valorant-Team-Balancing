// tests/setupJest.js

// Mock PropertiesService
global.PropertiesService = {
    getScriptProperties: jest.fn().mockReturnValue({
        getProperty: jest.fn((key) => {
            if (key === 'TIME_SLOTS') {
                return JSON.stringify(["7pm CEST/8pm WEST", "8pm CEST/9pm WEST"]); // Default or test time slots
            }
            if (key === 'GAME_DAY') {
                return "Saturday"; // Default game day
            }
            return null;
        }),
        setProperty: jest.fn(),
    }),
};

// Mock Logger
global.Logger = {
    log: jest.fn()
};

// Mock SpreadsheetApp
global.SpreadsheetApp = {
    getUi: jest.fn().mockReturnValue({
        createMenu: jest.fn().mockReturnThis(),
        addItem: jest.fn().mockReturnThis(),
        addToUi: jest.fn(),
        prompt: jest.fn().mockReturnValue({
            getSelectedButton: jest.fn().mockReturnValue("OK"),
            getResponseText: jest.fn().mockReturnValue("1"),
        }),
        alert: jest.fn(),
        ButtonSet: { OK: 'OK', CANCEL: 'CANCEL', YES_NO: 'YES_NO' } // Add ButtonSet here
    }),
    getActiveSpreadsheet: jest.fn().mockReturnValue({
        getSheets: jest.fn().mockReturnValue([
            {
                getRange: jest.fn().mockReturnValue({
                    getValues: jest.fn().mockReturnValue([["Timestamp", "Username", "ID"]]),
                    setValues: jest.fn(),
                    setBackground: jest.fn(),
                    setFontColor: jest.fn(),
                    setFontWeight: jest.fn(),
                    setHorizontalAlignment: jest.fn(),
                    setVerticalAlignment: jest.fn(),
                    setFormula: jest.fn(),
                }),
                getDataRange: jest.fn().mockReturnValue({
                    getValues: jest.fn().mockReturnValue([["Timestamp", "Username", "ID"]]),
                }),
                getLastRow: jest.fn().mockReturnValue(10),
                deleteRows: jest.fn(),
                clear: jest.fn(),
            },
        ]),
        insertSheet: jest.fn().mockReturnValue({
            clear: jest.fn(),
            getRange: jest.fn().mockReturnValue({
                setValues: jest.fn(),
                setBackground: jest.fn(),
                setFontColor: jest.fn(),
                setFontWeight: jest.fn(),
                setHorizontalAlignment: jest.fn(),
                setVerticalAlignment: jest.fn(),
                setFormula: jest.fn(),
            }),
            getDataRange: jest.fn().mockReturnValue({
                getValues: jest.fn().mockReturnValue([["Timestamp", "Username", "ID"]]),
            }),
        }),
        getSheetByName: jest.fn().mockReturnValue(null),
    }),
};
