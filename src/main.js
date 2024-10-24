import {
  onOpen,
  changeGameDay,
  getTimeSlots,
  manuallyInputTimeSlots,
  setAutomaticTimeSlots,
  sortPlayersIntoBalancedTeams,
  getPlayersData,
  writeTeamsToSheet,
  generateDiscordPings,
  setTimeSlots,
  writeDiscordPingsToSheet,
  setConditionalFormatting,
  getContrastColor,
  getGameDay,
  getRankValue,
  getRankName,
  clearResponses,
  createOptimalTeams,
  createOptimalTeamsForTimeSlot,
  trySwapPlayers,
  getTeamSpread,
  setGameDay,
  manageTimeSlots,
  manageTimeSlotsMenu
} from './Galorants_In-Houses_script.js';

import {
  sum
} from "./TeamBalance.js"

var global = {};
global.onOpen = onOpen;
global.manageTimeSlots = manageTimeSlots;
global.sortPlayersIntoBalancedTeams = sortPlayersIntoBalancedTeams;
global.clearResponses = clearResponses;
global.generateDiscordPings = generateDiscordPings;
global.sum = sum;
