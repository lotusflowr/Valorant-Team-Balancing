const TeamBalanceModule = require('../src/TeamBalance.js')

test('adds 1 + 2 to equal 3', () => {
  expect(TeamBalanceModule.sum(1,2)).toBe(3);
});
