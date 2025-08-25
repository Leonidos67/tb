# Система баланса T-Sync

## Описание

Система баланса позволяет пользователям пополнять свой баланс через ЮKassa и использовать средства для покупки подписок и других услуг.

## Компоненты

### Backend

1. **Модель баланса** (`backend/src/models/balance.model.ts`)
   - Хранит баланс пользователя
   - Автоматически создается при первом обращении
   - Поддерживает валюту (по умолчанию RUB)

2. **Сервис баланса** (`backend/src/services/balance.service.ts`)
   - `getUserBalance()` - получить баланс пользователя
   - `addToBalance()` - пополнить баланс
   - `deductFromBalance()` - списать с баланса
   - `getBalanceOrCreate()` - получить или создать баланс

3. **Контроллер платежей** (`backend/src/controllers/payment.controller.ts`)
   - `getUserBalance()` - API для получения баланса
   - `handleSuccessfulPayment()` - обработка успешного платежа
   - Автоматическое пополнение баланса при успешной оплате

4. **Маршруты** (`backend/src/routes/payment.route.ts`)
   - `GET /api/payment/balance` - получить баланс
   - `POST /api/payment/success` - обработать успешный платеж

### Frontend

1. **Компонент баланса** (`client/src/components/payment/balance-display.tsx`)
   - Отображает текущий баланс
   - Кнопка "Пополнить" с выбором суммы
   - Автоматическое обновление после пополнения

2. **API функции** (`client/src/lib/api.ts`)
   - `getUserBalanceQueryFn()` - получить баланс
   - `handleSuccessfulPaymentMutationFn()` - обработать успешный платеж

3. **Страница успешной оплаты** (`client/src/page/payment/PaymentSuccess.tsx`)
   - Автоматическое пополнение баланса при успешной оплате
   - Обработка отмены платежа с показом ошибки
   - Toast уведомления о результате

## Как это работает

### Пополнение баланса

1. Пользователь нажимает "Пополнить" в компоненте баланса
2. Выбирает сумму (100, 500, 1000, 2000 ₽)
3. Создается платеж в ЮKassa
4. Пользователь перенаправляется на страницу оплаты ЮKassa
5. После оплаты возвращается на `/payment/success`
6. Система проверяет статус платежа в ЮKassa
7. При успешной оплате баланс автоматически пополняется
8. Показывается уведомление об успешном пополнении

### Отмена платежа

1. Пользователь нажимает "Выйти из оплаты" на странице ЮKassa
2. Возвращается на `/payment/success` с параметром отмены
3. Показывается сообщение об ошибке
4. Баланс не пополняется

## Настройка

### 1. База данных

Модель баланса автоматически создается при первом обращении. Никаких дополнительных настроек не требуется.

### 2. ЮKassa

Убедитесь, что в `backend/src/controllers/payment.controller.ts` настроены правильные ключи:

```typescript
const YOOKASSA_SECRET_KEY = "your_secret_key";
const YOOKASSA_SHOP_ID = "your_shop_id";
```

### 3. Frontend

Компонент `BalanceDisplay` автоматически добавляется на страницы профиля:
- `/u/users/:username` - профиль пользователя
- `/workspace/:workspaceId/profile` - профиль в workspace

## API Endpoints

### Получить баланс
```
GET /api/payment/balance
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "balance": 1000,
    "currency": "RUB"
  }
}
```

### Обработать успешный платеж
```
POST /api/payment/success
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentId": "payment_id_from_yookassa",
  "amount": 1000
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "message": "Баланс успешно пополнен",
    "balance": 1000,
    "currency": "RUB"
  }
}
```

## Безопасность

- Все API endpoints требуют аутентификации
- Проверка статуса платежа в ЮKassa перед пополнением баланса
- Валидация суммы пополнения
- Защита от отрицательного баланса

## Расширение

Для добавления новых функций:

1. **Списание баланса** - используйте `BalanceService.deductFromBalance()`
2. **История транзакций** - создайте модель `Transaction`
3. **Разные валюты** - расширьте модель баланса
4. **Автоматические платежи** - используйте webhook от ЮKassa
