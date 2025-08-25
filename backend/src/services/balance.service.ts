import Balance, { IBalance } from "../models/balance.model";
import { AppError } from "../utils/appError";

export class BalanceService {
  // Получить баланс пользователя
  static async getUserBalance(userId: string): Promise<IBalance> {
    let balance = await Balance.findOne({ userId });
    
    if (!balance) {
      // Создаем новый баланс, если его нет
      balance = await Balance.create({
        userId,
        balance: 0,
        currency: "RUB"
      });
    }
    
    return balance;
  }

  // Пополнить баланс
  static async addToBalance(userId: string, amount: number): Promise<IBalance> {
    if (amount <= 0) {
      throw new AppError("Сумма пополнения должна быть больше 0", 400);
    }

    const balance = await Balance.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true, upsert: true }
    );

    return balance!;
  }

  // Списать с баланса
  static async deductFromBalance(userId: string, amount: number): Promise<IBalance> {
    if (amount <= 0) {
      throw new AppError("Сумма списания должна быть больше 0", 400);
    }

    const balance = await Balance.findOne({ userId });
    if (!balance) {
      throw new AppError("Баланс не найден", 404);
    }

    if (balance.balance < amount) {
      throw new AppError("Недостаточно средств на балансе", 400);
    }

    balance.balance -= amount;
    await balance.save();

    return balance;
  }

  // Получить баланс пользователя с проверкой существования
  static async getBalanceOrCreate(userId: string): Promise<IBalance> {
    return this.getUserBalance(userId);
  }
}
