async function fetchProfRMPInfo(professorName) {
    const apiUrl = `http://localhost:3000/getRating?name=${encodeURIComponent(professorName)}`;
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log(professorName, "data",data)
      return data
    } catch (error) {
      console.error('Error fetching rating:', error);
      return [];
    }
  }

  function processInfo(profRMPInfo) {
    if (profRMPInfo.length === 0) return null;
    if (profRMPInfo.length === 1) return profRMPInfo[0];

    console.log('PROF LISTINGS > 1 for', profRMPInfo)

  
    let totalWeightedRating = 0;
    let totalWeightedDifficulty = 0;
    let totalWeightedWouldTakeAgain = 0;
    let totalRatings = 0;
  
    for (const info of profRMPInfo) {
      if (info.numRatings > 0) {
        totalWeightedRating += info.rating * info.numRatings;
        totalWeightedDifficulty += info.avgDifficulty * info.numRatings;
        // Only include wouldTakeAgainPercent if it's not -1 (which likely indicates N/A)
        if (info.wouldTakeAgainPercent !== -1) {
          totalWeightedWouldTakeAgain += info.wouldTakeAgainPercent * info.numRatings;
        }
        totalRatings += info.numRatings;
      }
    }
    console.log('totalRatings',totalRatings)
    if (totalRatings === 0) return null;
  
    return {
      name: profRMPInfo[0].name,
      rating: totalWeightedRating / totalRatings,
      avgDifficulty: totalWeightedDifficulty / totalRatings,
      wouldTakeAgainPercent: totalWeightedWouldTakeAgain / totalRatings,
      numRatings: totalRatings,
      school: profRMPInfo[0].school
    };
  }
  
  async function processInstructors() {
    const instructorContainers = document.querySelectorAll('.ls-instructors');
    for (const container of instructorContainers) {
      const instructorElements = container.querySelectorAll('span:not(.icon)');
      for (const element of instructorElements) {
        const professorName = element.textContent.trim();
        if (professorName && professorName !== ',') {
          const profRMPInfo = await fetchProfRMPInfo(professorName);
          console.log('fetchRaitngs results',profRMPInfo)
          addProfRMPInfoToDOM(element, profRMPInfo);
        }
      }
    }
    console.log("DONE PROCESSING INSTRUCTORS");
  }
  //if profRMPInfo.length = 0, means no teacher exists, if rating exists but = 0, may be N/a or acc 0
  function addProfRMPInfoToDOM(professorElement, profRMPInfo) {
    const profRMPInfoSpan = document.createElement('span');
    const processedInfo = processInfo(profRMPInfo);

    console.log('processe profRMPInfo',processedInfo)
    if (processedInfo && processedInfo.numRatings > 0) {
      profRMPInfoSpan.textContent = ` (RMP: ${processedInfo.rating.toFixed(1)})`;
      profRMPInfoSpan.dataset.originalRatings = JSON.stringify(profRMPInfo);
      profRMPInfoSpan.dataset.processedRating = JSON.stringify(processedInfo);

      profRMPInfoSpan.addEventListener('click', showDetailedRatingsPopup);


    } else {
      profRMPInfoSpan.textContent = ' --';
    }
  
    profRMPInfoSpan.style.color = '#007bff';
    professorElement.appendChild(profRMPInfoSpan);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processInstructors);
  } else {
    processInstructors();
  }
  

  function showDetailedRatingsPopup(event) {
    const span = event.target;
    const originalRatings = JSON.parse(span.dataset.originalRatings);
    const processedRating = JSON.parse(span.dataset.processedRating);
  
    let detailedInfo = '';
  
    if (processedRating.isWeightedAverage) {
      detailedInfo += `<h3 class="popup-heading">Weighted Averages:</h3>`;
        detailedInfo += `<p class="popup-detail"><strong>Rating:</strong> ${processedRating.rating.toFixed(2)}</p>`;
        detailedInfo += `<p class="popup-detail"><strong>Difficulty:</strong> ${processedRating.avgDifficulty.toFixed(2)}</p>`;
        detailedInfo += `<p class="popup-detail"><strong>Would Take Again:</strong> ${processedRating.wouldTakeAgainPercent.toFixed(2)}%</p>`;
        detailedInfo += `<p class="popup-detail"><strong>Total Ratings:</strong> ${processedRating.numRatings}</p>`;
        detailedInfo += `<h3 class="popup-heading">Original Listings:</h3>`;
    }

  
    originalRatings.forEach((rating, index) => {
      const indexText = index > 0 ? ` (${index + 1})` : '';
      detailedInfo += `<h4 class="popup-professor-name"><a href="https://www.ratemyprofessors.com/professor/${rating.urlId}" target="_blank">${rating.name}${indexText}</a></h4>`;
      if (rating.numRatings === 0) {
          detailedInfo += `<p class="popup-no-ratings">No ratings</p>`;
      } else {
          detailedInfo += `<p class="popup-detail"><strong>Rating:</strong> ${rating.rating}</p>`;
          detailedInfo += `<p class="popup-detail"><strong>Difficulty:</strong> ${rating.avgDifficulty}</p>`;
          detailedInfo += `<p class="popup-detail"><strong>Would Take Again:</strong> ${Math.round(rating.wouldTakeAgainPercent)}%</p>`;
          detailedInfo += `<p class="popup-detail"><strong>Number of Ratings:</strong> ${rating.numRatings}</p>`;
      }});

    
  
    // Create popup
    const popup = document.createElement('div');
    popup.innerHTML = detailedInfo;
    popup.classList.add('popup');

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('popup-close-button');
    closeButton.addEventListener('click', () => document.body.removeChild(popup));
    popup.appendChild(closeButton);
    
    document.body.appendChild(popup);
  
    // Close popup when clicking outside
    document.addEventListener('click', function closePopup(e) {
      if (!popup.contains(e.target) && e.target !== span) {
        document.body.removeChild(popup);
        document.removeEventListener('click', closePopup);
      }
    });

  const style = document.createElement('style');
  style.textContent = `
  .popup {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 20px;
    z-index: 1000;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    font-family: 'Arial', sans-serif;
    color: #333;
    animation: fadeIn 0.3s ease-in-out;
  }
  .popup-heading {
    font-size: 18px;
    margin-bottom: 10px;
    font-weight: bold;
    color: #0056b3; /* Softer blue */
  }
  .popup-detail {
    font-size: 16px;
    margin-bottom: 8px;
    color: #555;
  }
  .popup-professor-name a {
    font-size: 16px;
    color: #0056b3; /* Softer blue */
    text-decoration: underline; /* Always underlined */
    font-weight: bold;
  }
  .popup-no-ratings {
    font-size: 14px;
    color: #999;
  }
  .popup-close-button {
    margin-top: 15px;
    background-color: #f0f0f0;
    color: #333;
    padding: 8px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s ease;
  }
  .popup-close-button:hover {
    background-color: #e0e0e0;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// Append the style to the document head
document.head.appendChild(style);
}