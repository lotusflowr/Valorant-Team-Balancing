//here for testing jest, remove when first real jest test is done
function sum(a, b) {
  return a + b;
}

function createOptimalTeams(players) {
  let result = {
    teams: [],
    substitutes: {}
  };
  let assignedPlayers = new Set();

  TIME_SLOTS.forEach(timeSlot => {
    let timeSlotPlayers = players.filter(p => p.timeSlots.includes(timeSlot));
    
    let { teams, substitutes, assignedPlayers: newAssignedPlayers } = createOptimalTeamsForTimeSlot(timeSlotPlayers, timeSlot, assignedPlayers);
    
    result.teams = result.teams.concat(teams);
    result.substitutes[timeSlot] = substitutes;
    assignedPlayers = newAssignedPlayers;
  });

  return result;
}

function createOptimalTeamsForTimeSlot(players, timeSlot, assignedPlayers) {
  const numPlayers = players.length;
  const numTeams = Math.floor(numPlayers / TEAM_SIZE);
  
  // Ensure even number of teams
  const adjustedNumTeams = numTeams % 2 === 0 ? numTeams : numTeams - 1;
  
  let teams = [];
  
  // Initialize empty teams
  for (let i = 0; i < adjustedNumTeams; i++) {
    teams.push({
      name: `Team ${i + 1}`,
      timeSlot: timeSlot,
      players: [],
      total: 0 // total rank power of the team
    });
  }

  // Sort players by average rank (descending)
  const sortedPlayers = players.slice().sort((a, b) => b.averageRank - a.averageRank);

  // Calculate the number of substitutes
  const numSubstitutes = Math.max(0, numPlayers - (adjustedNumTeams * TEAM_SIZE));

  // Distribute players evenly across teams and substitutes
  let substituteIndex = 0;
  const substitutes = [];
  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i];
    if (i % (adjustedNumTeams + 1) === 0 && substitutes.length < numSubstitutes) {
      // Add to substitutes
      substitutes.push(player);
    } else {
      // Add to team
      const teamIndex = i % teams.length;
      teams[teamIndex].players.push(player);
      teams[teamIndex].total += player.averageRank;
    }
  }

  // Optimize team balance
  for (let iteration = 0; iteration < 100; iteration++) {
    let improved = false;
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        if (trySwapPlayers(teams[i], teams[j])) {
          improved = true;
        }
      }
    }
    if (!improved) break;
  }

  // Calculate team spread for logging
  const teamSpread = getTeamSpread(teams);
  Logger.log(`Team spread for ${timeSlot}: ${teamSpread.toFixed(2)}`);

  return {
    teams,
    substitutes,
    assignedPlayers: new Set([...assignedPlayers, ...teams.flatMap(team => team.players.map(p => p.discordUsername))])
  };
}

function trySwapPlayers(team1, team2) {
  for (let i = 0; i < team1.players.length; i++) {
    for (let j = 0; j < team2.players.length; j++) {
      const diff1 = team1.players[i].averageRank - team2.players[j].averageRank;
      const newTotal1 = team1.total - diff1;
      const newTotal2 = team2.total + diff1;

      if (Math.abs(newTotal1 - newTotal2) < Math.abs(team1.total - team2.total)) {
        // Swap players
        const temp = team1.players[i];
        team1.players[i] = team2.players[j];
        team2.players[j] = temp;

        // Update totals
        team1.total = newTotal1;
        team2.total = newTotal2;

        return true;
      }
    }
  }
  return false;
}

function getTeamSpread(teams) {
  const totals = teams.map(team => team.total);
  return Math.max(...totals) - Math.min(...totals);
}

module.exports = {
  sum: sum,
  createOptimalTeams: createOptimalTeams,
  createOptimalTeamsForTimeSlot: createOptimalTeamsForTimeSlot,
  trySwapPlayers: trySwapPlayers,
  getTeamSpread: getTeamSpread
}

