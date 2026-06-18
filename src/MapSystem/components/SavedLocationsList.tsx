import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { OfflineLocation } from '../../types/mapTypes';

type Props = {
  locations: OfflineLocation[];
  onSelect: (location: OfflineLocation) => void;
  onRemove: (id: string) => void;
};

const SavedLocationsList: React.FC<Props> = ({
  locations,
  onSelect,
  onRemove,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Saved Offline Locations</Text>

      {locations.length === 0 ? (
        <Text style={styles.emptyText}>No saved location yet.</Text>
      ) : (
        <FlatList
          data={locations}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.locationInfo}
                onPress={() => onSelect(item)}
              >
                <Text style={styles.locationTitle}>{item.title}</Text>
                <Text style={styles.locationAddress}>
                  {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemove(item.id)}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default React.memo(SavedLocationsList);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 230,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  locationAddress: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },
  removeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
});
