import TimeSlot from '../../src/classes/TimeSlot.js';
import Player from '../../src/classes/Player.js';
import {
    players,
} from './TimeSlotCases.js';

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
