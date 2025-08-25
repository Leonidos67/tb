# Настройка ЮKassa для T-Sync

## Текущая конфигурация

В проекте уже настроена интеграция с ЮKassa со следующими параметрами:

- **API Key**: `live_vEd1opGIMODduOo0BkSjtRM-lcv8y5U1zI9JhONtjmo`
- **Shop ID**: `1126452`
- **Режим**: Live (боевой)

## Что реализовано

### Frontend
1. **Компонент кнопки оплаты** (`client/src/components/payment/payment-button.tsx`)
   - Создает платеж через API
   - Перенаправляет на страницу оплаты ЮKassa
   - Показывает состояние загрузки

2. **Страница успешной оплаты** (`client/src/page/payment/PaymentSuccess.tsx`)
   - Отображается после успешной оплаты
   - Показывает детали платежа
   - Ссылки для возврата в приложение

3. **Информация о подписке** (`client/src/components/payment/subscription-info.tsx`)
   - Отображает статус Premium подписки
   - Показывает дату окончания подписки

### Backend
1. **Контроллер платежей** (`backend/src/controllers/payment.controller.ts`)
   - Создание платежей через ЮKassa API
   - Получение статуса платежа
   - Обработка webhook'ов

2. **Маршруты платежей** (`backend/src/routes/payment.route.ts`)
   - POST `/api/payment/create` - создание платежа
   - GET `/api/payment/status/:paymentId` - статус платежа
   - POST `/api/payment/webhook` - webhook от ЮKassa

## Как это работает

1. Пользователь нажимает кнопку "Оплатить" на странице профиля
2. Frontend отправляет запрос на создание платежа
3. Backend создает платеж через ЮKassa API
4. Пользователь перенаправляется на страницу оплаты ЮKassa
5. После оплаты пользователь возвращается на страницу успеха
6. Страница успеха проверяет статус платежа и показывает детали

## Настройка для продакшена

### 1. Перемещение в .env

Замените хардкод в `backend/src/controllers/payment.controller.ts`:

```typescript
// Вместо:
const YOOKASSA_API_KEY = "live_vEd1opGIMODduOo0BkSjtRM-lcv8y5U1zI9JhONtjmo";
const YOOKASSA_SHOP_ID = "1126452";

// Используйте:
const YOOKASSA_API_KEY = process.env.YOOKASSA_API_KEY!;
const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID!;
```

### 2. Добавление в .env файл

```env
YOOKASSA_API_KEY=live_vEd1opGIMODduOo0BkSjtRM-lcv8y5U1zI9JhONtjmo
YOOKASSA_SHOP_ID=1126452
YOOKASSA_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Настройка webhook'ов

В личном кабинете ЮKassa настройте webhook URL:
```
https://your-domain.com/api/payment/webhook
```

### 4. Обработка платежей

Добавьте логику для:
- Сохранения информации о платежах в базу данных
- Обновления статуса подписки пользователя
- Отправки уведомлений

## Тестирование

### Тестовый режим
Для тестирования используйте тестовые данные ЮKassa:
- Тестовые карты: 1111111111111026, 03/25, CVC 123
- Тестовый API Key: `test_...`

### Проверка интеграции
1. Создайте тестовый платеж
2. Проверьте создание платежа в личном кабинете ЮKassa
3. Проверьте возврат на страницу успеха
4. Проверьте получение статуса платежа

## Безопасность

1. **API ключи**: Храните в .env файле, не коммитьте в репозиторий
2. **Webhook секреты**: Используйте для проверки подлинности webhook'ов
3. **HTTPS**: Обязательно используйте HTTPS в продакшене
4. **Валидация**: Проверяйте все входящие данные

## Дополнительные возможности

1. **Возвраты**: Добавьте API для обработки возвратов
2. **Подписки**: Реализуйте рекуррентные платежи
3. **Уведомления**: Добавьте email/SMS уведомления
4. **Аналитика**: Создайте дашборд для анализа платежей
