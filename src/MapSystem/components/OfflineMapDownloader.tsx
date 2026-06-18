import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { OfflineMapStatus, StateMapAccess } from '../../types/mapTypes';

type Props = {
  mapAccess: StateMapAccess;
  status: OfflineMapStatus;
  progress: number;
  error: string | null;
  onDownload: () => void;
};

const OfflineMapDownloader: React.FC<Props> = ({
  mapAccess,
  status,
  progress,
  error,
  onDownload,
}) => {
  const isDownloading = status === 'DOWNLOADING';
  const isDownloaded = status === 'DOWNLOADED';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Offline Map Download</Text>

      <Text style={styles.text}>
        Download map for {mapAccess.stateName}. This allows map viewing without
        internet after sync.
      </Text>

      <View style={styles.progressWrap}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <Text style={styles.progressText}>
        Status: {status} {progress > 0 ? `(${progress}%)` : ''}
      </Text>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, isDownloaded && styles.buttonSuccess]}
        onPress={onDownload}
        disabled={isDownloading || isDownloaded}
      >
        {isDownloading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            {isDownloaded ? 'Map Downloaded' : 'Download Offline Map'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(OfflineMapDownloader);

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
  progressWrap: {
    marginTop: 12,
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: '#374151',
  },
  error: {
    marginTop: 8,
    fontSize: 12,
    color: '#DC2626',
  },
  button: {
    marginTop: 12,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSuccess: {
    backgroundColor: '#16A34A',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
