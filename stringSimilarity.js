const stringSimilarity = require('string-similarity');

function normalizeNames(name) {
  return name.toLowerCase().replace(/\s+/g, ' ').trim();
}

function expandInitials(name) {
  const parts = name.split(' ');
  return parts.filter(part => part.length > 1 || !part.endsWith('.')).join(' ');
}

function getNameParts(name) {
  return name.split(' ');
}

function compareNameParts(parts1, parts2) {
  const maxLength = Math.max(parts1.length, parts2.length);
  let score = 0;
  let matchedParts = 0;

  for (let i = 0; i < maxLength; i++) {
    if (parts1[i] && parts2[i]) {
      const partSimilarity = stringSimilarity.compareTwoStrings(parts1[i], parts2[i]);
      if (partSimilarity > 0.8 || (parts1[i].length === 1 && parts2[i].startsWith(parts1[i])) || (parts2[i].length === 1 && parts1[i].startsWith(parts2[i]))) {
        score += partSimilarity;
        matchedParts++;
      }
    }
  }

  return matchedParts > 0 ? score / maxLength : 0;
}

function compareInitials(name1, name2) {
  const initials1 = name1.split(' ').map(part => part[0]).join('');
  const initials2 = name2.split(' ').map(part => part[0]).join('');
  return stringSimilarity.compareTwoStrings(initials1, initials2);
}

function areSimilarNames(name1, name2, threshold = 0.8) {
  const normalizedName1 = expandInitials(normalizeNames(name1));
  const normalizedName2 = expandInitials(normalizeNames(name2));

  const parts1 = getNameParts(normalizedName1);
  const parts2 = getNameParts(normalizedName2);

  // If one name is just an initial and the other is a full name, require exact match
  if ((parts1.length === 1 && parts1[0].length === 1) || (parts2.length === 1 && parts2[0].length === 1)) {
    return parts1[0] === parts2[0];
  }

  let totalScore = 0;

  // Compare overall string similarity (20% weight)
  totalScore += stringSimilarity.compareTwoStrings(normalizedName1, normalizedName2) * 0.2;

  // Compare individual name parts (60% weight)
  totalScore += compareNameParts(parts1, parts2) * 0.6;

  // Compare initials (20% weight)
  totalScore += compareInitials(name1, name2) * 0.2;

  // Bonus for matching first and last names
  if (parts1[0] === parts2[0] && parts1[parts1.length - 1] === parts2[parts2.length - 1]) {
    totalScore += 0.1;
  }

  // Penalty for significant length difference
  const lengthDifference = Math.abs(parts1.length - parts2.length);
  const lengthPenalty = Math.min(lengthDifference * 0.1, 0.2);
  totalScore = Math.max(totalScore - lengthPenalty, 0);

  return totalScore >= threshold;
}

module.exports = areSimilarNames;