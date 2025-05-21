import TimeSlot from '../../src/classes/TimeSlot.js';
import Player from '../../src/classes/Player.js';
import {
    players,
    findUnassignedPlayers
} from './TimeSlotCases.js';
import {
    getPlayerNames
} from '../../src/Utilities.js';

describe("Test TimeSlot Player processing & getters", () => {
    test.each(players)('$caseName', ({playerData, timeSlot, expectedData}) => {
        let playerObjs = [];

        playerData.forEach(player => {
            playerObjs.push(new Player(
                player.timestamp,
                player.discordUsername,
                player.riotId,
                player.pronouns,
                player.timeSlots,
                player.multipleGames,
                player.willSub,
                player.willHost,
                player.duoRequest,
                player.currentRank,
                player.peakRank
            ));
        });

        let Slot = new TimeSlot(timeSlot);

        expect(Slot.getTimeSlotName()).toBe(timeSlot);

        Slot.processPlayersToTimeSlot(playerObjs);

        let possiblePlayers = Slot.getPossiblePlayers();
        let priorityPlayers = Slot.getPriorityPlayers();

        expect(possiblePlayers).toHaveLength(expectedData.possiblePlayers.length);
        expect(priorityPlayers).toHaveLength(expectedData.priorityPlayers.length);

        let found = [];
        possiblePlayers.forEach(Player => {
            //find the player in the expected possible players array
            expect(expectedData.possiblePlayers).toContain(Player.getDiscordName());
            //find the player exactly once
            expect(found).not.toContain(Player.getDiscordName());
            found.push(Player.getDiscordName());
        });

        found = [];
        priorityPlayers.forEach(Player => {
            //find the player in the expected priority players array
            expect(expectedData.priorityPlayers).toContain(Player.getDiscordName());
            //find the player exactly once
            expect(found).not.toContain(Player.getDiscordName());
            found.push(Player.getDiscordName());
        });
    });
});

describe("Test TimeSlot Lobby creation", () => {
    test.each(players)('$caseName', ({playerData, timeSlot, expectedData}) => {
        let playerObjs = [];

        playerData.forEach(player => {
            playerObjs.push(new Player(
                player.timestamp,
                player.discordUsername,
                player.riotId,
                player.pronouns,
                player.timeSlots,
                player.multipleGames,
                player.willSub,
                player.willHost,
                player.duoRequest,
                player.currentRank,
                player.peakRank
            ));
        });

        let Slot = new TimeSlot(timeSlot);

        expect(Slot.getTimeSlotName()).toBe(timeSlot);

        Slot.processPlayersToTimeSlot(playerObjs);
        Slot.createLobbiesForSlot();

        expect(Slot.getLobbies()).toHaveLength(expectedData.lobbyCount);
    });
});

describe("Test TimeSlot findPossiblePlayerByDiscordName", () => {
    test.each(players)('$caseName', ({playerData, timeSlot, expectedData}) => {
        let playerObjs = [];

        playerData.forEach(player => {
            playerObjs.push(new Player(
                player.timestamp,
                player.discordUsername,
                player.riotId,
                player.pronouns,
                player.timeSlots,
                player.multipleGames,
                player.willSub,
                player.willHost,
                player.duoRequest,
                player.currentRank,
                player.peakRank
            ));
        });

        let Slot = new TimeSlot(timeSlot);
        expect(Slot.getTimeSlotName()).toBe(timeSlot);
        Slot.processPlayersToTimeSlot(playerObjs);
        let possiblePlayers = Slot.getPossiblePlayers();

        //loop through each of the players in the expected array and make sure they can be found
        expectedData.possiblePlayers.forEach(playerName => {
            let Player = Slot.findPossiblePlayerByDiscordName(playerName);
            expect(Player).not.toBeNull();
            expect(Player.getDiscordName()).toBe(playerName);
        });
    });
});

describe("Test TimeSlot findUnassignedPlayersByRankRange", () => {
    test.each(findUnassignedPlayers)('$caseName', ({
        playerData, timeSlot, expectedData, setOnTentativeTeam, setAssigned, rankLower, rankUpper, playerCount
    }) => {
        let playerObjs = [];

        playerData.forEach(player => {
            playerObjs.push(new Player(
                player.timestamp,
                player.discordUsername,
                player.riotId,
                player.pronouns,
                player.timeSlots,
                player.multipleGames,
                player.willSub,
                player.willHost,
                player.duoRequest,
                player.currentRank,
                player.peakRank
            ));
        });

        let Slot = new TimeSlot(timeSlot);
        Slot.processPlayersToTimeSlot(playerObjs);
/*
        let possiblePlayers = Slot.getPossiblePlayers();
        let priorityPlayers = Slot.getPriorityPlayers();
*/

/* TODO: not being caught and I'm not sure why?
        if (expectedData.error !== null) {
            expect(Slot.findUnassignedPlayersByRankRange(rankLower, rankUpper, playerCount)).toThrow(new Error(expectedData.error));
            return;
        }
*/

        let chosenPlayers = Slot.findUnassignedPlayersByRankRange(rankLower, rankUpper, playerCount);

        //ensure we got the amount of players we wanted
        expect(chosenPlayers.length).toBe(playerCount);

        //ensure we found the specific players we expected
        let chosenPlayerNames = getPlayerNames(chosenPlayers)

        expectedData.players.forEach(playerName => {
            let nameFound = false;

            chosenPlayerNames.forEach(chosenName => {
                if (chosenName == playerName) {
                    nameFound = true;
                }
            });

            expect(nameFound).toBe(true);
        });
    });
});
