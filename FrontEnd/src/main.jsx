import React from 'react';
import ReactDOM from 'react-dom/client'; // Ensure this is installed via npm
import AppNavigator from './screens/AppNavigator'; // Your AppNavigator component
import { 
  useFonts,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
} from '@expo-google-fonts/nunito';

function App() {
  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
  });

  if (!fontsLoaded) {
    return null; // Or a loading screen
  }

  return (
    <React.StrictMode>
      <AppNavigator />
    </React.StrictMode>
  );
}

// Mount your app to the root element in index.html
ReactDOM.createRoot(document.getElementById('root')).render(<App />);