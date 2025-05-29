import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

const WEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
const NEWS_API_KEY = 'YOUR_NEWSAPI_KEY';

export async function getWeather() {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs access to your location for weather updates.',
        buttonPositive: 'OK',
      }
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('Permission denied');
    }
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        try {
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`;
          const response = await axios.get(url);
          const data = response.data;
          resolve({
            temp: data.main.temp,
            description: data.weather[0].description,
          });
        } catch (error) {
          reject(error);
        }
      },
      error => reject(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
}

export async function getNews() {
  const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_API_KEY}`;
  const response = await axios.get(url);
  return response.data.articles;
}

export function filterNewsByWeather(temp, articles) {
  let keywords = [];
  if (temp <= 10) keywords = ['depression', 'crisis', 'loss'];
  else if (temp >= 30) keywords = ['fear', 'violence', 'threat'];
  else keywords = ['success', 'happy', 'growth'];

  return articles.filter(article =>
    keywords.some(keyword =>
      (article.title + article.description).toLowerCase().includes(keyword)
    )
  );
}
