import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  loadingLocation: boolean;
  locationError: string | null;
  onFetchLocation: () => void;
};

const MapPermissionBox: React.FC<Props> = ({
  loadingLocation,
  locationError,
  onFetchLocation,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>GPS Location</Text>

      <Text style={styles.text}>
        GPS can detect current location even when internet is unavailable, but
        accuracy may depend on device settings and signal.
      </Text>

      {!!locationError && <Text style={styles.error}>{locationError}</Text>}

      <TouchableOpacity style={styles.button} onPress={onFetchLocation}>
        <Text style={styles.buttonText}>
          {loadingLocation ? 'Getting Location...' : 'Get Current Location'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(MapPermissionBox);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  text: {
    marginTop: 6,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  error: {
    marginTop: 8,
    fontSize: 12,
    color: '#DC2626',
  },
  button: {
    marginTop: 12,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
