import axios from 'axios';

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_ATHLETE_URL = 'https://www.strava.com/api/v3/athlete';
const STRAVA_ATHLETE_STATS_URL = 'https://www.strava.com/api/v3/athletes';

export function getStravaAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.STRAVA_REDIRECT_URI,
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
  });
  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  const params = {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
  };
  const response = await axios.post(STRAVA_TOKEN_URL, params, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

export async function getAthleteProfile(accessToken) {
  const response = await axios.get(STRAVA_ATHLETE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}

export async function getAthleteStats(accessToken, athleteId) {
  const response = await axios.get(`${STRAVA_ATHLETE_STATS_URL}/${athleteId}/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
} 