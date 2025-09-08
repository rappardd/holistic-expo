import { NativeModules, Platform } from "react-native";

type Perm = { dataType: string; access: "read" | "write" };

const Native = NativeModules.SamsungHealth as {
  connect(): Promise<string>;
  requestPermissions(types: Perm[]): Promise<boolean>;
  getTodaySteps(): Promise<number>;
};

export async function connect() {
  if (Platform.OS !== "android") throw new Error("Samsung Health is Android-only");
  return Native.connect();
}

export async function requestPermissions(perms: Perm[]) {
  return Native.requestPermissions(perms);
}

export async function getTodaySteps() {
  return Native.getTodaySteps();
}

// Convenience constants – align with HealthConstants.* strings used in manifest/meta-data
export const DataTypes = {
  StepCount: "com.samsung.health.step_count",
  StepDailyTrend: "com.samsung.shealth.step_daily_trend",
  HeartRate: "com.samsung.health.heart_rate",
  Exercise: "com.samsung.health.exercise",
  Sleep: "com.samsung.health.sleep",
};
