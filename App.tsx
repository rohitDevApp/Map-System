/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import Main from './src/Main';

function App() {
  return (
    <SafeAreaProvider>
      <Main/>
    </SafeAreaProvider>
  );
}
export default App;
