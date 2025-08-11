# Настройка Strava интеграции

## 1. Создать .env файлы

### Для `strava/backend/.env`:
```
STRAVA_CLIENT_ID=168053
STRAVA_CLIENT_SECRET=176b1c4e4f55e8a542efdfa4a551ed3592449262
STRAVA_REDIRECT_URI=http://localhost:3001/auth/strava/callback
FRONTEND_URL=http://localhost:5173
PORT=3001
```

### Для `strava/client/.env`:
```
VITE_API_BASE_URL=http://localhost:3001
```

### Для `backend/.env` (основной бэкенд):
```
PORT=8000
NODE_ENV=development
MONGO_URI=mongodb+srv://wotbmadgamesexe:Q8CMWpEum2tTfcLb@cluster0.tppwoc6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
SESSION_SECRET=Q8CMWpEum2tTfcLb
SESSION_EXPIRES_IN=1d
GOOGLE_CLIENT_ID=1072181846694-el2tmva90ht6vmlias91ddt0gbhgcngi.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback
FRONTEND_ORIGIN=http://localhost:5173
FRONTEND_GOOGLE_CALLBACK_URL=http://localhost:5173/google/callback
```

### Для `client/.env`:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

## 2. Установить зависимости

### Strava Backend:
```bash
cd strava/backend
npm install
```

### Strava Client:
```bash
cd strava/client
npm install
```

### Основной Backend:
```bash
cd backend
npm install
```

### Основной Client:
```bash
cd client
npm install
```

## 3. Запустить серверы

### Терминал 1 - Strava Backend (порт 3001):
```bash
cd strava/backend
npm start
```

### Терминал 2 - Основной Backend (порт 8000):
```bash
cd backend
npm run dev
```

### Терминал 3 - Основной Client (порт 5173):
```bash
cd client
npm run dev
```

### Терминал 4 - Strava Client (опционально, порт 5174):
```bash
cd strava/client
npm run dev
```

## 4. Проверить работу

1. Откройте http://localhost:5173
2. Войдите в приложение
3. Перейдите в профиль
4. В разделе "Интеграции" нажмите "Подключить Strava"
5. Авторизуйтесь в Strava
6. После успешной авторизации вы вернетесь в приложение

## 5. Структура интеграции

- **Strava Backend** (порт 3001): Обрабатывает OAuth авторизацию со Strava
- **Основной Backend** (порт 8000): Основное API приложения
- **Основной Client** (порт 5173): Основное приложение с интеграцией Strava
- **Strava Client** (порт 5174): Отдельное приложение для тестирования Strava (опционально)

## 6. API эндпоинты

### Strava Backend:
- `GET /auth/strava` - Начало OAuth авторизации
- `GET /auth/strava/callback` - Callback от Strava
- `GET /strava/athlete-stats` - Получение статистики спортсмена

### Основной Backend:
- `PUT /api/auth/role` - Обновление роли пользователя
- Все остальные API эндпоинты приложения

## 7. Компоненты

### Основное приложение:
- `StravaIntegration` - Компонент интеграции в профиле
- `RoleSwitcher` - Компонент переключения ролей
- `StravaAuthResult` - Страница результата авторизации

### Strava приложение:
- Отдельное приложение для тестирования Strava OAuth 