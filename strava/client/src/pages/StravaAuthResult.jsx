import React, { useEffect, useState } from 'react';

function StravaAuthResult() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  const expires_at = params.get('expires_at');
  const athlete = params.get('athlete');

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    if (access_token && athlete) {
      const athleteObj = JSON.parse(athlete);
      setLoadingStats(true);
      fetch(`http://localhost:3001/strava/athlete-stats?access_token=${access_token}&athlete_id=${athleteObj.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) setStatsError(data.error);
          else setStats(data);
        })
        .catch(e => setStatsError('Ошибка: ' + e.message))
        .finally(() => setLoadingStats(false));
    }
  }, [access_token, athlete]);

  if (error) return <div style={{color: 'red', fontSize: 20, marginTop: 40}}>{error}</div>;
  if (!access_token) return <div style={{color: 'red', fontSize: 20, marginTop: 40}}>Нет access_token. Что-то пошло не так.</div>;

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60}}>
      <div style={{fontSize: 60, color: '#fc4c02', marginBottom: 16}}>🚴‍♂️</div>
      <h2 style={{color: '#fc4c02', marginBottom: 8}}>Strava успешно подключена!</h2>
      <div style={{color: '#333', marginBottom: 24, fontSize: 18}}>
        Ваш аккаунт Strava был успешно авторизован и подключён к приложению.
      </div>
      <div style={{width: 400, background: '#f7f7f7', borderRadius: 8, padding: 16, textAlign: 'left', boxShadow: '0 2px 8px #0001', marginBottom: 32}}>
        <div><b>Access Token:</b> {access_token}</div>
        <div><b>Refresh Token:</b> {refresh_token}</div>
        <div><b>Expires At:</b> {expires_at}</div>
        <div><b>Athlete:</b></div>
        <pre style={{background: '#eee', padding: 12, borderRadius: 4, fontSize: 14}}>{athlete ? JSON.stringify(JSON.parse(athlete), null, 2) : 'Нет данных'}</pre>
      </div>
      <div style={{width: 500, background: '#fff', borderRadius: 8, padding: 16, textAlign: 'left', boxShadow: '0 2px 8px #0001'}}>
        <h3 style={{color: '#fc4c02'}}>Статистика активности</h3>
        {loadingStats && <div>Загрузка статистики...</div>}
        {statsError && <div style={{color: 'red'}}>{statsError}</div>}
        {stats && (
          <>
            <div style={{marginBottom: 12}}>
              <b>Всего тренировок:</b> {stats.all_ride_totals?.count + stats.all_run_totals?.count + stats.all_swim_totals?.count}
            </div>
            <div style={{marginBottom: 12}}>
              <b>Тренировок за 4 недели:</b> {stats.recent_ride_totals?.count + stats.recent_run_totals?.count + stats.recent_swim_totals?.count}
            </div>
            <div style={{marginBottom: 12}}>
              <b>Календарь активности (последние 4 недели):</b>
              <pre style={{background: '#eee', padding: 8, borderRadius: 4, fontSize: 13}}>{JSON.stringify({
                ride: stats.recent_ride_totals,
                run: stats.recent_run_totals,
                swim: stats.recent_swim_totals
              }, null, 2)}</pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StravaAuthResult; 