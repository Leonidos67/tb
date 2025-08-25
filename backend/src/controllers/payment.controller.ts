import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { AppError } from "../utils/appError";
import fetch from "node-fetch";
import { BalanceService } from "../services/balance.service";
import Payment, { IPayment } from "../models/payment.model";
import mongoose from "mongoose";

// Конфигурация ЮKassa (в реальном проекте эти данные должны быть в .env)
const YOOKASSA_SECRET_KEY = "live_vEd1opGIMODduOo0BkSjtRM-lcv8y5U1zI9JhONtjmo";
const YOOKASSA_SHOP_ID = "1126452";
const YOOKASSA_BASE_URL = "https://api.yookassa.ru/v3";

interface CreatePaymentRequest {
  amount: number;
  description: string;
  currency?: string;
}

interface YooKassaPaymentRequest {
  amount: {
    value: string;
    currency: string;
  };
  capture: boolean;
  confirmation: {
    type: string;
    return_url: string;
  };
  description: string;
  receipt?: {
    customer: {
      email: string;
    };
    items: Array<{
      description: string;
      amount: {
        value: string;
        currency: string;
      };
      vat_code: number;
      quantity: number;
    }>;
  };
}

interface YooKassaPaymentResponse {
  id: string;
  status: string;
  paid: boolean;
  amount: {
    value: string;
    currency: string;
  };
  confirmation: {
    type: string;
    confirmation_url: string;
  };
  created_at: string;
  description: string;
}

interface YooKassaErrorResponse {
  type: string;
  id: string;
  code: string;
  description: string;
}

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  console.log('Payment creation request received:', req.body);
  const { amount, description, currency = "RUB" }: CreatePaymentRequest = req.body;

  if (!amount || amount <= 0) {
    throw new AppError("Неверная сумма платежа", 400);
  }

  if (!description) {
    throw new AppError("Описание платежа обязательно", 400);
  }

  // Получаем email пользователя из сессии
  const userEmail = req.user?.email;
  if (!userEmail) {
    throw new AppError("Email пользователя не найден", 400);
  }

  // Формируем запрос к ЮKassa
  const paymentData: YooKassaPaymentRequest = {
    amount: {
      value: amount.toString(),
      currency: currency
    },
    capture: true,
    confirmation: {
      type: "redirect",
      return_url: process.env.NODE_ENV === 'production' 
        ? 'https://t-sync.ru/payment/success'
        : 'http://localhost:5173/payment/success'
    },
    description: description,
    receipt: {
      customer: {
        email: userEmail
      },
      items: [
        {
          description: description,
          amount: {
            value: amount.toString(),
            currency: currency
          },
          vat_code: 1, // НДС 20%
          quantity: 1
        }
      ]
    }
  };

  try {
    // Создаем платеж через ЮKassa API
    const response = await fetch(`${YOOKASSA_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64')}`,
        'Idempotence-Key': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorData = await response.json() as YooKassaErrorResponse;
      console.error('YooKassa API error:', errorData);
      throw new AppError(`Ошибка создания платежа: ${errorData.description || 'Неизвестная ошибка'}`, 500);
    }

    const payment = await response.json() as YooKassaPaymentResponse;
    console.log('Payment created successfully:', payment);

    // Сохраняем платеж в базу данных
    const userId = req.user?._id;
    if (userId) {
      await Payment.create({
        userId: userId,
        paymentId: payment.id,
        amount: parseFloat(payment.amount.value),
        currency: payment.amount.currency,
        status: payment.status as 'succeeded' | 'pending' | 'canceled' | 'failed',
        description: payment.description,
        email: userEmail,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: payment.id,
        status: payment.status,
        paid: payment.paid,
        amount: payment.amount,
        confirmation: payment.confirmation,
        created_at: payment.created_at,
        description: payment.description
      }
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    if (error instanceof AppError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    throw new AppError(`Ошибка создания платежа: ${errorMessage}`, 500);
  }
});

export const getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  if (!paymentId) {
    throw new AppError("ID платежа обязателен", 400);
  }

  try {
    const response = await fetch(`${YOOKASSA_BASE_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64')}`
      }
    });

    if (!response.ok) {
      throw new AppError("Платеж не найден", 404);
    }

    const payment = await response.json() as YooKassaPaymentResponse;

    res.status(200).json({
      success: true,
      data: {
        id: payment.id,
        status: payment.status,
        paid: payment.paid,
        amount: payment.amount,
        confirmation: payment.confirmation,
        created_at: payment.created_at,
        description: payment.description
      }
    });
  } catch (error) {
    console.error('Payment status error:', error);
    throw new AppError("Ошибка получения статуса платежа", 500);
  }
});

