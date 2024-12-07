import {
  getRankValue,
} from '../Utilities.js';

export default class Player {
    constructor(
        timestamp,
        discordName,
        riotID,
        pronouns,
        timeSlots,
        multipleGames,
        substitute,
        lobbyHost,
        duoRequest,
        currentRank,
        peakRank
    ) {
        this.TimeStamp = timestamp;
        this.DiscordUsername = discordName;
        this.RiotID = riotID;
        this.Pronouns = pronouns;
        this.DuoRequest = duoRequest;

        if (typeof currentRank == 'string') {
            this.CurrentRank = getRankValue(currentRank);
        } else if (typeof currentRank == 'number') {
            this.CurrentRank = currentRank;
        }

        if (typeof peakRank == 'string') {
            this.PeakRank = getRankValue(peakRank);
        } else if (typeof peakRank == 'number') {
            this.PeakRank = peakRank;
        }

        if (typeof timeSlots == 'string') {
            if (timeSlots.trim().length > 0) {
                this.TimeSlots = timeSlots.trim().split(',').map(s => s.trim());
            } else {
                this.TimeSlots = [];
            }
        } else if (Array.isArray(timeSlots)) {
            this.TimeSlots = timeSlots;
        } else {
            this.TimeSlots = [];
        }

        if (typeof multipleGames == 'boolean') {
            this.MultipleGames = multipleGames;
        } else if (typeof multipleGames == 'string') {
            this.MultipleGames = multipleGames.toLowerCase() === 'yes';
        } else {
            throw new Error('The "multiple games" option provided is invalid');
        }

        if (typeof substitute == 'boolean') {
            this.CanSub = substitute;
        } else if (typeof multipleGames == 'string') {
            this.CanSub = substitute.toLowerCase() === 'yes';
        } else {
            throw new Error('The "substitute" option provided is invalid');
        }

        if (typeof lobbyHost == 'boolean') {
            this.CanHost = lobbyHost;
        } else if (typeof multipleGames == 'string') {
            this.CanHost = lobbyHost.toLowerCase() === 'yes';
        } else {
            throw new Error('The "lobby host" option provided is invalid');
        }

        this.AverageRank = (this.CurrentRank + this.PeakRank) / 2;
        this.Duo = null;
        this.hasBeenAssigned = false;
        this.onTentativeTeam = false;
        this.TentativeTeam = null;
    }

    //////// SETTERS FOR THINGS THAT CAN BE CHANGED LATER ////////

    /**
     * @param {Player} duo - Player object of the matched duo
     */
    setDuo = (duo) => {
        this.Duo = duo;
    }

    /**
     * @param {Player} duo - Player object of the matched duo
     */
    validateDuo = (duo) => {
        //this player hasn't already had a duo set, and their duo request isn't empty
        if (this.getDuoPlayer() == null &&
            duo.getDuoPlayer() == null &&
            this.getDuoRequest() != '' &&
            duo.getDuoRequest() != ''
        ) {
            //the players both submitted the other's discord name as their duo request
            if (this.getDuoRequest() == duo.getDiscordName() &&
                duo.getDuoRequest() == this.getDiscordName()
            ) {
                this.setDuo(duo);
                duo.setDuo(this);
            }
        }
    }

    /**
     * toggle the value of hasBeenAssigned (should be true if the player is assigned to at least 1 team, false if assigned to 0 teams. Assigned as a substitute does not count
     */
    toggleAssigned = () => {
        this.hasBeenAssigned = !this.hasBeenAssigned;
    }

    /**
     * toggle the value of onTentativeTeam (should be true if the player has been tentatively selected to participate in a lobby)
     */
    toggleTentativeTeam = () => {
        this.onTentativeTeam = !this.onTentativeTeam;
    }

    /**
     * sets or removes the tentative team association for this player
     *
     * @param {Team} [Team=null] - Team object that the player will be tentatively assigned to--if not provided, will be set to null
     */
    setTentativeTeam = (Team = null) => {
        this.TentativeTeam = Team;
    }

    //////// GETTERS FOR PLAYER ATTRIBUTES ////////

    getIsValidPlayer = () => {
        if (this.CurrentRank <= 0) {
            return false;
        }

        if (this.PeakRank <= 0) {
            return false;
        }

        //make sure discord name generally matches discord requirements
        if (this.DiscordUsername.length < 2 || this.DiscordUsername.length > 32) {
            return false;
        }

        //make sure riot ID generally matches name/tagline requirements from riot
        let riotIdSplit = this.RiotID.split('#'); 
        if (riotIdSplit.length != 2 || riotIdSplit[0].length < 3 || riotIdSplit[0].length > 16 || riotIdSplit[1].length < 2 || riotIdSplit[1].length > 5) { 
            return false;
        }

        if (this.TimeSlots.length == 0) {
            return false;
        }

        return true;
    }

    getTimeStamp = () => {
        return this.TimeStamp;
    }

    getDiscordName = () => {
        return this.DiscordUsername;
    }

    getRiotID = () => {
        return this.RiotID;
    }

    getPronouns = () => {
        return this.Pronouns;
    }

    getAvailableTimeSlots = () => {
        return this.TimeSlots;
    }

    getCanPlayMultiple = () => {
        return this.MultipleGames;
    }

    getCanSub = () => {
        return this.CanSub;
    }

    getCanHost = () => {
        return this.CanHost;
    }

    getPeakRank = () => {
        return this.PeakRank;
    }

    getCurrentRank = () => {
        return this.CurrentRank;
    }

    getAvgRank = () => {
        return this.AverageRank;
    }

    getDuoRequest = () => {
        return this.DuoRequest;
    }

    getDuoPlayer = () => {
        return this.Duo;
    }

    getHasBeenAssigned = () => {
        return this.hasBeenAssigned;
    }

    getOnTentativeTeam = () => {
        return this.onTentativeTeam;
    }

    getTentativeTeam = () => {
        return this.TentativeTeam;
    }
}
