import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  Image,
  Linking,
  TouchableOpacity,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import {useUnit} from '../services/context';

const WEATHER_API_KEY = '5f285d33be01b937453b7e1688fc75ee';
const NEWS_API_KEY = '7ef2f7dd4abe471c9845bb1f0c226892';

const WeatherScreen = () => {
  const {unit, toggleUnit, weather, setWeather} = useUnit();

  const [forecast, setForecast] = useState([]);
  const [news, setNews] = useState([]);
  const [newsKeyword, setNewsKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getLocationAndWeather();
  }, [unit]); // Refetch when unit changes

  const getLocationAndWeather = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setError('Location permission denied');
          setLoading(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        async position => {
          const {latitude, longitude} = position.coords;
          await fetchWeather(latitude, longitude);
        },
        err => {
          setError('Location error: ' + err.message);
          setLoading(false);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    } catch (err) {
      setError('Permission error: ' + err.message);
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lon) => {
    try {
      setLoading(true);
      const current = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${WEATHER_API_KEY}`,
      );

      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${WEATHER_API_KEY}`,
      );

      const currentWeather = {
        city: current.data.name,
        timezone: current.data.timezone,
        temp: current.data.main.temp,
        feelsLike: current.data.main.feels_like,
        tempMin: current.data.main.temp_min,
        tempMax: current.data.main.temp_max,
        humidity: current.data.main.humidity,
        wind: current.data.wind.speed,
        description: current.data.weather[0].description,
        icon: current.data.weather[0].icon,
        rain: current.data.rain ? current.data.rain['1h'] : 0,
      };

      setWeather(currentWeather); // Set in context

      const daily = forecastRes.data.list.filter(item =>
        item.dt_txt.includes('12:00:00'),
      );
      setForecast(daily);

      await fetchNews(currentWeather.temp);
    } catch (err) {
      setError('Weather fetch error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async temp => {
    try {
      let keyword = 'general';
      if (temp <= 10) keyword = 'depression';
      else if (temp >= 30) keyword = 'fear';
      else keyword = 'happiness OR winning';

      setNewsKeyword(keyword);

      const res = await axios.get(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(
          keyword,
        )}&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`,
      );

      const topNews = res.data.articles.slice(0, 5);
      setNews(topNews);
    } catch (err) {
      setError('News fetch error: ' + err.message);
    }
  };

  if (loading)
    return <ActivityIndicator style={{flex: 1}} size="large" color="#007AFF" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const windUnit = unit === 'metric' ? 'm/s' : 'mph';

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <StatusBar backgroundColor="#f2f9ff" barStyle="dark-content" />
      {/* <TouchableOpacity
        onPress={toggleUnit}
        style={styles.toggleButton}
      >
        <Text style={styles.toggleText}>
          Switch to {unit === 'metric' ? 'Fahrenheit' : 'Celsius'}
        </Text>
      </TouchableOpacity> */}

      <Text style={styles.title}>{weather.city}</Text>

      <Image
        source={{
          uri: `https://openweathermap.org/img/wn/${weather.icon}@4x.png`,
        }}
        style={styles.weatherIcon}
      />
      <Text style={styles.temp}>
        {Math.round(weather.temp)}
        {tempUnit}
      </Text>
      <Text style={styles.description}>{weather.description}</Text>

      <View style={styles.details}>
        <Text style={styles.bodyText}>
          Feels like: {Math.round(weather.feelsLike)}
          {tempUnit}
        </Text>
        <Text style={styles.bodyText}>
          Low: {Math.round(weather.tempMin)}
          {tempUnit}
        </Text>
        <Text style={styles.bodyText}>
          High: {Math.round(weather.tempMax)}
          {tempUnit}
        </Text>
        <Text style={styles.bodyText}>
          Wind: {weather.wind} {windUnit}
        </Text>
        <Text style={styles.bodyText}>Humidity: {weather.humidity}%</Text>
        <Text style={styles.bodyText}>Rain: {weather.rain} mm</Text>
      </View>

      <Text style={styles.subtitle}>5-Day Forecast</Text>
      {forecast.map((item, index) => {
        const date = new Date(item.dt_txt);
        const day = date.toLocaleDateString('en-US', {weekday: 'short'});

        return (
          <View key={index} style={styles.forecast}>
            <Text style={styles.day}>{day}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                source={{
                  uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
                }}
                style={{width: 40, height: 40, marginRight: 10}}
              />
              <View>
                <Text>{item.weather[0].description}</Text>
                <Text>
                  {Math.round(item.main.temp)}
                  {tempUnit} (Feels {Math.round(item.main.feels_like)}
                  {tempUnit})
                </Text>
              </View>
            </View>
          </View>
        );
      })}

      <Text style={styles.subtitle}>News Headlines</Text>
      <Text style={{fontSize: 14, marginBottom: 5, color: '#666'}}>
        News filtered by:{' '}
        <Text style={{fontWeight: 'bold'}}>{newsKeyword}</Text>
      </Text>

      {news.length === 0 ? (
        <Text style={styles.noNews}>No relevant news found.</Text>
      ) : (
        news.map((article, index) => (
          <View key={index} style={styles.newsItem}>
            <Image
              source={{
                uri: article.urlToImage || 'https://via.placeholder.com/150',
              }}
              style={styles.newsImage}
              resizeMode="cover"
            />
            <Text style={styles.newsTitle}>{article.title}</Text>
            {article.description ? (
              <Text style={styles.newsDesc}>{article.description}</Text>
            ) : null}
            <TouchableOpacity onPress={() => Linking.openURL(article.url)}>
              <Text style={styles.link}>Read more</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e6f2ff',
    flex:1
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 10,
  },
  temp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff6347',
    alignSelf: 'center',
  },
  description: {
    fontSize: 18,
    fontStyle: 'italic',
    alignSelf: 'center',
    marginBottom: 20,
  },
  weatherIcon: {
    width: 200,
    height: 200,
    alignSelf: 'center',
  },
  details: {
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 16,
    marginVertical: 2,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  forecast: {
    backgroundColor: '#d9e8ff',
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
  },
  day: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  newsItem: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  newsImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  newsTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  newsDesc: {
    fontSize: 14,
    marginBottom: 10,
  },
  link: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 15,
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  error: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    color: 'red',
    fontSize: 16,
  },
  noNews: {
    fontStyle: 'italic',
    color: '#555',
  },
});

export default WeatherScreen;
