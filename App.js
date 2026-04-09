import React, { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState("");

  const apiKey = "cf9deaf2557b880315b191314d5577ba";

  // -----------------------------
  //  FETCH CURRENT WEATHER
  // -----------------------------
  async function getWeather(e) {
    e.preventDefault();

    if (!city) {
      setError("Please enter a city name.");
      setWeatherData(null);
      setForecastData(null);
      return;
    }

    try {
      setError("");
      setWeatherData(null);
      setForecastData(null);

      // current weather
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      setWeatherData(data);

      // 5‑day forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`
      );
      const forecastJson = await forecastRes.json();

      if (forecastRes.ok) {
        setForecastData(forecastJson);
      }
    } catch (err) {
      setError("Something went wrong.");
    }
  }

  // -----------------------------
  //  USE MY LOCATION
  // -----------------------------
  async function getLocationWeather() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        setError("");
        setWeatherData(null);
        setForecastData(null);

        // current weather
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Something went wrong.");
          return;
        }

        setWeatherData(data);

        // forecast using lat/lon
        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
        );
        const forecastJson = await forecastRes.json();

        if (forecastRes.ok) {
          setForecastData(forecastJson);
        }

        setCity("");
      } catch (err) {
        setError("Something went wrong.");
      }
    });
  }

  // -----------------------------
  //  PICK 1 FORECAST PER DAY
  // -----------------------------
  function getDailyForecasts(forecastData) {
    if (!forecastData || !forecastData.list) return [];

    const byDay = {};

    forecastData.list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

      if (!byDay[dayKey]) {
        byDay[dayKey] = item;
      }
    });

    return Object.entries(byDay)
      .slice(0, 5)
      .map(([date, item]) => ({ date, item }));
  }

  // -----------------------------
  //  BACKGROUND COLORS
  // -----------------------------
  function getBackground(weather) {
    if (!weather) return "default-bg";

    const main = weather.weather[0].main.toLowerCase();

    if (main.includes("cloud")) return "cloudy-bg";
    if (main.includes("rain")) return "rain-bg";
    if (main.includes("clear")) return "sunny-bg";
    if (main.includes("snow")) return "snow-bg";

    return "default-bg";
  }

  // -----------------------------
  //  RETURN UI
  // -----------------------------
  return (
    <div className={`app ${getBackground(weatherData)}`}>
      <div className={`weather-effect ${getBackground(weatherData)}`}></div>

      {/* RAIN ANIMATION */}
      {weatherData &&
        weatherData.weather[0].main.toLowerCase().includes("rain") && (
          <div className="cartoon-rain-overlay">
            <div className="raindrop" style={{ left: "10%", animationDelay: "0s" }}></div>
            <div className="raindrop" style={{ left: "25%", animationDelay: "0.3s" }}></div>
            <div className="raindrop" style={{ left: "40%", animationDelay: "0.6s" }}></div>
            <div className="raindrop" style={{ left: "55%", animationDelay: "0.1s" }}></div>
            <div className="raindrop" style={{ left: "70%", animationDelay: "0.5s" }}></div>
            <div className="raindrop" style={{ left: "85%", animationDelay: "0.2s" }}></div>
            <div className="raindrop" style={{ left: "17%", animationDelay: "0.7s" }}></div>
          </div>
        )}

      {/* CLOUD ANIMATION */}
      {weatherData &&
        weatherData.weather[0].main.toLowerCase().includes("cloud") && (
          <div className="cloud-overlay">
            <div className="cloud" style={{ top: "10%", left: "-100px", animationDelay: "0s" }}></div>
            <div className="cloud" style={{ top: "30%", left: "-200px", animationDelay: "5s" }}></div>
            <div className="cloud" style={{ top: "50%", left: "-300px", animationDelay: "10s" }}></div>
            <div className="cloud" style={{ top: "70%", left: "-400px", animationDelay: "15s" }}></div>
            <div className="cloud" style={{ top: "20%", right: "200px", animationDelay: "0s" }}></div>
            <div className="cloud" style={{ top: "50%", right: "500px", animationDelay: "0s" }}></div>
            <div className="cloud" style={{ top: "80%", right: "800px", animationDelay: "0s" }}></div>
          </div>
        )}

      <div className="card">
        <h1 className="title">Weather App</h1>

        <form onSubmit={getWeather} className="form">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input"
          />

          <button type="submit" className="button">
            Search
          </button>

          <button type="button" className="button" onClick={getLocationWeather}>
            Use My Location
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {/* CURRENT WEATHER */}
        {weatherData && weatherData.main && (
          <div className="result">
            <h2>{weatherData.name}</h2>

            <img
              src={
                weatherData.weather[0].main.toLowerCase().includes("cloud")
                  ? "/cloudy.png"
                  : weatherData.weather[0].main.toLowerCase().includes("clear")
                  ? "/sun.png"
                  : `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`
              }
              alt="weather icon"
              className="weather-icon"
            />

            <p>Temperature: {weatherData.main.temp}°F</p>
            <p>Feels like: {weatherData.main.feels_like}°F</p>
            <p>Humidity: {weatherData.main.humidity}%</p>
            <p>Weather: {weatherData.weather[0].description}</p>
          </div>
        )}

        {/* 5‑DAY FORECAST */}
        {forecastData && (
          <div className="forecast">
            <h3>5‑Day Forecast</h3>

            <div className="forecast-grid">
              {getDailyForecasts(forecastData).map(({ date, item }) => (
                <div key={date} className="forecast-card">
                  <p>{date}</p>
                  <p>{item.weather[0].main}</p>
                  <p>{Math.round(item.main.temp)}°F</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
