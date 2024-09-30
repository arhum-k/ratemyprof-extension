const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const stringSimilarity = require('string-similarity');  // Fuzzy matching library
const fuzz = require('fuzzball'); 
const areNamesSimilar = require('./stringSimilarity.js');


const app = express();
app.use(cors());

const threshold = 80;  // Set a threshold for similarity (out of 100)

// Function to compute the fuzzy similarity between two names
function isSimilar(professorFullName, inputName) {
  // Compare full names using fuzzball's ratio
  const fullMatchScore = fuzz.ratio(professorFullName.toLowerCase(), inputName.toLowerCase());

  // Split the names and use fuzzball's partial ratio for more flexible matching
  const professorNameParts = professorFullName.toLowerCase().split(' ');
  const inputNameParts = inputName.toLowerCase().split(' ');

  const firstNameScore = fuzz.partial_ratio(professorNameParts[0], inputNameParts[0]);
  const lastNameScore = fuzz.partial_ratio(professorNameParts[professorNameParts.length - 1], inputNameParts[inputNameParts.length - 1]);

  // Return true if either full name score is high or both first and last name are reasonably close
  return fullMatchScore >= threshold || (firstNameScore >= threshold && lastNameScore >= threshold);
}


app.get('/getRating', async (req, res) => {
  try {
    const professorName = req.query.name;

    // Define the headers for the GraphQL request
    const headers = {
      'Authorization': 'Basic dGVzdDp0ZXN0',  // Replace with your actual credentials
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Connection': 'keep-alive',
      'Cookie': 'ccpa-notice-viewed-02=true; cid=I3_j_yoLB9-20240912; userSchoolId=U2Nob29sLTEwNzI=; userSchoolLegacyId=1072; userSchoolName=University%20of%20California%20Berkeley',
      'Origin': 'https://www.ratemyprofessors.com',
      'Referer': 'https://www.ratemyprofessors.com/search/professors/1072?q=' + professorName,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    };

    // Define the GraphQL query
    const query = {
        query: `
          query TeacherSearchResultsPageQuery($query: TeacherSearchQuery!) {
            search: newSearch {
              teachers(query: $query, first: 8, after: "") {
                edges {
                  node {
                    firstName
                    lastName
                    avgRating
                    numRatings
                    wouldTakeAgainPercent
                    avgDifficulty
                    school {
                      name
                      id
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          query: {
            text: professorName,
            schoolID: "U2Nob29sLTEwNzI=", // UC Berkeley
            fallback: true
          },
          schoolID: "U2Nob29sLTEwNzI=", // UC Berkeley
          includeSchoolFilter: true
        }
      };

    // Make the POST request to RateMyProfessors GraphQL API
    console.log('fetching rating for', professorName)
    const response = await fetch('https://www.ratemyprofessors.com/graphql', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(query)
    });

    if (!response.ok) {
        const errorMessage = `Failed to fetch data: ${response.status} ${response.statusText}`;
        console.error(errorMessage);
        return res.status(500).json({ error: errorMessage });
      }

    const data = await response.json();
    //console.log(data.data.search.teachers.edges)

    if (data && data.data && data.data.search && data.data.search.teachers && data.data.search.teachers.edges.length > 0) {
        const listings = data.data.search.teachers.edges;
        if (listings.length === 0) {
            console.log(`No results found for professor: ${professorName}`);
            return res.status(404).json({ message: 'No professor found.' });
          }
        console.log('filtering results')
        // const filteredListings = listings.filter(professor => {
        //     const fullName = `${professor.node.firstName} ${professor.node.lastName}`;
        //     const similarity = stringSimilarity.compareTwoStrings(fullName.toLowerCase(), professorName.toLowerCase());
        //     return similarity >= threshold;
        // });
        const filteredListings = listings.filter(professor => {
            const fullName = `${professor.node.firstName} ${professor.node.lastName}`;
            const similarity = areNamesSimilar(fullName, professorName);
            console.log(similarity)
            return similarity

           //return isSimilar(fullName, professorName); // Use the fuzzy match function
          });
        console.log('filtered listings',filteredListings)
        if (filteredListings.length > 0) {
            let professorMatches = [];
            
            filteredListings.forEach(professor => {
                professorMatches.push({
                name: `${professor.node.firstName} ${professor.node.lastName}`,
                rating: professor.node.avgRating,
                numRatings: professor.node.numRatings,
                wouldTakeAgainPercent: professor.node.wouldTakeAgainPercent,
                avgDifficulty: professor.node.avgDifficulty,
                school: professor.node.school.name
              });
            });
            console.log('done searching ratings')
            res.json(professorMatches);
          } else {
            console.log(`No matching professor found for: ${professorName}`);
            return res.json([])
          }
        } else {
            console.log(`No professor found for: ${professorName}`);
            return res.json([])
        }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching the rating' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
