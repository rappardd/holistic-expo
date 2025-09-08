import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { HealthDataType, SamsungHealth } from '../modules/samsung-health';

interface UseSamsungHealthReturn {
  isInitialized: boolean;
  hasPermissions: boolean;
  todaySteps: number | null;
  latestHeartRate: number | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  requestPermissions: (dataTypes: HealthDataType[]) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useSamsungHealth = (): UseSamsungHealthReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [todaySteps, setTodaySteps] = useState<number | null>(null);
  const [latestHeartRate, setLatestHeartRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setError('Samsung Health is only available on Android devices');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await SamsungHealth.initialize();
      console.log('Samsung Health initialized:', result);
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Samsung Health';
      setError(errorMessage);
      console.error('Samsung Health initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermissions = useCallback(async (dataTypes: HealthDataType[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await SamsungHealth.requestPermissions(dataTypes);
      console.log('Permissions result:', result);
      setHasPermissions(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permissions';
      setError(errorMessage);
      console.error('Permission request error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (!isInitialized || !hasPermissions) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch today's steps
      try {
        const steps = await SamsungHealth.getTodaySteps();
        setTodaySteps(steps);
      } catch (err) {
        console.warn('Failed to fetch steps:', err);
      }

      // Fetch latest heart rate
      try {
        const heartRate = await SamsungHealth.getLatestHeartRate();
        setLatestHeartRate(heartRate);
      } catch (err) {
        console.warn('Failed to fetch heart rate:', err);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
      setError(errorMessage);
      console.error('Data refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, hasPermissions]);

  // Auto-refresh data when permissions are granted
  useEffect(() => {
    if (isInitialized && hasPermissions) {
      refreshData();
    }
  }, [isInitialized, hasPermissions, refreshData]);

  return {
    isInitialized,
    hasPermissions,
    todaySteps,
    latestHeartRate,
    isLoading,
    error,
    initialize,
    requestPermissions,
    refreshData,
  };
};