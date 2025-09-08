import SamsungHealthModule from './SamsungHealthModule';
import { SamsungHealthMock } from './SamsungHealthMock';

export type HealthDataType = 'steps' | 'heartRate' | 'sleep' | 'weight';

// Toggle this to use mock data for testing UI
const USE_MOCK = true;

export interface StepData {
  count: number;
  startTime: number;
  endTime: number;
}

export interface HeartRateData {
  heartRate: number;
  timestamp: number;
}

export class SamsungHealth {
  /**
   * Initialize Samsung Health SDK
   */
  static async initialize(): Promise<string> {
    if (USE_MOCK) {
      return await SamsungHealthMock.initialize();
    }
    
    if (__DEV__) {
      console.log('SamsungHealth.initialize called');
      console.log('SamsungHealthModule:', SamsungHealthModule);
      console.log('SamsungHealthModule.initialize:', SamsungHealthModule?.initialize);
    }
    
    if (!SamsungHealthModule) {
      throw new Error('Samsung Health native module is not available');
    }
    
    if (!SamsungHealthModule.initialize) {
      throw new Error('Samsung Health initialize method is not available');
    }
    
    return await SamsungHealthModule.initialize();
  }

  /**
   * Request permissions for health data types
   */
  static async requestPermissions(dataTypes: HealthDataType[]): Promise<string> {
    if (USE_MOCK) {
      return await SamsungHealthMock.requestPermissions(dataTypes);
    }
    return await SamsungHealthModule.requestPermissions(dataTypes);
  }

  /**
   * Get step count data for a time range
   */
  static async getStepCount(startTime: number, endTime: number): Promise<StepData[]> {
    if (USE_MOCK) {
      return await SamsungHealthMock.getStepCount(startTime, endTime);
    }
    return await SamsungHealthModule.getStepCount(startTime, endTime);
  }

  /**
   * Get heart rate data for a time range
   */
  static async getHeartRate(startTime: number, endTime: number): Promise<HeartRateData[]> {
    if (USE_MOCK) {
      return await SamsungHealthMock.getHeartRate(startTime, endTime);
    }
    return await SamsungHealthModule.getHeartRate(startTime, endTime);
  }

  /**
   * Get today's total step count
   */
  static async getTodaySteps(): Promise<number> {
    if (USE_MOCK) {
      return await SamsungHealthMock.getTodaySteps();
    }
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
    
    const stepData = await this.getStepCount(startOfDay, endOfDay);
    return stepData.reduce((total, data) => total + data.count, 0);
  }

  /**
   * Get the latest heart rate reading from the last hour
   */
  static async getLatestHeartRate(): Promise<number | null> {
    if (USE_MOCK) {
      return await SamsungHealthMock.getLatestHeartRate();
    }
    
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const heartRateData = await this.getHeartRate(oneHourAgo, now);
    if (heartRateData.length === 0) return null;
    
    // Return the most recent reading
    const latest = heartRateData.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
    
    return latest.heartRate;
  }
}

export default SamsungHealth;