export const handlePaymentWebhook = asyncHandler(async (req: Request, res: Response) => {
  // Обработка webhook'ов от ЮKassa для автоматического обновления баланса
  console.log('Payment webhook received:', req.body);
  
  try {
    const { event, object } = req.body;
    
    // Проверяем, что это уведомление о платеже
    if (event === 'payment.succeeded' && object) {
      const payment = object;
      
      console.log(`Processing succeeded payment: ${payment.id}`);
      
      // Проверяем, что платеж действительно успешен
      if (payment.status === 'succeeded' && payment.paid) {
        // Сначала проверяем, не был ли уже обработан этот платеж
        const existingPayment = await Payment.findOne({ paymentId: payment.id });
        
        if (existingPayment && existingPayment.status === 'succeeded') {
          console.log(`Payment ${payment.id} already processed, skipping balance update`);
          res.status(200).json({ success: true, message: 'Payment already processed' });
          return;
        }
        
        // Обновляем статус платежа в базе данных
        await Payment.findOneAndUpdate(
          { paymentId: payment.id },
          { 
            status: payment.status as 'succeeded' | 'pending' | 'canceled' | 'failed',
            updatedAt: new Date()
          }
        );
        
        // Получаем email пользователя из чека
        const customerEmail = payment.receipt?.customer?.email;
        
        if (customerEmail) {
          // Находим пользователя по email
          const UserModel = (await import("../models/user.model")).default;
          const user = await UserModel.findOne({ email: customerEmail });
          
          if (user) {
            const amount = parseFloat(payment.amount.value);
            
            // Пополняем баланс пользователя
            const balance = await BalanceService.addToBalance((user as any)._id.toString(), amount);
            
            console.log(`Balance updated for user ${(user as any).email}: +${amount} ₽, new balance: ${balance.balance} ₽`);
          } else {
            console.warn(`User not found for email: ${customerEmail}`);
          }
        } else {
          console.warn(`No customer email found in payment: ${payment.id}`);
        }
      }
    } else if (event === 'payment.canceled' && object) {
      console.log(`Processing canceled payment: ${object.id}`);
      
      // Обновляем статус отмененного платежа
      await Payment.findOneAndUpdate(
        { paymentId: object.id },
        { 
          status: 'canceled' as const,
          updatedAt: new Date()
        }
      );
    } else if (event === 'payment.waiting_for_capture' && object) {
      console.log(`Payment waiting for capture: ${object.id}`);
      
      // Обновляем статус платежа в ожидании
      await Payment.findOneAndUpdate(
        { paymentId: object.id },
        { 
          status: 'pending' as const,
          updatedAt: new Date()
        }
      );
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Возвращаем 200 даже при ошибке, чтобы ЮKassa не повторял webhook
    res.status(200).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Получить баланс пользователя
export const getUserBalance = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new AppError("Пользователь не найден", 401);
  }

  const balance = await BalanceService.getUserBalance(userId.toString());
  
  res.status(200).json({
    success: true,
    data: {
      balance: balance.balance,
      currency: balance.currency
    }
  });
});

// Получить историю платежей пользователя
export const getUserPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new AppError("Пользователь не найден", 401);
  }

  const payments = await Payment.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    data: {
      payments: payments.map(payment => ({
        id: payment.paymentId,
        amount: payment.amount,
        status: payment.status,
        description: payment.description,
        createdAt: payment.createdAt,
        currency: payment.currency
      }))
    }
  });
});

