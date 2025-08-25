import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, History } from "lucide-react";
import { getUserBalanceQueryFn } from "@/lib/api";
import { PaymentButton } from "./payment-button";
import { PaymentHistoryModal } from "./payment-history-modal";
import { toast } from "@/hooks/use-toast";

interface BalanceDisplayProps {
  className?: string;
  onBalanceUpdate?: (newBalance: number) => void;
}

export const BalanceDisplay = ({ className, onBalanceUpdate }: BalanceDisplayProps) => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const fetchBalance = async () => {
    try {
      const balanceData = await getUserBalanceQueryFn();
      setBalance(balanceData.balance);
      onBalanceUpdate?.(balanceData.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить баланс",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    
    // Проверяем, есть ли ожидающий платеж при загрузке компонента
    const pendingPayment = localStorage.getItem('pendingPayment');
    if (pendingPayment) {
      // Если есть ожидающий платеж, обновляем баланс
      setTimeout(() => {
        fetchBalance();
      }, 1000);
    }
  }, []);

  const handlePaymentSuccess = () => {
    // Обновляем баланс после успешной оплаты
    fetchBalance();
    setShowPayment(false);
    toast({
      title: "Успешно",
      description: "Баланс пополнен!",
      variant: "success",
    });
  };

  const handlePaymentError = () => {
    toast({
      title: "Ошибка",
      description: "Не удалось пополнить баланс",
      variant: "destructive",
    });
  };

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <Wallet className="w-5 h-5 text-gray-400" />
          <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-sm text-gray-600">Баланс</div>
              <div className="text-lg font-semibold">{balance} ₽</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowHistory(true)}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">История</span>
            </Button>
            <Button
              onClick={() => setShowPayment(!showPayment)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Пополнить
            </Button>
          </div>
        </div>
      </Card>

      {showPayment && (
        <Card className="p-4 mt-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Пополнение баланса</h3>
              <p className="text-sm text-gray-600 mb-4">
                Выберите сумму для пополнения баланса
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Добавляем возможность оплаты 1 рубля для тестирования */}
              <PaymentButton
                amount={1}
                description="Тестовое пополнение баланса на 1 ₽"
                className="w-full bg-green-600 hover:bg-green-700"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
              {[1, 2, 1000, 2000].map((amount) => (
                <PaymentButton
                  key={amount}
                  amount={amount}
                  description={`Пополнение баланса на ${amount} ₽`}
                  className="w-full"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setShowPayment(false)}
              className="w-full"
            >
              Отмена
            </Button>
          </div>
        </Card>
      )}
      
      <PaymentHistoryModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
      />
    </div>
  );
};
