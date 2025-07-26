import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
import { getStravaAuthUrl, exchangeCodeForToken, getAthleteProfile, getAthleteStats } from './stravaAuth.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Strava backend работает!');
});

app.get('/auth/strava', (req, res) => {
  const url = getStravaAuthUrl();
  res.redirect(url);
});

app.get('/auth/strava/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/strava-auth-result?error=${encodeURIComponent(error)}`);
  }
  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}/strava-auth-result?error=Нет кода авторизации от Strava`);
  }
  try {
    const tokenData = await exchangeCodeForToken(code);
    const params = new URLSearchParams({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
      athlete: JSON.stringify(tokenData.athlete)
    });
    res.redirect(`${process.env.FRONTEND_URL}/strava-auth-result?${params.toString()}`);
  } catch (e) {
    console.error('Ошибка обмена кода на токен:', e);
    res.redirect(`${process.env.FRONTEND_URL}/strava-auth-result?error=${encodeURIComponent('Ошибка обмена кода на токен: ' + e.message)}`);
  }
});

app.get('/strava/athlete-stats', async (req, res) => {
  const { access_token, athlete_id } = req.query;
  if (!access_token || !athlete_id) {
    return res.status(400).json({ error: 'access_token и athlete_id обязательны' });
  }
  try {
    const stats = await getAthleteStats(access_token, athlete_id);
    res.json(stats);
  } catch (e) {
    console.error('Ошибка получения статистики:', e);
    res.status(500).json({ error: 'Ошибка получения статистики: ' + e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Strava backend запущен на порту ${PORT}`);
}); 