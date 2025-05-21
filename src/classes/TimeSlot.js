import {
    getTimeSlots,
} from '../TimeSlotManager.js';

import {
    getRankValue,
    sortPlayersByRank,
    findMedianPlayer
} from '../Utilities.js';

import Lobby from './Lobby.js';

import { getScriptPropByName } from '../config.js';

export default class TimeSlot {
    constructor(timeSlot) {
        this.TimeSlot = timeSlot;
        this.Lobbies = [];
        this.PossiblePlayers = [];
        this.PriorityPlayers = []; //subset of possible players
    }

    //////// GETTERS FOR TIME SLOT ////////

    /**
     * gets the list of players that have signed up for this time slot
     */
    getPossiblePlayers = () => {
        return this.PossiblePlayers;
    }

    /**
     * gets the list of players that are flagged as a priority for this time slot
     */
    getPriorityPlayers = () => {
        return this.PriorityPlayers;
    }

    /**
     * gets the lobbies for the time slot
     */
    getLobbies = () => {
        return this.Lobbies;
    }

    /**
     * gets the string value of the time slot, example: "7pm CEST/8pm WEST"
     */
    getTimeSlotName = () => {
        return this.TimeSlot;
    }

    //////// SETTERS FOR TIME SLOT ////////

    /**
     * Loops through the players and checks whether they can be added to this time slot or not. Also, checks if they are limited to only certain time slots and flags them as priority if so
     *
     * @param {array} Players - array of Player objects
     */
    processPlayersToTimeSlot = (Players) => {
        let totalTimeSlotCount = getTimeSlots().length;

        //loop through the players
        Players.forEach(Player => {
            //check each player's available time slots
            let timeSlots = Player.getAvailableTimeSlots();

            timeSlots.forEach(tSlot => {
                //if the player has a time slot that matches this one, add them as a possible player
                if (tSlot == this.TimeSlot) {
                    //player can play multiple games, or has not already been assigned, so add them as a possible player
                    if (Player.getCanPlayMultiple() || !Player.getHasBeenAssigned()) {
                        this.PossiblePlayers.push(Player);

                        //if the amount of time slots the player is available for is less than the total (they're limited), flag them as a higher priority
                        if (timeSlots.length < totalTimeSlotCount) {
                            this.PriorityPlayers.push(Player);
                        }
                    }
                }
            });
        });

        this.PossiblePlayers = sortPlayersByRank(this.PossiblePlayers);
        this.PriorityPlayers = sortPlayersByRank(this.PriorityPlayers);
    }

    /**
     * Initializes the appropriate amount of lobbies (2 teams) for this time slot given the amount of possible players and the configured team size. If more than 1 lobby could be created, the minimum sub amount will be added to the required player count before forming a second lobby
     *
     * @throws Will throw an error if there aren't enough players to form 1 lobby based on team size
     */
    createLobbiesForSlot = () => {
        const playerCount = this.getPossiblePlayers().length;

        //ensure we have at least enough players to form 1 lobby (10 players minimum by default)
        if (playerCount < getScriptPropByName('TEAM_SIZE') * 2) {
            throw new Error('Too few players to form a lobby');
        }

        //at this point we'll make at least 1 lobby, so check what the minimum player count would be to form more
        //TODO: factor in the amount of people volunteering to be substitutes
        let minimumPlayerCountPerLobby = (getScriptPropByName('TEAM_SIZE') * 2) + getScriptPropByName('MINIMUM_SUB_COUNT');
        let lobbyCount = Math.floor(playerCount / minimumPlayerCountPerLobby);

        //make at least 1 lobby
        lobbyCount = lobbyCount == 0 ? 1 : lobbyCount;

        //initialize that many lobbies
        for (let i = 0; i < lobbyCount; i++) {
            this.Lobbies.push(new Lobby());
        }
    }

    /**
     * tries to find a player in the PossiblePlayers array
     *
     * @param {string} discordName - the name of the player to find
     *
     * @returns {Player|null}
     */
    findPossiblePlayerByDiscordName = (discordName) => {
        let PlayerObj = null;
        const PossiblePlayers = this.getPossiblePlayers();

        PossiblePlayers.forEach(Player => {
            if (Player.getDiscordName() == discordName) {
                PlayerObj = Player;
                return;
            }
        });

        return PlayerObj;
    }

