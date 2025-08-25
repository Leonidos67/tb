import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createPaymentMutationFn } from "@/lib/api";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PaymentButtonProps {
  amount: number;
  description: string;
  currency?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  onSuccess?: () => void;
  onError?: () => void;
}

export const PaymentButton = ({
  amount,
  description,
  currency = "RUB",
  className,
  variant = "default",
  size = "default",
  onSuccess,
  onError
}: PaymentButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const payment = await createPaymentMutationFn({
        amount,
        description,
        currency
      });

      // Перенаправляем на страницу оплаты ЮKassa
      if (payment.confirmation?.confirmation_url) {
        // Сохраняем информацию о платеже в localStorage для обработки после возврата
        localStorage.setItem('pendingPayment', JSON.stringify({
          id: payment.id,
          amount: amount,
          description: description
        }));
        window.location.href = payment.confirmation.confirmation_url;
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось создать платеж",
          variant: "destructive",
        });
        onError?.();
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать платеж. Попробуйте позже.",
        variant: "destructive",
      });
      onError?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className={className}
      variant={variant}
      size={size}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      {isLoading ? "Создание платежа..." : `Оплатить ${amount} ₽`}
    </Button>
  );
};
