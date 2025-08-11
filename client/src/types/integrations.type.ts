// Garmin интеграция
export interface GarminActivity {
  id: string;
  name: string;
  type: string;
  startTime: string;
  duration: number;
  distance: number;
  calories: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  averageSpeed?: number;
  maxSpeed?: number;
  gpsData?: GarminGPSData[];
}

export interface GarminGPSData {
  timestamp: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heartRate?: number;
}

export interface GarminUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export interface GarminConnectionStatus {
  isConnected: boolean;
  lastSync?: string;
  user?: GarminUser;
  tokenExpiry?: string;
}

// Strava интеграция
export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  start_date: string;
  elapsed_time: number;
  distance: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  map?: {
    summary_polyline: string;
    polyline: string;
  };
  segment_efforts?: StravaSegmentEffort[];
}

export interface StravaSegmentEffort {
  id: number;
  name: string;
  elapsed_time: number;
  moving_time: number;
  distance: number;
  average_power?: number;
  max_power?: number;
  average_heartrate?: number;
  max_heartrate?: number;
}

export interface StravaUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  city?: string;
  state?: string;
  country?: string;
  profile?: string;
  follower_count?: number;
  friend_count?: number;
  weight?: number;
}

export interface StravaConnectionStatus {
  isConnected: boolean;
  lastSync?: string;
  user?: StravaUser;
  tokenExpiry?: string;
}

// Общие типы для интеграций
export interface IntegrationConfig {
  garmin: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string[];
  };
  strava: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string[];
  };
}

export interface SyncResult {
  success: boolean;
  activitiesCount: number;
  errors?: string[];
  timestamp: string;
}

export interface IntegrationError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}