// Обработка успешного платежа
export const handleSuccessfulPayment = asyncHandler(async (req: Request, res: Response) => {
  const { paymentId, amount } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new AppError("Пользователь не найден", 401);
  }

  if (!paymentId || !amount) {
    throw new AppError("Неверные параметры платежа", 400);
  }

  // Сначала проверяем, не был ли уже обработан этот платеж
  const existingPayment = await Payment.findOne({ paymentId });
  if (existingPayment && existingPayment.status === 'succeeded') {
    // Если платеж уже был обработан, просто возвращаем текущий баланс
    const balance = await BalanceService.getUserBalance(userId.toString());
    res.status(200).json({
      success: true,
      data: {
        message: "Платеж уже был обработан",
        balance: balance.balance,
        currency: balance.currency,
        amountAdded: 0
      }
    });
    return;
  }

  // Дополнительная проверка: если платеж уже обрабатывается, ждем
  if (existingPayment && existingPayment.status === 'pending') {
    // Проверяем, не обрабатывается ли уже этот платеж
    const processingPayment = await Payment.findOne({ 
      paymentId, 
      status: 'succeeded' 
    });
    
    if (processingPayment) {
      const balance = await BalanceService.getUserBalance(userId.toString());
      res.status(200).json({
        success: true,
        data: {
          message: "Платеж уже был обработан",
          balance: balance.balance,
          currency: balance.currency,
          amountAdded: 0
        }
      });
      return;
    }
  }

  // Проверяем статус платежа в ЮKassa
  try {
    const response = await fetch(`${YOOKASSA_BASE_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64')}`
      }
    });

    if (!response.ok) {
      throw new AppError("Платеж не найден", 404);
    }

    const payment = await response.json() as YooKassaPaymentResponse;

    // Проверяем, что платеж действительно успешен
    if (payment.status === 'succeeded' && payment.paid) {
      // Дополнительная проверка суммы
      const paymentAmount = parseFloat(payment.amount.value);
      if (Math.abs(paymentAmount - amount) > 0.01) {
        console.warn(`Amount mismatch: expected ${amount}, got ${paymentAmount}`);
        // Используем сумму из платежа, если она отличается
        const actualAmount = paymentAmount;
        
        // Атомарно обновляем статус платежа и пополняем баланс
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
          // Обновляем статус платежа
          await Payment.findOneAndUpdate(
            { paymentId },
            { status: 'succeeded' },
            { new: true, session }
          );
          
          // Пополняем баланс
          const balance = await BalanceService.addToBalance(userId.toString(), actualAmount);
          
          await session.commitTransaction();
          
          res.status(200).json({
            success: true,
            data: {
              message: "Баланс успешно пополнен",
              balance: balance.balance,
              currency: balance.currency,
              amountAdded: actualAmount
            }
          });
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
        
        return;
      } else {
        // Атомарно обновляем статус платежа и пополняем баланс
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
          // Обновляем статус платежа
          await Payment.findOneAndUpdate(
            { paymentId },
            { status: 'succeeded' },
            { new: true, session }
          );
          
          // Пополняем баланс
          const balance = await BalanceService.addToBalance(userId.toString(), amount);
          
          await session.commitTransaction();
          
          res.status(200).json({
            success: true,
            data: {
              message: "Баланс успешно пополнен",
              balance: balance.balance,
              currency: balance.currency,
              amountAdded: amount
            }
          });
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
        
        return;
      }
    } else if (payment.status === 'pending') {
      // Если платеж в ожидании, возвращаем информацию об этом
      res.status(200).json({
        success: true,
        data: {
          message: "Платеж обрабатывается",
          status: payment.status,
          balance: (await BalanceService.getUserBalance(userId.toString())).balance
        }
      });
    } else {
      throw new AppError("Платеж не был завершен успешно", 400);
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Ошибка проверки платежа", 500);
  }
});
