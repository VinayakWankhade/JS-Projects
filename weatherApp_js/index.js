const searchBtn = document.querySelector('.search-btn');
const input = document.getElementById('cityInput');
const locationBar = document.querySelector('.location-bar');
const recentSearchesContainer = document.querySelector('.tags');
const API_KEY = 'YOUR_SECRETE'; // Use your own API key

// Load recent searches on page load
window.addEventListener('DOMContentLoaded', loadRecentSearches);

searchBtn.addEventListener('click', () => {
  const city = input.value.trim();
  if (city) {
    fetchWeather(city);
  }
});

locationBar.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchWeather(`${lat},${lon}`);
    }, () => {
      alert("Location access denied.");
    });
  } else {
    alert("Geolocation is not supported.");
  }
});

recentSearchesContainer.addEventListener('click', e => {
  if (e.target.classList.contains('tag')) {
    fetchWeather(e.target.textContent);
  }
});

function fetchWeather(query) {
  fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${query}&aqi=no`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error.message);
        return;
      }

      // Save to recent searches
      saveRecentSearch(data.location.name);

      // Optionally store in localStorage for weather.html
      localStorage.setItem('weatherData', JSON.stringify(data));

      // Redirect to weather.html (optional)
      window.location.href = "weather.html";
    })
    .catch(err => {
      console.error(err);
      alert("Failed to fetch weather data.");
    });
}

function saveRecentSearch(city) {
  let recent = JSON.parse(localStorage.getItem('recentSearches')) || [];

  // Avoid duplicates
  if (!recent.includes(city)) {
    recent.unshift(city);
    if (recent.length > 5) recent.pop(); // Keep max 5 items
    localStorage.setItem('recentSearches', JSON.stringify(recent));
    loadRecentSearches();
  }
}

function loadRecentSearches() {
  let recent = JSON.parse(localStorage.getItem('recentSearches')) || [];
  recentSearchesContainer.innerHTML = '';
  recent.forEach(city => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = city;
    recentSearchesContainer.appendChild(tag);
  });
}
