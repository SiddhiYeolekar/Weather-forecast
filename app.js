
const apiKey = "599c87946ef8e2433a2c8025048f64ec"; 
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const currentWeather = document.getElementById("currentWeather");
const forecastContainer = document.getElementById("forecastCards");
const recentDropdown = document.getElementById("recentSearches");
const weatherIcons = {
    Clear: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
    Clouds: "https://cdn-icons-png.flaticon.com/512/414/414825.png",
    Rain: "https://cdn-icons-png.flaticon.com/512/3313/3313982.png",
    Drizzle: "https://cdn-icons-png.flaticon.com/512/4150/4150897.png",
    Thunderstorm: "https://cdn-icons-png.flaticon.com/512/1146/1146869.png",
    Snow: "https://cdn-icons-png.flaticon.com/512/642/642102.png",
    Mist: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
    Smoke: "https://cdn-icons-png.flaticon.com/512/4005/4005899.png",
    Haze: "https://cdn-icons-png.flaticon.com/512/4005/4005900.png",
    Dust: "https://cdn-icons-png.flaticon.com/512/4005/4005903.png",
    Fog: "https://cdn-icons-png.flaticon.com/512/4005/4005902.png",
    Sand: "https://cdn-icons-png.flaticon.com/512/4005/4005903.png",
    Ash: "https://cdn-icons-png.flaticon.com/512/4005/4005898.png",
    Squall: "https://cdn-icons-png.flaticon.com/512/4005/4005897.png",
    Tornado: "https://cdn-icons-png.flaticon.com/512/4005/4005896.png"
};



let recentCities = [];

function showError(message) {
    currentWeather.innerHTML = `
      <div class="error-message">
        <p>⚠️ ${message}</p>
      </div>
    `;
    forecastContainer.innerHTML = ""; // Clear old forecast
  }
  

function updateRecentCities(city) {
    if (!recentCities.includes(city)) {
        recentCities.unshift(city);
        if (recentCities.length > 5) recentCities.pop();
        renderRecentDropdown();
    }
}

function renderRecentDropdown() {
    recentDropdown.innerHTML = "";
    recentCities.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        recentDropdown.appendChild(option);
    });
}


function getWeather(city) {
    document.getElementById("loading").style.display = "block"; // Show loading
    currentWeather.innerHTML = "";
    forecastContainer.innerHTML = "";
  
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById("loading").style.display = "none"; // Hide loading
  
        if (data.cod === 200) {
          currentWeather.innerHTML = `
            <h2>${data.name}</h2>
            <p>Temperature: ${data.main.temp}°C</p>
            <p>Condition: ${data.weather[0].description}</p>
            <p>Humidity 💧 ${data.main.humidity}%</p>
            <p>Wind 🌬️ ${data.wind.speed} m/s</p>
          `;
          updateRecentCities(data.name);
          getForecast(city);
          cityInput.value = ""; 
        } else {
          showError("City not found. Please try again.");
        }
      })
      .catch(() => {
        document.getElementById("loading").style.display = "none";
        showError("Network error. Please try again.");
      });
      
  }
  

  function getForecast(city) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => {
            const daily = {};
            data.list.forEach(item => {
                const date = item.dt_txt.split(" ")[0];
                if (!daily[date] && Object.keys(daily).length < 5) {
                    daily[date] = item;
                }
            });

            forecastContainer.innerHTML = Object.values(daily).map(item => {
                const condition = item.weather[0].main;
                const iconUrl = weatherIcons[condition] || "https://cdn-icons-png.flaticon.com/512/869/869869.png";

                return `
                    <div class="card">
                        <h3>${new Date(item.dt_txt).toLocaleDateString()}</h3>
                        <img src="${iconUrl}" alt="${condition}" />
                        <p>${condition}</p>
                        <p>${item.main.temp}°C</p>
                        <p>Humid💧 ${item.main.humidity}%</p>
                        <p>Wind🌬️ ${item.wind.speed} m/s</p>
                    </div>
                `;
            }).join("");
        });
}


searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) {
      showError("Please enter a city name.");
      return;
    }
    getWeather(city);
  });
  

recentDropdown.addEventListener("change", (e) => {
    getWeather(e.target.value);
});

locationBtn.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`)
            .then(res => res.json())
            .then(data => {
                getWeather(data.name);
            });
    });
});
