import {Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Icon, ListItem, Text} from '@rneui/themed';
import {ref, remove} from 'firebase/database';
import dbConnection from '../firebaseConfig';

const refWithId = (id) => {
	return ref(dbConnection, `Places/${id}`);
};

const FlatListItem = ({item}) => {
	const navigation = useNavigation();
	//console.log(item);
	const showOnMap = () => {
		// do something
		return navigation.navigate('Map', {item});
	};

	const deleteAddress = () => {
		// do something
		(async () => {
			try {
				return await remove(refWithId(item.id));
			} catch (error) {
				return console.log(error);
			}
		})();
	};

	return (
		<ListItem topDivider bottomDivider>
			<ListItem.Content style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
				<Pressable delayLongPress={3000} onLongPress={deleteAddress}>
					<Text style={{fontSize: 20}}>{item.value}</Text>
				</Pressable>
				<Pressable
					onPress={showOnMap}
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						gap: 5,
					}}
				>
					<Text style={{fontSize: 16}}>show on map</Text>
					<Icon name='chevron-right' type='font-awesome' color='#999' size={16} />
				</Pressable>
			</ListItem.Content>
		</ListItem>
	);
};

export default FlatListItem;
