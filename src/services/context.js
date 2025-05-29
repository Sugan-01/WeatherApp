import React, { createContext, useState, useContext } from 'react';

const UnitContext = createContext();

export const UnitProvider = ({ children }) => {
  const [unit, setUnit] = useState('metric'); // Celsius or Fahrenheit
  const [weather, setWeather] = useState(null); // Shared weather data

  const toggleUnit = () => {
    setUnit(prev => (prev === 'metric' ? 'imperial' : 'metric'));
  };

  return (
    <UnitContext.Provider value={{ unit, toggleUnit, weather, setWeather }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnit = () => useContext(UnitContext);
