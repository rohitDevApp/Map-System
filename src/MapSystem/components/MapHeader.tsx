import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StateMapAccess } from '../../types/mapTypes';

type Props = {
  mapAccess: StateMapAccess;
};

const MapHeader: React.FC<Props> = ({ mapAccess }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Offline Map System</Text>
      <Text style={styles.subtitle}>
        Assigned State: {mapAccess.stateName} ({mapAccess.stateCode})
      </Text>
    </View>
  );
};

export default React.memo(MapHeader);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
  },
});
