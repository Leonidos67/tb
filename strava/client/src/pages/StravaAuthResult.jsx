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

  if (error) return (
    <div style={{
      color: 'red', 
      fontSize: 20, 
      marginTop: 40,
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#fff5f5',
      borderRadius: '8px',
      maxWidth: '600px',
      margin: '40px auto'
    }}>
      {error}
    </div>
  );
  
  if (!access_token) return (
    <div style={{
      color: 'red', 
      fontSize: 20, 
      marginTop: 40,
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#fff5f5',
      borderRadius: '8px',
      maxWidth: '600px',
      margin: '40px auto'
    }}>
      Нет access_token. Что-то пошло не так.
    </div>
  );

  const athleteObj = JSON.parse(athlete);
  const totalActivities = stats ? 
    (stats.all_ride_totals?.count || 0) + 
    (stats.all_run_totals?.count || 0) + 
    (stats.all_swim_totals?.count || 0) : 0;
  
  const recentActivities = stats ? 
    (stats.recent_ride_totals?.count || 0) + 
    (stats.recent_run_totals?.count || 0) + 
    (stats.recent_swim_totals?.count || 0) : 0;

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <div style={{
          fontSize: '60px',
          color: '#fc4c02',
          marginBottom: '16px'
        }}>🚴‍♂️</div>
        <h2 style={{
          color: '#fc4c02',
          marginBottom: '8px'
        }}>Strava успешно подключена!</h2>
        <p style={{
          color: '#333',
          fontSize: '18px'
        }}>
          Ваш аккаунт Strava был успешно авторизован и подключён к приложению.
        </p>
      </div>

      {/* Athlete Profile Card */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          {athleteObj.profile && (
            <img 
              src={athleteObj.profile} 
              alt="Profile" 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                marginRight: '20px',
                border: '3px solid #fc4c02'
              }}
            />
          )}
          <div>
            <h3 style={{
              color: '#fc4c02',
              margin: '0 0 5px 0'
            }}>
              {athleteObj.firstname} {athleteObj.lastname}
            </h3>
            <p style={{
              color: '#666',
              margin: '0'
            }}>
              {athleteObj.city}, {athleteObj.country}
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px'
        }}>
          <div style={{
            background: '#f7f7f7',
            padding: '15px',
            borderRadius: '8px'
          }}>
            <h4 style={{
              margin: '0 0 10px 0',
              color: '#333'
            }}>Всего тренировок</h4>
            <p style={{
              fontSize: '24px',
              fontWeight: 'bold',
              margin: '0',
              color: '#fc4c02'
            }}>{totalActivities}</p>
          </div>
          
          <div style={{
            background: '#f7f7f7',
            padding: '15px',
            borderRadius: '8px'
          }}>
            <h4 style={{
              margin: '0 0 10px 0',
              color: '#333'
            }}>Тренировок за 4 недели</h4>
            <p style={{
              fontSize: '24px',
              fontWeight: 'bold',
              margin: '0',
              color: '#fc4c02'
            }}>{recentActivities}</p>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          color: '#fc4c02',
          marginTop: '0'
        }}>Статистика активности</h3>
        
        {loadingStats && (
          <div style={{
            textAlign: 'center',
            padding: '20px'
          }}>
            Загрузка статистики...
          </div>
        )}
        
        {statsError && (
          <div style={{
            color: 'red',
            padding: '10px',
            background: '#fff5f5',
            borderRadius: '4px'
          }}>
            {statsError}
          </div>
        )}
        
        {stats && (
          <div>
            <div style={{
              marginBottom: '20px'
            }}>
              <h4 style={{
                margin: '0 0 10px 0',
                color: '#333'
              }}>Календарь активности (последние 4 недели)</h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '15px'
              }}>
                {stats.recent_ride_totals?.count > 0 && (
                  <div style={{
                    background: '#f7f7f7',
                    padding: '15px',
                    borderRadius: '8px'
                  }}>
                    <h5 style={{
                      margin: '0 0 5px 0',
                      color: '#333'
                    }}>Велоспорт</h5>
                    <p style={{
                      margin: '0',
                      color: '#666'
                    }}>{stats.recent_ride_totals.count} тренировок</p>
                    <p style={{
                      margin: '5px 0 0 0',
                      color: '#666'
                    }}>{(stats.recent_ride_totals.distance / 1000).toFixed(1)} км</p>
                  </div>
                )}
                
                {stats.recent_run_totals?.count > 0 && (
                  <div style={{
                    background: '#f7f7f7',
                    padding: '15px',
                    borderRadius: '8px'
                  }}>
                    <h5 style={{
                      margin: '0 0 5px 0',
                      color: '#333'
                    }}>Бег</h5>
                    <p style={{
                      margin: '0',
                      color: '#666'
                    }}>{stats.recent_run_totals.count} тренировок</p>
                    <p style={{
                      margin: '5px 0 0 0',
                      color: '#666'
                    }}>{(stats.recent_run_totals.distance / 1000).toFixed(1)} км</p>
                  </div>
                )}
                
                {stats.recent_swim_totals?.count > 0 && (
                  <div style={{
                    background: '#f7f7f7',
                    padding: '15px',
                    borderRadius: '8px'
                  }}>
                    <h5 style={{
                      margin: '0 0 5px 0',
                      color: '#333'
                    }}>Плавание</h5>
                    <p style={{
                      margin: '0',
                      color: '#666'
                    }}>{stats.recent_swim_totals.count} тренировок</p>
                    <p style={{
                      margin: '5px 0 0 0',
                      color: '#666'
                    }}>{(stats.recent_swim_totals.distance / 1000).toFixed(1)} км</p>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{
              background: '#f7f7f7',
              padding: '15px',
              borderRadius: '8px'
            }}>
              <h4 style={{
                margin: '0 0 10px 0',
                color: '#333'
              }}>Детальная статистика</h4>
              <pre style={{
                background: '#fff',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '14px',
                overflowX: 'auto',
                margin: '0'
              }}>
                {JSON.stringify(stats, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StravaAuthResult;