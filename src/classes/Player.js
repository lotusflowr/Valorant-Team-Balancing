export default const Player = class {
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
        this.DiscordUsername = discordname;
        this.RiotID = riotID;
        this.Pronouns = pronouns;
        this.TimeSlots = timeSlots;
        this.MultipleGames = multipleGames;
        this.CanSub = substitute;
        this.CanHost = LobbyHost;
        this.DuoRequest = duoRequest;
        this.CurrentRank = currentRank;
        this.PeakRank = peakRank;
        this.AverageRank = (this.CurrentRank + this.PeakRank) / 2;
        this.Duo = null;
        this.isValid = this.CurrentRank > 0 || this.PeakRank > 0;
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
    this.setTentativeTeam = (Team = null) => {
        this.TentativeTeam = Team;
    }

    //////// GETTERS FOR PLAYER ATTRIBUTES ////////

    getIsValidPlayer = () => {
        return this.Valid;
    }

    getDiscordName = () => {
        return this.DiscordUsername;
    }

    getRiotID = () => {
        return this.RiotID;
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
