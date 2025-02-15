import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';
import { colors, typography } from '../theme';
import WelcomeScreen1 from './WelcomeScreen1';
import WelcomeScreen2 from './WelcomeScreen2';
import HomeScreen from './HomeScreen'; // Keep your existing home screen

const Stack = createStackNavigator();

const CustomHeaderTitle = ({ children }) => (
  <Text style={{ color: colors.primaryText, fontSize: 20, fontWeight: '500' }}>
    {children}
  </Text>
);

const screenOptions = {
  headerStyle: {
    backgroundColor: colors.primaryBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTintColor: colors.primaryText,
  headerTitle: (props) => (
    <View style={{ flex: 1, alignItems: 'center', paddingTop: 15 }}>
      <CustomHeaderTitle {...props} />
    </View>
  ),
};

const AppNavigator = () => {
    return (
      <NavigationContainer theme={{
        colors: {
          background: colors.primaryBg,
          card: colors.primaryBg,
          text: colors.primaryText,
          border: colors.divider,
        },
        dark: true,
      }}>
        <Stack.Navigator 
          initialRouteName="WelcomeScreen1"
          screenOptions={screenOptions}
        >
          <Stack.Screen 
            name="WelcomeScreen1" 
            component={WelcomeScreen1} 
            options={{ title: 'Link My Socials' }} 
          />
          <Stack.Screen 
            name="WelcomeScreen2" 
            component={WelcomeScreen2} 
            options={{ title: 'Tutorial' }} 
          />
          <Stack.Screen 
            name="HomeScreen" 
            component={HomeScreen} 
            options={{headerShown: false}} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  };

export default AppNavigator;