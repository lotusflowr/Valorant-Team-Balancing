import Team from './classes/Team.js';

export default const Lobby = class {
    constructor() {
        this.Team1 = new Team('Team 1');
        this.Team2 = new Team('Team 2');
        this.Host = null;
        this.AverageRank = 0;
        this.Substitutes = [];
    }

    //////// GETTERS FOR LOBBY ////////

    getTeam1 = () => {
        return this.Team1;
    }

    getTeam2 = () => {
        return this.Team2;
    }

    getHost = () => {
        return this.Host;
    }

    getAvgRank = () => {
        return this.AverageRank;
    }

    getSubstitutes = () => {
        return this.Substitutes;
    }

    //////// SETTERS FOR LOBBY ////////

    /**
     * sets an available team slot to a team, if possible
     *
     * @param {Team} Team - The Team to assign as either Team1 or Team2 (depending on which is available)
     *
     * @throws Will throw an error if both teams are already set
     */
    setTeam = (Team) => {
        if (this.Team1 == null) {
            this.Team1 = Team;
        } else if (this.Team2 == null) {
            this.Team2 = Team;
        } else {
            throw new Error('Teams are already full for this lobby');
        }
    }

    /**
     * sets or changes the lobby host, throws an error if the provided player declined to host
     *
     * @param {Player} Host - The Player object to assign as the lobby host
     *
     * @throws Will throw an error if the player didn't want to host
     */
    setHost = (Host) => {
        if (Host.getCanHost()) {
            this.Host = Host;
        } else {
            throw new Error('Chosen player does not want to host');
        }
    }

    /**
     * adds the player to the lobby as a sub if requested by the player (otherwise, skips)
     *
     * TODO: verify the player is near the average lobby rank to ensure they're a valid sub
     *
     * @param {Player} Player - The Player object to add to the list of substitutes
     */
    addSub = (Player) => {
        if (Player.getCanSub()) {
            this.Substitutes.push(Player);
        }
    }
}
