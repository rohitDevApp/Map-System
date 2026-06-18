import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { OfflineLocation } from '../../types/mapTypes';

type Props = {
  query: string;
  setQuery: (value: string) => void;
  results: OfflineLocation[];
  onSelect: (location: OfflineLocation) => void;
};

const OfflineLocationSearch: React.FC<Props> = ({
  query,
  setQuery,
  results,
  onSelect,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Offline Location Search</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search saved/preloaded places..."
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />

      {query.trim().length > 0 && results.length === 0 ? (
        <Text style={styles.emptyText}>No offline location found.</Text>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => onSelect(item)}
          >
            <Text style={styles.resultTitle}>{item.title}</Text>
            <Text style={styles.resultAddress}>
              {item.address ?? 'No address'} • {item.source}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default React.memo(OfflineLocationSearch);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 260,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  input: {
    marginTop: 10,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    color: '#111827',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 12,
    color: '#6B7280',
  },
  resultItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  resultAddress: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },
});
