import { TEAM_SIZE } from '../config.js';

export default class Team {
    constructor(teamName = '') {
        this.TeamName = teamName;
        this.Players = [];
        this.AverageRank = 0;
        this.MaxRank = 0;
        this.MinRank = 0;
        this.HasDuo = false;
    }

    //////// GETTERS FOR TEAM ATTRIBUTES ////////
    getPlayers = () => {
        return this.Players;
    }

    getAvgRank = () => {
        return this.AverageRank;
    }

    getMaxRank = () => {
        return this.MaxRank;
    }

    getMinRank = () => {
        return this.MinRank;
    }

    getHasDuo = () => {
        return this.HasDuo;
    }

    //////// SETTERS FOR TEAM ATTRIBUTES ////////

    /**
     * adds a player to the team, if possible, and calculates team values
     *
     * @param {Player} Player - object to add to the team
     *
     * @throws Will throw an error if the team is already full per TEAM_SIZE config or if player is already tentatively on a team
     */
    addPlayerToTeam = (Player) => {
        if (this.Players.length == TEAM_SIZE) {
            throw Error('Team is full');
        }

        if (Player.onTentativeTeam) {
            throw Error ('Player is already tentatively on a team -- please remove them first');
        }

        //add player to the team
        this.Players.push(Player);
        Player.toggleTentativeTeam();
        Player.setTeam(this);

        //calculate Team attributes
        this.calculateTeamValues();
    }

    /**
     * removes a player from the team, if existing, and calculates team values
     *
     * @param {Player} Player - object to remove from the team
     *
     * @return {boolean} true if player was removed, false if not found
     */
    removePlayerFromTeam = (Player) => {
        const playerCount = this.Players.length;
        let found = false;
        for (let i = 0; i < playerCount; i++) {
            if (this.Players[i].getDiscordName() == Player.getDiscordName()) {
                found = true;
                //remove the player from this team array
                this.Players.splice(i, i);

                //unset the player associations to the team
                Player.toggleTentativeTeam();
                Player.setTeam();

                //recalculate team values
                this.calculateTeamValues();
                break;
            }
        }

        return found;
    }

    /**
     * calculates the minimum rank, maximum rank, and average rank of the existing players in the team and sets them on the Team object
     */
    calculateTeamValues = () => {
        const playerCount = this.Players.length;
        let total = 0;
        let minRank, maxRank = null;

        this.Players.forEach(Player => {
            let playerRank = Player.getAvgRank();

            if (maxRank === null || maxRank < playerRank) {
                maxRank = playerRank;
            }

            if (minRank === null || minRank > playerRank) {
                minRank = playerRank;
            }

            total += playerRank;
        });

        this.AverageRank = total / playerCount;
        this.MinRank = minRank;
        this.MaxRank = maxRank;
    }

    /**
     * toggles whether the team has a duo set or not (can accommodate up to 1 duo pair per team)
     */
    toggleHasDuo = () => {
        this.HasDuo = !this.HasDuo;
    }

    /**
     *  TODO: loop through the time slot objects & find any players on this team that have opted out of multiple games
     *        loop through players on team and mark them has having been assigned (Player.toggleAssigned())
     *        write teams to sheet
     */
    finalizeTeam = (TimeSlots) => {
    }
}
