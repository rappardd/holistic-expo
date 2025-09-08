import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSamsungHealth } from '../hooks/useSamsungHealth';
import { HealthCard } from './HealthCard';

export const SamsungHealthCard: React.FC = () => {
  const {
    isInitialized,
    hasPermissions,
    todaySteps,
    latestHeartRate,
    isLoading,
    error,
    initialize,
    requestPermissions,
    refreshData,
  } = useSamsungHealth();

  const handleInitialize = async () => {
    await initialize();
  };

  const handleRequestPermissions = async () => {
    await requestPermissions(['steps', 'heartRate', 'sleep', 'weight']);
  };

  const handleRefresh = async () => {
    await refreshData();
  };

  const showError = (message: string) => {
    Alert.alert('Error', message, [{ text: 'OK' }]);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Samsung Health Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleInitialize}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <View style={styles.setupContainer}>
          <Text style={styles.setupTitle}>Samsung Health Setup</Text>
          <Text style={styles.setupMessage}>
            Connect to Samsung Health to track your health data
          </Text>
          <TouchableOpacity 
            style={[styles.setupButton, isLoading && styles.disabledButton]} 
            onPress={handleInitialize}
            disabled={isLoading}
          >
            <Text style={styles.setupButtonText}>
              {isLoading ? 'Connecting...' : 'Connect Samsung Health'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!hasPermissions) {
    return (
      <View style={styles.container}>
        <View style={styles.setupContainer}>
          <Text style={styles.setupTitle}>Grant Permissions</Text>
          <Text style={styles.setupMessage}>
            Allow access to your health data to display your metrics
          </Text>
          <TouchableOpacity 
            style={[styles.setupButton, isLoading && styles.disabledButton]} 
            onPress={handleRequestPermissions}
            disabled={isLoading}
          >
            <Text style={styles.setupButtonText}>
              {isLoading ? 'Requesting...' : 'Grant Permissions'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Dashboard</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={isLoading}
        >
          <Text style={styles.refreshButtonText}>
            {isLoading ? '⟳' : '↻'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        <View style={styles.cardRow}>
          <HealthCard
            title="Steps Today"
            value={todaySteps}
            unit="steps"
            icon="👟"
            isLoading={isLoading}
            error={todaySteps === null && !isLoading}
          />
          <HealthCard
            title="Heart Rate"
            value={latestHeartRate}
            unit="bpm"
            icon="❤️"
            isLoading={isLoading}
            error={latestHeartRate === null && !isLoading}
          />
        </View>
        
        <View style={styles.cardRow}>
          <HealthCard
            title="Sleep"
            value="--"
            unit="hours"
            icon="😴"
            isLoading={false}
            error={true}
          />
          <HealthCard
            title="Weight"
            value="--"
            unit="kg"
            icon="⚖️"
            isLoading={false}
            error={true}
          />
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isInitialized ? '✅ Connected' : '❌ Disconnected'}
        </Text>
        <Text style={styles.statusText}>
          Permissions: {hasPermissions ? '✅ Granted' : '❌ Not granted'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#007AFF',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardsContainer: {
    padding: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  setupMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  setupButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});