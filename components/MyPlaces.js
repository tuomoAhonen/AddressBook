import {useEffect, useState} from 'react';
import {StyleSheet, View, FlatList, Pressable} from 'react-native';
import {ref, onValue, remove, push} from 'firebase/database';
import {Button, Icon, Input, Text} from '@rneui/themed';
import {useDebouncedCallback} from 'use-debounce';
import dbConnection from '../firebaseConfig';
import FlatListItem from './FlatListItem';

const refBasic = ref(dbConnection, `Places/`);
const refWithId = (id) => {
	return ref(dbConnection, `Places/${id}`);
};

//`https://places.googleapis.com/v1/places/ChIJj61dQgK6j4AR4GeTYWZsKWw?fields=id,displayName&key=${process.env.GOOGLE_API_KEY}`

//`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${newPlace}&inputtype=textquery&key=${process.env.GOOGLE_API_KEY}`

//`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${newPlace}&types=geocode&key=${process.env.GOOGLE_API_KEY}`
const MyPlaces = () => {
	const [placesList, setPlacesList] = useState([]);
	const [placePredictions, setPlacePredictions] = useState([]);
	const [newPlace, setNewPlace] = useState('');

	const savePlace = () => {
		// do something
		(async () => {
			try {
				await push(refBasic, newPlace);
				return setNewPlace('');
			} catch (error) {
				return console.log(error);
			}
		})();
	};

	const debouncedPredictions = useDebouncedCallback(async () => {
		try {
			const results = await fetch(
				`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${newPlace}&types=geocode&key=${process.env.GOOGLE_API_KEY}`
			);
			const {predictions} = await results.json();
			//console.log(predictions[0].description);
			if (predictions?.length > 0) {
				return setPlacePredictions(
					predictions.map((prediction) => {
						if (prediction.description) {
							return prediction.description;
						}
					})
				);
			}
		} catch (error) {
			return console.log(error);
		}
	}, 500);

	useEffect(() => {
		if (!newPlace) {
			if (placePredictions?.length > 0) return setPlacePredictions([]);
			return;
		}
		debouncedPredictions();
	}, [newPlace]);

	useEffect(() => {
		onValue(
			refBasic,
			(snapshot) => {
				if (!snapshot.exists()) return setPlacesList([]);
				const data = snapshot.val();
				//console.log(data);
				const results = [];
				for (const [key, value] of Object.entries(data)) {
					if (key.charAt(0) !== '-') {
						(async () => {
							try {
								return await remove(refWithId(key));
							} catch (error) {
								return console.log(error);
							}
						})();
					} else if (key.charAt(0) === '-') {
						//console.log(results);
						results.push({id: key, value});
					}
				}
				return setPlacesList(results);
			},
			(error) => {
				return console.log(error);
			},
			null
		);
	}, []);

	//console.log(newPlace);
	//console.log(placePredictions);

	// Also, this could be done with two states, one would be previously selected place
	// and you could compare to it instead than the value, which is currently written
	// but this works for this case
	if (placePredictions?.length > 0 && placePredictions.find((pp) => pp === newPlace)) {
		return setPlacePredictions([]);
	}

	return (
		<View style={styles.container}>
			<Text style={{marginTop: 10, marginLeft: 10, fontSize: 20}}>Place finder</Text>
			<Input
				placeholder='Type in address'
				value={newPlace}
				onChangeText={(e) => setNewPlace(e)}
				style={{fontSize: 20}}
			/>
			{newPlace && placePredictions?.length > 0 && (
				<View style={{position: 'absolute', zIndex: 10, top: 78, left: 0, width: '100%'}}>
					<FlatList
						data={placePredictions}
						ItemSeparatorComponent={<View style={{borderColor: '#000', borderBottomWidth: 1, opacity: 0.25}}></View>}
						renderItem={({item}, index) => (
							<View key={index} style={{paddingTop: 5, paddingBottom: 5, paddingLeft: 10, paddingRight: 10}}>
								<Pressable onPress={() => setNewPlace(item)}>
									<Text style={{fontSize: 20}}>{item}</Text>
								</Pressable>
							</View>
						)}
						contentContainerStyle={{backgroundColor: '#f5f5f5'}}
					/>
				</View>
			)}
			<View style={{flexDirection: 'row', justifyContent: 'flex-end', gap: 10, paddingRight: 10}}>
				<Button
					title={<Text style={{fontSize: 20, color: '#fff'}}>Cancel</Text>}
					onPress={() => setNewPlace('')}
					buttonStyle={{}}
				/>
				<Button
					title={
						<View style={{flexDirection: 'row', alignItems: 'center'}}>
							<Icon name='floppy-o' color={'#fff'} type='font-awesome' size={20} style={{marginRight: 10}} />
							<Text style={{fontSize: 20, color: '#fff'}}>Save</Text>
						</View>
					}
					onPress={savePlace}
					buttonStyle={{}}
				/>
			</View>
			<Text style={{fontSize: 20, marginTop: 10, marginBottom: 10, marginLeft: 10}}>Address book</Text>
			{placesList?.length > 0 ? (
				<View>
					<FlatList
						data={placesList}
						renderItem={({item}, index) => {
							return <FlatListItem key={index} item={item} />;
						}}
					/>
				</View>
			) : (
				<Text style={{fontSize: 20, marginLeft: 10}}>Empty...</Text>
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

export default MyPlaces;
