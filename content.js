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
      detailedInfo += `<h3>Weighted Averages:</h3>`;
      detailedInfo += `<p>Rating: ${processedRating.rating.toFixed(2)}</p>`;
      detailedInfo += `<p>Difficulty: ${processedRating.avgDifficulty.toFixed(2)}</p>`;
      detailedInfo += `<p>Would Take Again: ${processedRating.wouldTakeAgainPercent.toFixed(2)}%</p>`;
      detailedInfo += `<p>Total Ratings: ${processedRating.numRatings}</p>`;
      detailedInfo += `<h3>Original Listings:</h3>`;
    }
  
    originalRatings.forEach((rating, index) => {
      detailedInfo += originalRatings.length > 1 ? `<h4>Listing ${index + 1}:</h4>` : '';
      detailedInfo += `<p>Rating: ${rating.rating}</p>`;
      detailedInfo += `<p>Difficulty: ${rating.avgDifficulty}</p>`;
      detailedInfo += `<p>Would Take Again: ${rating.wouldTakeAgainPercent}%</p>`;
      detailedInfo += `<p>Number of Ratings: ${rating.numRatings}</p>`;
    });
  
    // Create popup
    const popup = document.createElement('div');
    popup.innerHTML = detailedInfo;
    popup.style.position = 'fixed';
    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'white';
    popup.style.border = '1px solid black';
    popup.style.padding = '20px';
    popup.style.zIndex = '1000';
    popup.style.maxHeight = '80vh';
    popup.style.overflowY = 'auto';
    popup.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
  
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '10px';
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
  }