    /**
     * locates a specified amount of players who have not been chosen to play yet within a rank range (inclusive). The amount of players is a maximum--if there are fewer players that meet the criteria, only those players will be returned. Will first search the prioritized player list, then the normal list with a priority on players that have not already played in a different time slot. If the requested player count hasn't been reached, the normal list will be checked again without the "already played" restriction.
     *
     * @param {integer} rankLower - the minimum player average rank to find (player avg rank will be greater than or equal to this)
     * @param {integer} rankUpper - the maximum player average rank to find (player avg rank will be less than or equal to this)
     * @param {integer} [playerCount=1] - the amount of players to try to find. Must be greater than 0
     *
     * @returns {array} array of player(s) found matching the criteria provided
     *
     * @throws Will throw an error if the provided playerCount is less than 1
     */
    findUnassignedPlayersByRankRange = (rankLower, rankUpper, playerCount = 1) => {
        if (playerCount < 1) {
            throw new Error("The requested amount of players to find must be at least 1");
        }

        let chosenPlayerNames = [];
        let chosenPlayers = [];

        const PriorityPlayers = this.getPriorityPlayers();
        const prioPlayerCount = PriorityPlayers.length;

        //check priority first
        for (let i = 0; i < prioPlayerCount; i++) {
            let Player = PriorityPlayers[i];
            let avgRank = Player.getAvgRank();

            //player is not already tentatively on a team & matches the rank specifications
            if (!Player.getOnTentativeTeam() && avgRank >= rankLower && avgRank <= rankUpper) {
                chosenPlayerNames.push(Player.getDiscordName());
                chosenPlayers.push(Player);

                if (chosenPlayers.length == playerCount) {
                    return chosenPlayers;
                }
            }
        }

        const PossiblePlayers = this.getPossiblePlayers();
        const possiblePlayerCount = PossiblePlayers.length;

        //check everyone else who hasn't played in another time slot yet
        for (let i = 0; i < possiblePlayerCount; i++) {
            let Player = PossiblePlayers[i];
            let avgRank = Player.getAvgRank(),
                discordName = Player.getDiscordName();

            //player is not already tentatively on a team, hasn't already been chosen earlier, isn't already playing another game, & matches the rank specifications
            if (!Player.getOnTentativeTeam() &&
                !chosenPlayerNames.includes(discordName) &&
                !Player.getHasBeenAssigned() &&
                avgRank >= rankLower && avgRank <= rankUpper
            ) {
                chosenPlayerNames.push(discordName);
                chosenPlayers.push(Player);

                if (chosenPlayers.length == playerCount) {
                    return chosenPlayers;
                }
            }
        }

        //check everyone else
        for (let i = 0; i < possiblePlayerCount; i++) {
            let Player = PossiblePlayers[i];
            let avgRank = Player.getAvgRank(),
                discordName = Player.getDiscordName();

            //player is not already tentatively on a team, hasn't already been chosen earlier, & matches the rank specifications
            if (!Player.getOnTentativeTeam() &&
                !chosenPlayerNames.includes(discordName) &&
                avgRank >= rankLower && avgRank <= rankUpper
            ) {
                chosenPlayerNames.push(discordName);
                chosenPlayers.push(Player);

                if (chosenPlayers.length == playerCount) {
                    return chosenPlayers;
                }
            }
        }

        //didn't meet the minimum player count, so just return what we were able to find
        return chosenPlayers;
    }

    /**
     * Sort the players into optimal teams
     *
     * @param {boolean} tryDuos - tries to pair duos together if true
     */
    createOptimalTeams = (tryDuos) => {
        if (this.Lobbies.length > 1) {
            //get the median player as a benchmark for the teams
            const MedianPlayer = findMedianPlayer(this.getPossiblePlayers());

            //try to sort higher ranked players with higher ranks and lower ranks with lower ranks 
            let LeastPlayers = [];
            if (MedianPlayer.getAvgRank() >= getRankValue('Platinum 1')) {
                //mostly lower-ranked players, so see if we have enough higher ranks to form their own teams
                LeastPlayers = this.findUnassignedPlayersByRankRange(getRankValue('Platinum 1'), getRankValue('Radiant'), 10);
            } else {
                //mostly higher-ranked players, so see if we have enough lower ranks to form their own teams
                LeastPlayers = this.findUnassignedPlayersByRankRange(getRankValue('Iron 1'), getRankValue('Gold 3'), 10);
            }

            if (LeastPlayers.length < 10) {
                //use createOneTeamSet logic as many times as needed to form teams
                this.Lobbies.forEach(Lobby => {
                    this.createOneTeamSet(Lobby, tryDuos);
                });
            } else {
                //divide higher ranks & lower ranks into their own teams
            }
        } else {
            this.createOneTeamSet(this.Lobbies[0], tryDuos);
        }
    }

    /**
     * tries to create 2 optimized teams for the lobby using the entire set of available players
     *
     * @param {Lobby} Lobby - the Lobby object for the set of teams
     * @param {boolean} tryDuos - indicates whether the team logic should try to pair duos
     */
    createOneTeamSet = (Lobby, tryDuos) => {
        //get the median player of the priority players, if any (if none, use all players), to seed the first team
        let MedianPlayer = findMedianPlayer(this.getPriorityPlayers());
        if (MedianPlayer === null) {
            MedianPlayer = findMedianPlayer(this.getPossiblePlayers());
        }

        Lobby.getTeam1().addPlayerToTeam(MedianPlayer);

        if (tryDuos && MedianPlayer.getDuoPlayer() !== null) {
            //see if the player's duo is available here
            let DuoPlayer = this.findPossiblePlayerByDiscordName(MedianPlayer.getDuoPlayer().getDiscordName());
            if (DuoPlayer !== null) {
                Lobby.getTeam1().addPlayerToTeam(DuoPlayer);
                Lobby.getTeam1().toggleHasDuo();
            }
        }

        //find comparable teammate(s) for team 2, or find 1 & a duo
        MedianPlayer.getAvgRank()
    }

    /**
     * tries to create 2 optimized teams for the lobby by splitting the available set into rank groups & placing into separate lobbies
     */
    createMultipleTeamSets = (tryDuos) => {
    }
}
