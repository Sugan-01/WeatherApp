import React from 'react';
import { View, Text, StyleSheet, Image, Switch } from 'react-native';
import { useUnit } from '../services/context';

const DetailScreen = () => {
  const { unit, toggleUnit, weather } = useUnit();

  if (!weather) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No weather data available.</Text>
      </View>
    );
  }

  const isCelsius = unit === 'metric';
  const tempUnit = isCelsius ? '°C' : '°F';
  const windUnit = isCelsius ? 'm/s' : 'mph';

  return (
    <View style={styles.container}>
     

      <Text style={styles.city}>{weather.city} Detailed Weather</Text>
      <Image
        source={{ uri: `https://openweathermap.org/img/wn/${weather.icon}@4x.png` }}
        style={styles.icon}
      />
      <Text style={styles.temp}>{Math.round(weather.temp)}{tempUnit}</Text>
      <Text style={styles.description}>{weather.description}</Text>

      <View style={styles.details}>
        <Text style={styles.detailText}>Feels Like: {Math.round(weather.feelsLike)}{tempUnit}</Text>
        <Text style={styles.detailText}>Min Temp: {Math.round(weather.tempMin)}{tempUnit}</Text>
        <Text style={styles.detailText}>Max Temp: {Math.round(weather.tempMax)}{tempUnit}</Text>
        <Text style={styles.detailText}>Humidity: {weather.humidity}%</Text>
        <Text style={styles.detailText}>Wind Speed: {weather.wind} {windUnit}</Text>
        <Text style={styles.detailText}>Rain Volume: {weather.rain} mm</Text>
      </View>

       <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Celsius</Text>
        <Switch
          value={!isCelsius} // Switch on means Fahrenheit
          onValueChange={toggleUnit}
          trackColor={{ false: '#81b0ff', true: '#007AFF' }}
          thumbColor={isCelsius ? '#f4f3f4' : '#f5dd4b'}
          
        />
        <Text style={styles.switchLabel}>Fahrenheit</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e6f2ff',
    flex: 1,
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop:40
  },
  switchLabel: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  city: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  temp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff6347',
  },
  description: {
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  icon: {
    width: 300,
    height: 300,
    marginBottom: 10,
  },
  details: {
    width: '100%',
  },
  detailText: {
    fontSize: 18,
    marginVertical: 4,
  },
  message: {
    fontSize: 18,
    marginTop: 50,
    color: '#666',
  },
});

export default DetailScreen;
