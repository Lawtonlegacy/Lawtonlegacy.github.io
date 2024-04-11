let CURRENTCITY = "";
let CURRENTLOCATIONID = document.cookie;
let WEATHERRESULTS = {};
const cityInput = document.getElementById('cityInput');
const APIKEY = 'c62b81d6bbe0452f9cc195402240804';
const resultsList = document.getElementById('resultsList');

if (CURRENTLOCATIONID !== "") {
    getWeatherInfo(CURRENTLOCATIONID);
    document.getElementById('favoriteInputBox').checked = true;
}

// Function to fetch potential locations from the search API
async function fetchPotentialLocations(query) {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/search.json?key=${APIKEY}&q=${query}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching potential locations:', error);
        return [];
    }
}

// Function to populate the results list with potential locations
function populateResultsList(locations) {
    resultsList.innerHTML = '';
    locations.forEach(location => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result');
        const country = location.country === "United States of America" ? "USA" : location.country;
        const cityName = country === "USA" ? `${location.name}, ${location.region}, ${country}` : `${location.name}, ${country}`;
        resultItem.textContent = cityName;
        resultItem.addEventListener('click', () => {
            cityInput.value = cityName;
            CURRENTCITY = cityInput.value;
            resultsList.innerHTML = '';
            resultsList.style.display = 'none';
            CURRENTLOCATIONID = location.id;
            document.getElementById('favoriteInputBox').checked = (CURRENTLOCATIONID === document.cookie);
            getWeatherInfo(location.id);
        });
        resultsList.appendChild(resultItem);
    });
    resultsList.style.display = 'block';
}

// Event listener for input field to handle Enter key press
cityInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        const userInput = cityInput.value.trim();
        if (userInput) {
            const potentialLocations = await fetchPotentialLocations(userInput);
            if (potentialLocations.length > 0) {
                populateResultsList(potentialLocations);
            } else {
                console.error('No potential locations found for the specified query.');
                window.alert('No potential locations found for the specified query. \
                              Please check spelling and enter a valid city name.');
            }
        } else {
            console.error('Please enter a city name.');
            window.alert('Please enter a city name.');
        }
    }
});

function displayWeather() {
    const data = WEATHERRESULTS;
    const forecast = data.forecast.forecastday;
    const in_celsius = document.getElementById('toggleUnit').checked;
    const currentTemp = in_celsius ? `${WEATHERRESULTS.current.temp_c}\u00B0C` : `${WEATHERRESULTS.current.temp_f}\u00B0F`;
    const cityName = (data.location.country === 'United States of America') ?
        `${data.location.name}, ${data.location.region}` :
        `${data.location.name}, ${data.location.country}`;
    document.getElementById('tempValue').innerText = currentTemp;
    document.getElementById('cityName').innerText = cityName;
    getIcon(data);
    for (let i = 1; i <= forecast.length; i++) {
        let ithDaysForecast = forecast[i - 1];
        let minTemp = in_celsius ? `${ithDaysForecast.day.mintemp_c}\u00B0C` : `${ithDaysForecast.day.mintemp_f}\u00B0F`;
        let maxTemp = in_celsius ? `${ithDaysForecast.day.maxtemp_c}\u00B0C` : `${ithDaysForecast.day.maxtemp_f}\u00B0F`;
        let avgTemp = in_celsius ? `${ithDaysForecast.day.avgtemp_c}\u00B0C` : `${ithDaysForecast.day.avgtemp_f}\u00B0F`;
        let dateString = ithDaysForecast.date.substring(5, 10).replace('-', '/');
        let iconString = ithDaysForecast.day.condition.icon.replace(/^\/\/cdn\.weatherapi\.com\//, "");
        document.getElementById(`day${i}`).innerHTML = `
            <td id="forecastDate">${dateString}</td>
            <td id="forecastImg"><img id="weatherIconSmall" src="${iconString}"></td>
            <td id="forecastMinTemp">${minTemp}</td>
            <td id="forecastMaxTemp">${maxTemp}</td>
            <td id="forecastAvgTemp">${avgTemp}</td>
        `;
    }
    document.getElementById('cityName').removeAttribute('hidden');
    document.getElementById('temperature').removeAttribute('hidden');
    document.getElementById('weatherTableContainer').removeAttribute('hidden');
    document.getElementById('checkboxes').removeAttribute('hidden');
}

function getIcon(data) {
    let icon_string = data.current.condition.icon;
    const modified_string = icon_string.replace(/^\/\/cdn\.weatherapi\.com\//, "");
    document.getElementById('weatherIcon').src = modified_string;
    document.getElementById('conditionText').innerText = data.current.condition.text;
    document.getElementById('weatherIcon').removeAttribute('hidden');
}

function getWeatherInfo(location_id) {
    // console.log(`Fetching weather information for ${CURRENTCITY} | location_id = ${location_id}`)
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=${APIKEY}&q=id:${location_id}&days=3`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            WEATHERRESULTS = data;
            displayWeather();
        })
        .catch(error => console.error('Error fetching weather information:', error));
}

function saveFavorite() {
    if (document.cookie == CURRENTLOCATIONID) {
        document.cookie = "";
    } else {
        document.cookie = CURRENTLOCATIONID;
    }
}
