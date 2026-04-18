// script.js

// For index.html
if (document.getElementById('schemeForm')) {
  document.getElementById('schemeForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Store form data for results page
    const formData = {
      fullName: document.getElementById('fullName').value,
      dob: document.getElementById('dob').value,
      familyIncome: document.getElementById('familyIncome').value,
      occupation: document.getElementById('occupation').value,
      gender: document.getElementById('gender').value
    };

    // Store in localStorage (in real app, this would be sent to backend)
    localStorage.setItem('userProfile', JSON.stringify(formData));

    // Redirect to result page
    window.location.href = 'result.html';
  });
}

// For result.html
if (document.getElementById('loadingSection')) {
  // Simulate backend processing delay
  setTimeout(function() {
    loadResults();
  }, 3000); // 3 seconds loading
}

function loadResults() {
  const resultsContainer = document.getElementById('resultsContainer');

  // Get user profile from localStorage (simulating backend data)
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

  // Simulate backend API call - in real app, this would be an actual API request
  fetchResultsFromBackend(userProfile)
    .then(results => {
      displayResults(results);
    })
    .catch(error => {
      displayError('Failed to load results. Please try again.');
    });
}

function fetchResultsFromBackend(userProfile) {
  // Make actual API call to Flask backend
  return fetch('http://localhost:5000/api/check-eligibility', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userProfile)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Transform backend response to match our frontend format
    return data.schemes.map(scheme => ({
      id: scheme.id,
      title: scheme.title,
      description: scheme.description,
      status: scheme.status.toLowerCase().replace(' ', '-'),
      statusText: scheme.status
    }));
  });
}

function generateMockResults(profile) {
  const results = [];
  const income = parseInt(profile.familyIncome) || 0;

  // Mock eligibility logic based on profile
  if (income < 500000) {
    results.push({
      id: 1,
      title: 'Pradhan Mantri Awas Yojana',
      description: 'Housing assistance for low-income families. Provides financial support for home construction or purchase.',
      status: 'high-match',
      statusText: 'High Match'
    });
  }

  if (income < 300000) {
    results.push({
      id: 2,
      title: 'Ayushman Bharat',
      description: 'Health insurance scheme providing coverage up to ₹5 lakhs per family per year for secondary and tertiary care.',
      status: 'eligible',
      statusText: 'Eligible'
    });
  }

  if (profile.occupation.toLowerCase().includes('farmer') || income < 200000) {
    results.push({
      id: 3,
      title: 'MGNREGA',
      description: 'Guaranteed wage employment for rural households. Provides 100 days of work per year at minimum wage.',
      status: 'potential',
      statusText: 'Potential Match'
    });
  }

  // Add some default schemes
  if (results.length === 0) {
    results.push({
      id: 4,
      title: 'Pradhan Mantri Jan Dhan Yojana',
      description: 'Financial inclusion program providing banking services to unbanked citizens.',
      status: 'eligible',
      statusText: 'Eligible'
    });
  }

}

function displayResults(results) {
  const resultsContainer = document.getElementById('resultsContainer');

  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="single-result-card">
        <div class="no-results">
          <p>No schemes found matching your profile</p>
          <p class="body">Please update your information or try again later.</p>
        </div>
      </div>
    `;
  } else {
    const schemesHTML = results.map(result => `
      <div class="scheme-item">
        <div class="scheme-header">
          <h4 class="scheme-title">${result.title}</h4>
          <span class="scheme-status status-${result.status}">${result.statusText}</span>
        </div>
        <p class="scheme-description">${result.description}</p>
      </div>
    `).join('');

    resultsContainer.innerHTML = `
      <div class="single-result-card">
        <div class="schemes-list">
          ${schemesHTML}
        </div>
      </div>
    `;
  }

  // Hide loading and show results
  document.getElementById('loadingSection').style.display = 'none';
  document.getElementById('resultSection').style.display = 'flex';
}

function displayError(message) {
  const resultsContainer = document.getElementById('resultsContainer');
  resultsContainer.innerHTML = `
    <div class="single-result-card">
      <div class="no-results">
        <p>Error loading results</p>
        <p class="body">${message}</p>
      </div>
    </div>
  `;

  document.getElementById('loadingSection').style.display = 'none';
  document.getElementById('resultSection').style.display = 'flex';
}