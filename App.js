// App.js
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from './src/screens/homeScreen';
import DetailScreen from './src/screens/detailScreen';
import {UnitProvider} from './src/services/context';
import {StatusBar} from 'react-native';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <UnitProvider>
      <NavigationContainer>
      

        <Tab.Navigator
          screenOptions={({route}) => ({
            headerShown: false,
            tabBarIcon: ({focused, color, size}) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: 'gray',
          })}>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Settings" component={DetailScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </UnitProvider>
  );
}
