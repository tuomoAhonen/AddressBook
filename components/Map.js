import {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {getDatabase, ref, onValue, remove} from 'firebase/database';
import dbConnection from '../firebaseConfig';

//`https://maps.googleapis.com/maps/api/geocode/json?address=${formattedAddress}%&key=${process.env.GOOGLE_API_GEOCODE_KEY}`
const stringSpacingCheck = (word) => {
	if (!/\s/g.test(word)) return word;

	const splittedWord = word.split(/\s/g);
	let formattedWord = '';
	for (let i = 0; i < splittedWord.length; i++) {
		if (i !== 0) {
			formattedWord += '%20';
			formattedWord += splittedWord[i];
		} else {
			formattedWord += splittedWord[i];
		}
	}

	return formattedWord;
};

const Map = ({route, navigation}) => {
	const [location, setLocation] = useState({lat: undefined, lng: undefined});
	const [address, setAddress] = useState('');
	//console.log(route);
	//console.log(navigation);

	const addressSplitted = route?.params?.item?.value.split(',').map((part) => part.trim());
	//console.log(address);
	let formattedAddress = '';
	if (addressSplitted?.length > 0) {
		for (let i = 0; i < addressSplitted.length; i++) {
			if (i !== 0) {
				//console.log('eka', address[i]);
				//formattedAddress.concat('%20', address[i]);
				formattedAddress += '%20';
				formattedAddress += stringSpacingCheck(addressSplitted[i]);
			} else {
				//console.log('toka', address[i]);
				//formattedAddress.concat(address[i]);
				formattedAddress += stringSpacingCheck(addressSplitted[i]);
			}
		}
	}

	//console.log(formattedAddress);
	useEffect(() => {
		if (!formattedAddress) return;
		(async () => {
			try {
				const result = await fetch(
					`https://maps.googleapis.com/maps/api/geocode/json?address=${formattedAddress}%&key=${process.env.GOOGLE_API_KEY}`
				);
				const {results} = await result.json();
				//console.log(results[0].formatted_address);
				if (results[0]?.geometry?.location) {
					if (results[0].formatted_address) {
						setAddress(results[0].formatted_address);
					} else {
						setAddress(route.params.item.value);
					}
					return setLocation(results[0].geometry.location);
				}
			} catch (error) {
				return console.log(error);
			}
		})();
	}, [formattedAddress]);

	//console.log(location);
	return (
		<View style={styles.container}>
			{location?.lat && location?.lng && (
				<MapView
					initialRegion={{latitude: location.lat, longitude: location.lng, latitudeDelta: 0.05, longitudeDelta: 0.05}}
					style={{flex: 1}}
				>
					<Marker coordinate={{latitude: location.lat, longitude: location.lng}} title={address} />
				</MapView>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		//alignItems: 'center',
		justifyContent: 'flex-start',
	},
});

export default Map;
