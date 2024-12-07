import Player from '../../src/classes/Player.js';
import {
    players,
    playersToggle,
    duoPlayers
} from './PlayerCases.js';

describe("Test Player constructor/getters", () => {
    test.each(players)('$caseName', ({playerData, expectedData}) => {
        let player = new Player(
            playerData.timestamp,
            playerData.discordUsername,
            playerData.riotId,
            playerData.pronouns,
            playerData.timeSlots,
            playerData.multipleGames,
            playerData.willSub,
            playerData.willHost,
            playerData.duoRequest,
            playerData.currentRank,
            playerData.peakRank
        ); 

        expect(player.getTimeStamp()).toBe(playerData.timestamp);
        expect(player.getPronouns()).toBe(playerData.pronouns);
        expect(player.getDiscordName()).toBe(playerData.discordUsername);
        expect(player.getRiotID()).toBe(playerData.riotId);

        let timeSlots = player.getAvailableTimeSlots();
        expect(timeSlots.length).toBe(expectedData.timeSlots.length);
        expectedData.timeSlots.forEach(slot => {
            expect(timeSlots).toContain(slot);
        });

        expect(player.getCanPlayMultiple()).toBe(expectedData.multipleGames);
        expect(player.getCanSub()).toBe(expectedData.willSub);
        expect(player.getCanHost()).toBe(expectedData.willHost);
        expect(player.getAvgRank()).toBe(expectedData.avgRank);
        expect(player.getDuoRequest()).toBe(playerData.duoRequest);
        expect(player.getPeakRank()).toBe(expectedData.peakRank);
        expect(player.getCurrentRank()).toBe(expectedData.currentRank);

        expect(player.getIsValidPlayer()).toBe(expectedData.isValid);
    });
})

describe("Test Player toggle functions", () => {
    test.each(playersToggle)('$caseName', ({playerData}) => {
        let player = new Player(
            playerData.timestamp,
            playerData.discordUsername,
            playerData.riotId,
            playerData.pronouns,
            playerData.timeSlots,
            playerData.multipleGames,
            playerData.willSub,
            playerData.willHost,
            playerData.duoRequest,
            playerData.currentRank,
            playerData.peakRank
        ); 

        //toggles should be false by default
        expect(player.getHasBeenAssigned()).toBe(false);
        player.toggleAssigned();
        expect(player.getHasBeenAssigned()).toBe(true);

        expect(player.getOnTentativeTeam()).toBe(false);
        player.toggleTentativeTeam();
        expect(player.getOnTentativeTeam()).toBe(true);
    })
})

describe("Test Player duo matching/setting", () => {
    test.each(duoPlayers)('$caseName', ({player1data, player2data, player3data, expected}) => {
        let player1 = new Player(
            player1data.timestamp,
            player1data.discordUsername,
            player1data.riotId,
            player1data.pronouns,
            player1data.timeSlots,
            player1data.multipleGames,
            player1data.willSub,
            player1data.willHost,
            player1data.duoRequest,
            player1data.currentRank,
            player1data.peakRank
        );

        let player2 = new Player(
            player2data.timestamp,
            player2data.discordUsername,
            player2data.riotId,
            player2data.pronouns,
            player2data.timeSlots,
            player2data.multipleGames,
            player2data.willSub,
            player2data.willHost,
            player2data.duoRequest,
            player2data.currentRank,
            player2data.peakRank
        );

        let player3 = new Player(
            player3data.timestamp,
            player3data.discordUsername,
            player3data.riotId,
            player3data.pronouns,
            player3data.timeSlots,
            player3data.multipleGames,
            player3data.willSub,
            player3data.willHost,
            player3data.duoRequest,
            player3data.currentRank,
            player3data.peakRank
        ); 

        //should be null by default
        expect(player1.getDuoPlayer()).toBe(null);
        expect(player2.getDuoPlayer()).toBe(null);
        expect(player3.getDuoPlayer()).toBe(null);

        //will call setDuo if it works
        player1.validateDuo(player2);

        let player1Duo = player1.getDuoPlayer();
        let player2Duo = player2.getDuoPlayer();

        if (expected.matchDuo) {
            //duos should match
            expect(player1Duo.getDiscordName()).toBe(player2.getDiscordName());
            expect(player2Duo.getDiscordName()).toBe(player1.getDiscordName());
            //player 3 should be unaffected
            expect(player3.getDuoPlayer()).toBe(null);
        } else {
            //the duos shouldn't have matched, so they should still be empty
            expect(player1.getDuoPlayer()).toBe(null);
            expect(player2.getDuoPlayer()).toBe(null);
            expect(player3.getDuoPlayer()).toBe(null);
        }
    })
})
