// Get the DOM elements
const locationBtn = document.getElementById('locationBtn');
const searchBtn = document.getElementById('searchBtn');
const citySearch = document.getElementById('citySearch');
const cityName = document.getElementById('cityName');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const forecast = document.getElementById('forecast');
const unitToggle = document.getElementById('unitToggle');
const apiKey = '428a9ca0079404c9f7778f334dd665e2'; // Replace with your OpenWeather API key

let isCelsius = true;

// Hide weather information on page load
document.getElementById('weatherInfo').style.display = 'none';

// Fetch weather data using OpenWeather API
async function fetchWeather(city) {
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    try {
        const weatherResponse = await fetch(weatherApiUrl);
        const weatherData = await weatherResponse.json();
        const forecastResponse = await fetch(forecastApiUrl);
        const forecastData = await forecastResponse.json();

        if (weatherData.cod === 200 && forecastData.cod === "200") {
            document.getElementById('weatherInfo').style.display = 'block'; // Show the weather info
            updateWeatherUI(weatherData);
            updateForecast(forecastData);
        } else {
            alert('City not found or error in fetching data');
            console.log(weatherData, forecastData); // Debugging logs
            document.getElementById('weatherInfo').style.display = 'none'; // Hide weather info if not found
        }
    } catch (error) {
        console.error('Error fetching weather or forecast data:', error);
        document.getElementById('weatherInfo').style.display = 'none'; // Hide weather info on error
    }
}

// Update the weather information on the page
function updateWeatherUI(data) {
    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;

    // Update weather icon based on the weather condition
    const weatherCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${weatherCode}@2x.png`;
}

// Toggle between Celsius and Fahrenheit
unitToggle.addEventListener('click', () => {
    let temp = parseFloat(temperature.textContent);
    if (isCelsius) {
        temperature.textContent = `${Math.round((temp * 9) / 5 + 32)}°F`;
    } else {
        temperature.textContent = `${Math.round((temp - 32) * (5 / 9))}°C`;
    }
    isCelsius = !isCelsius;
});

// Update forecast with data from the OpenWeather API
function updateForecast(forecastData) {
    forecast.innerHTML = ''; // Clear previous forecast

    // Group the forecast by day (since the API provides data every 3 hours)
    const dailyForecast = {};

    forecastData.list.forEach((item) => {
        const date = new Date(item.dt_txt).toLocaleDateString('en-US', { weekday: 'short' });
        if (!dailyForecast[date]) {
            dailyForecast[date] = {
                temp: Math.round(item.main.temp),
                icon: item.weather[0].icon
            };
        }
    });

    // Display forecast for the next 5 days
    Object.keys(dailyForecast).slice(0, 5).forEach((day) => {
        const forecastElement = dailyForecast[day];
        const dayElement = document.createElement('div');
        dayElement.classList.add('text-center');

        dayElement.innerHTML = `
            <p class="text-sm font-semibold">${day}</p>
            <img src="https://openweathermap.org/img/wn/${forecastElement.icon}@2x.png" alt="${forecastElement.temp}°C" class="w-8 h-8 mx-auto my-1">
            <p class="text-sm">${forecastElement.temp}°C</p>
        `;

        forecast.appendChild(dayElement);
    });
}

// Event listener for search button
searchBtn.addEventListener('click', () => {
    const city = citySearch.value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        alert('Please enter a city name');
    }
});

// Event listener for location button (requires geolocation permission)
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
            const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

            try {
                const weatherResponse = await fetch(weatherApiUrl);
                const weatherData = await weatherResponse.json();
                const forecastResponse = await fetch(forecastApiUrl);
                const forecastData = await forecastResponse.json();

                if (weatherData.cod === 200 && forecastData.cod === "200") {
                    document.getElementById('weatherInfo').style.display = 'block'; // Show the weather info
                    updateWeatherUI(weatherData);
                    updateForecast(forecastData);
                } else {
                    console.log(weatherData, forecastData); // Debugging logs
                    alert('Error fetching weather or forecast for your location');
                }
            } catch (error) {
                console.error('Error fetching location weather data:', error);
                document.getElementById('weatherInfo').style.display = 'none'; // Hide the weather info on error
            }
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});
