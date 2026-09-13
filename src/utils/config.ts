import Constants from "expo-constants";
import * as Device from "expo-device";

export const getBaseUrl = (overrideEnv?: string) => {
  const envUrl = overrideEnv || process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl) {
    if (!Device.isDevice && (envUrl.includes("shrigurudevashram.org") || envUrl.includes("mavt.in"))) {
      return "http://10.0.2.2:3000";
    }
    return envUrl;
  }
  if (!Device.isDevice || __DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      return `http://${hostUri.split(':')[0]}:3000`;
    }
    return "http://10.0.2.2:3000";
  }
  return "https://api.mavt.in";
};
