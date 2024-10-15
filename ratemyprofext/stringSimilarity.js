function areNamesSimilar(name1, name2) {
  // Normalize name: convert to lowercase, trim spaces
  const normalize = (name) => name.toLowerCase().trim();

  // Split name into parts
  const getNameParts = (fullName) => {
    const parts = fullName.split(/\s+/);
    return {
      firstName: parts[0], // First part is assumed to be the first name
      middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : null, // Middle parts if any
      lastName: parts[parts.length - 1] // Last part is assumed to be the last name
    };
  };

  // Calculate the Levenshtein distance between two strings
  function levenshteinDistance(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => Array(a.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        if (a[i - 1] === b[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i] + 1, // Deletion
            matrix[j][i - 1] + 1, // Insertion
            matrix[j - 1][i - 1] + 1 // Substitution
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  // Check if the two names are similar enough based on Levenshtein distance
  function isSimilarEnough(str1, str2) {
    const distance = levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return distance <= 2 || (maxLength > 5 && distance / maxLength < 0.4);
  }

  // Enhanced comparison function
  function compareNameObjects(obj1, obj2) {
    // Last names must match or be very similar
    if (!isSimilarEnough(obj1.lastName, obj2.lastName)) {
      return false;
    }

    // Check if first name is just an initial
    const isInitial1 = obj1.firstName.length === 1;
    const isInitial2 = obj2.firstName.length === 1;

    // If either is an initial, compare only the first letter
    if (isInitial1 || isInitial2) {
      return obj1.firstName[0] === obj2.firstName[0];
    }

    // If not initials, check if the first names are similar enough
    if (isSimilarEnough(obj1.firstName, obj2.firstName)) {
      return true;
    }

    // If one name has a middle name and the other does not, compare based on first and last names
    return false;
  }

  // Normalize both names and split into parts
  const nameObj1 = getNameParts(normalize(name1));
  const nameObj2 = getNameParts(normalize(name2));

  // Compare name objects
  return compareNameObjects(nameObj1, nameObj2);
}

module.exports = areNamesSimilar;



// function areNamesSimilar(name1, name2) {
//    // Normalize name: convert to lowercase, trim spaces
//    const normalize = (name) => name.toLowerCase().trim();

//    // Split name into first and last parts
//    const getNameParts = (fullName) => {
//      const parts = fullName.split(/\s+/);
//      return {
//        firstName: parts[0], // First part is assumed to be the first name
//        lastName: parts[parts.length - 1] // Last part is assumed to be the last name
//      };
//    };
 
//    // Compare if two names are the same, with stricter matching
//    function compareNameObjects(obj1, obj2) {
//      // Last names must match exactly
//      if (obj1.lastName !== obj2.lastName) {
//        return false;
//      }
 
//      // Check if first name is just an initial
//      const isInitial1 = obj1.firstName.length === 1;
//      const isInitial2 = obj2.firstName.length === 1;
 
//      // If either is an initial, compare only the first letter
//      if (isInitial1 || isInitial2) {
//        return obj1.firstName[0] === obj2.firstName[0];
//      }
 
//      // Otherwise, full first names must match exactly
//      return obj1.firstName === obj2.firstName;
//    }
 
//    // Normalize both names and split into parts
//    const nameObj1 = getNameParts(normalize(name1));
//    const nameObj2 = getNameParts(normalize(name2));
 
//    // Compare name objects
//    return compareNameObjects(nameObj1, nameObj2);
//  }

// module.exports = areNamesSimilar;

