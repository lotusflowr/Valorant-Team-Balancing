export function createRatingSystem(kFactor = 32, exponentDenominator = 400, exponentBase = 10) {
  const kFactorFn = typeof kFactor === 'number' ? () => kFactor : kFactor;

  const expectedProbability = diff => 1 / (1 + Math.pow(exponentBase, diff / exponentDenominator));

  function getExpectedPlayerProbabilities(aRating, bRating) {
    const diffAB = bRating - aRating;
    const diffBA = -diffAB;
    const aProb = expectedProbability(diffAB);
    const bProb = expectedProbability(diffBA);
    return [aProb, bProb, diffAB, diffBA];
  }

  function getNextRating(rating, score, expected) {
    const change = kFactorFn(rating) * (score - expected);
    return [rating + change, change];
  }

  function getNextRatings(aRating, bRating, aScore) {
    const [aProb, bProb] = getExpectedPlayerProbabilities(aRating, bRating);
    const bScore = 1 - aScore;
    const [nextA, diffA] = getNextRating(aRating, aScore, aProb);
    const [nextB, diffB] = getNextRating(bRating, bScore, bProb);
    return {
      playerAProbability: aProb,
      playerBProbability: bProb,
      nextPlayerARating: nextA,
      playerARatingDiff: diffA,
      nextPlayerBRating: nextB,
      playerBRatingDiff: diffB,
    };
  }

  return {
    getExpectedPlayerProbabilities,
    getNextRating,
    getNextRatings,
  };
}
