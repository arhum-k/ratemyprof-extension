async function fetchRatings(professorName) {
    const apiUrl = `http://localhost:3000/getRating?name=${encodeURIComponent(professorName)}`;
    try {
      const response = await fetch(apiUrl);
      console.log('fr fetch')
      const data = await response.json();
      console.log(data)
      return data
    } catch (error) {
      console.error('Error fetching rating:', error);
      return [];
    }
  }
  
  function addRatingsToDOM(professorElement, ratings) {
    const ratingsSpan = document.createElement('span');
    if (ratings.length > 0) {
      const ratingsText = ratings.map(rating => {
        return typeof rating.rating === 'number' ? `RMP: ${rating.rating.toFixed(1)}` : `RMP: ${rating.rating}`;
      }).join(', ');
      ratingsSpan.textContent = ` (${ratingsText})`;
    } else {
      ratingsSpan.textContent = ' (RMP: N/A)';
    }
  
    ratingsSpan.style.color = '#007bff';
    professorElement.appendChild(ratingsSpan);
  }
  
  async function processInstructors() {
    const instructorElements = document.querySelectorAll('.ls-instructors .icon + span');
    for (const element of instructorElements) {
      const professorName = element.textContent.trim();
      console.log(professorName,"professorName")
      const ratings = await fetchRatings(professorName);
      console.log('ratings',ratings)
      addRatingsToDOM(element, ratings);
      console.log('done adding dom')
    }
    console.log("DONE PROCESSING INSTRUCTORS")
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processInstructors);
  } else {
    processInstructors();
  }
  