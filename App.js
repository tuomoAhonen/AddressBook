import {StatusBar} from 'expo-status-bar';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MyPlaces from './components/MyPlaces';
import Map from './components/Map';

const Stack = createNativeStackNavigator();

export default function App() {
	return (
		<>
			<NavigationContainer>
				<Stack.Navigator>
					<Stack.Screen name='My Places' component={MyPlaces} />
					<Stack.Screen name='Map' component={Map} />
				</Stack.Navigator>
			</NavigationContainer>
			<StatusBar style='auto' />
		</>
	);
}

