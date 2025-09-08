/**
 * Mock Samsung Health Module for testing UI without native dependencies
 * Use this temporarily while debugging the native module issues
 */

export type HealthDataType = 'steps' | 'heartRate' | 'sleep' | 'weight';

export interface StepData {
  count: number;
  startTime: number;
  endTime: number;
}

export interface HeartRateData {
  heartRate: number;
  timestamp: number;
}

export class SamsungHealthMock {
  /**
   * Mock initialize method
   */
  static async initialize(): Promise<string> {
    console.log('🔥 Using Samsung Health MOCK - for UI testing only');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return "Mock Samsung Health initialized successfully";
  }

  /**
   * Mock request permissions
   */
  static async requestPermissions(dataTypes: HealthDataType[]): Promise<string> {
    console.log('🔥 MOCK: Requesting permissions for:', dataTypes);
    await new Promise(resolve => setTimeout(resolve, 500));
    return "Mock permissions granted";
  }

  /**
   * Mock get step count data
   */
  static async getStepCount(startTime: number, endTime: number): Promise<StepData[]> {
    console.log('🔥 MOCK: Getting step count data');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate mock data
    return [
      {
        count: Math.floor(Math.random() * 2000) + 8000, // 8000-10000 steps
        startTime,
        endTime
      }
    ];
  }

  /**
   * Mock get heart rate data
   */
  static async getHeartRate(startTime: number, endTime: number): Promise<HeartRateData[]> {
    console.log('🔥 MOCK: Getting heart rate data');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate mock data
    return [
      {
        heartRate: Math.floor(Math.random() * 40) + 60, // 60-100 bpm
        timestamp: Date.now() - Math.floor(Math.random() * 3600000) // Random time in last hour
      }
    ];
  }

  /**
   * Mock get today's steps
   */
  static async getTodaySteps(): Promise<number> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
    
    const stepData = await this.getStepCount(startOfDay, endOfDay);
    return stepData.reduce((total, data) => total + data.count, 0);
  }

  /**
   * Mock get latest heart rate
   */
  static async getLatestHeartRate(): Promise<number | null> {
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

export default SamsungHealthMock;
