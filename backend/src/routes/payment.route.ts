import { Router } from "express";
import { createPayment, getPaymentStatus, handlePaymentWebhook, getUserBalance, handleSuccessfulPayment, getUserPaymentHistory } from "../controllers/payment.controller";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";

const router = Router();

// Создание платежа (требует аутентификации)
router.post("/create", isAuthenticated, createPayment);

// Получение статуса платежа (требует аутентификации)
router.get("/status/:paymentId", isAuthenticated, getPaymentStatus);

// Webhook от ЮKassa (не требует аутентификации)
router.post("/webhook", handlePaymentWebhook);

// Получить баланс пользователя
router.get("/balance", isAuthenticated, getUserBalance);

// Обработка успешного платежа
router.post("/success", isAuthenticated, handleSuccessfulPayment);

// Получить историю платежей пользователя
router.get("/history", isAuthenticated, getUserPaymentHistory);

export default router;
