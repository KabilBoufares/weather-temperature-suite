// Temperature Converter Logic
const temperatureConverter = {
    history: [],
    
    conversions: {
        cToF: (c) => (c * 9/5) + 32,
        fToC: (f) => (f - 32) * 5/9,
        cToK: (c) => c + 273.15,
        kToC: (k) => k - 273.15,
        fToK: (f) => (f - 32) * 5/9 + 273.15,
        kToF: (k) => (k - 273.15) * 9/5 + 32
    },

    convert() {
        const inputValue = parseFloat(document.getElementById('inputValue').value);
        const conversionType = document.getElementById('conversionType').value;
        const [fromUnit, toUnit] = conversionType.match(/[A-Z]/g);
        
        const result = this.conversions[conversionType](inputValue).toFixed(2);
        const formula = this.getFormula(conversionType, inputValue);
        
        this.displayResult(result, toUnit, formula);
        this.addToHistory(inputValue, fromUnit, result, toUnit);
    },

    getFormula(type, value) {
        const formulas = {
            cToF: `(${value} × 9/5) + 32`,
            fToC: `(${value} - 32) × 5/9`,
            cToK: `${value} + 273.15`,
            kToC: `${value} - 273.15`,
            fToK: `(${value} - 32) × 5/9 + 273.15`,
            kToF: `(${value} - 273.15) × 9/5 + 32`
        };
        return formulas[type];
    },

    displayResult(result, unit, formula) {
        const resultElement = document.getElementById('result');
        resultElement.innerHTML = `${result} ${this.getUnitSymbol(unit)}<br>
                                  <small class="formula">${formula}</small>`;
        document.getElementById('resultContainer').classList.add('show');
    },

    addToHistory(input, fromUnit, result, toUnit) {
        const entry = {
            input: `${input}${this.getUnitSymbol(fromUnit)}`,
            result: `${result}${this.getUnitSymbol(toUnit)}`,
            timestamp: new Date().toLocaleString()
        };
        
        this.history.unshift(entry);
        if(this.history.length > 5) this.history.pop();
        
        this.renderHistory();
    },

    renderHistory() {
        const historyHTML = this.history.map(entry => `
            <div class="history-item">
                ${entry.input} → ${entry.result}<br>
                <small>${entry.timestamp}</small>
            </div>
        `).join('');
        document.getElementById('history').innerHTML = historyHTML;
    },

    getUnitSymbol(unit) {
        return { C: '°C', F: '°F', K: 'K' }[unit];
    }
};

// Weather Logic
const weatherModule = {
    async getWeather() {
        const cityInput = document.getElementById('cityInput');
        const weatherIcon = document.getElementById('weatherIcon');
        const errorElement = document.getElementById('weatherError');
        
        try {
            errorElement.textContent = '';
            const coords = await this.geocodeCity(cityInput.value);
            const weatherData = await this.fetchWeather(coords);
            this.updateUI(weatherData, coords);
        } catch (error) {
            errorElement.textContent = error.message;
            weatherIcon.className = 'wi wi-na';
        }
    },

    async geocodeCity(city) {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${city}&format=json`
        );
        if (!response.ok) throw new Error('City search failed');
        const data = await response.json();
        if (data.length === 0) throw new Error('City not found');
        return { lat: data[0].lat, lon: data[0].lon };
    },

    async fetchWeather({ lat, lon }) {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`
        );
        if (!response.ok) throw new Error('Weather data unavailable');
        return response.json();
    },

    updateUI(data, coords) {
        const weatherCode = data.current_weather.weathercode;
        
        document.getElementById('temperature').innerHTML = `
            ${data.current_weather.temperature}°C / 
            ${this.celsiusToFahrenheit(data.current_weather.temperature)}°F
        `;
        
        document.getElementById('weatherDescription').textContent = 
            this.getWeatherCondition(weatherCode);
            
        document.getElementById('location').textContent = 
            `Lat: ${coords.lat}, Lon: ${coords.lon}`;
            
        document.getElementById('humidity').textContent = 
            `Humidity: ${data.hourly.relativehumidity_2m[0]}%`;
            
        document.getElementById('weatherIcon').className = 
            `wi ${this.getWeatherIcon(weatherCode)}`;
    },

    celsiusToFahrenheit(c) {
        return ((c * 9/5) + 32).toFixed(1);
    },

    getWeatherCondition(code) {
        const conditions = {
            0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
            45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
            55: 'Dense drizzle', 56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
            61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
            66: 'Light freezing rain', 67: 'Heavy freezing rain', 71: 'Slight snow',
            73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains', 80: 'Slight showers',
            81: 'Moderate showers', 82: 'Violent showers', 85: 'Slight snow showers',
            86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm with hail',
            99: 'Severe thunderstorm'
        };
        return conditions[code] || 'Unknown weather';
    },

    getWeatherIcon(code) {
        const icons = {
            0: 'wi-day-sunny', 1: 'wi-day-sunny-overcast', 2: 'wi-day-cloudy',
            3: 'wi-cloudy', 45: 'wi-fog', 48: 'wi-fog', 51: 'wi-sprinkle',
            53: 'wi-sprinkle', 55: 'wi-sprinkle', 56: 'wi-sleet', 57: 'wi-sleet',
            61: 'wi-rain', 63: 'wi-rain', 65: 'wi-rain', 66: 'wi-sleet',
            67: 'wi-sleet', 71: 'wi-snow', 73: 'wi-snow', 75: 'wi-snow',
            77: 'wi-snowflake-cold', 80: 'wi-showers', 81: 'wi-showers',
            82: 'wi-rain-wind', 85: 'wi-snow-wind', 86: 'wi-snow-wind',
            95: 'wi-thunderstorm', 96: 'wi-storm-showers', 99: 'wi-thunderstorm'
        };
        return icons[code] || 'wi-na';
    }
};

// Event Listeners
document.getElementById('conversionType').addEventListener('change', () => temperatureConverter.convert());
document.getElementById('weatherButton').addEventListener('click', () => weatherModule.getWeather());
window.onload = () => temperatureConverter.convert();