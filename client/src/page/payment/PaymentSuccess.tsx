import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { getPaymentStatusQueryFn, handleSuccessfulPaymentMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [balanceUpdated, setBalanceUpdated] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // ЮKassa может передавать payment_id в разных параметрах
  const paymentId = searchParams.get('payment_id') || searchParams.get('paymentId') || searchParams.get('id') || searchParams.get('orderId');
  const cancelled = searchParams.get('cancelled') || searchParams.get('cancel') || searchParams.get('error');

  useEffect(() => {
    // Проверяем, была ли отмена платежа
    if (cancelled) {
      setIsCancelled(true);
      setLoading(false);
      
      toast({
        title: "Ошибка оплаты",
        description: "Платеж был отменен. Баланс не пополнен.",
        variant: "destructive",
      });
      
      return;
    }

    // Если нет paymentId, проверяем localStorage
    if (!paymentId) {
      const pendingPayment = localStorage.getItem('pendingPayment');
      if (pendingPayment) {
        try {
          const paymentInfo = JSON.parse(pendingPayment);
          // Попробуем обновить баланс на основе сохраненной информации
          handleSuccessfulPaymentMutationFn({
            paymentId: paymentInfo.id,
            amount: paymentInfo.amount
          }).then(() => {
            localStorage.removeItem('pendingPayment');
            setBalanceUpdated(true);
                         toast({
               title: "Успешно!",
               description: `Баланс пополнен на ${paymentInfo.amount} ₽`,
               variant: "success",
             });
             
             // Запускаем счетчик обратного отсчета
             setRedirectCountdown(3);
             const countdownInterval = setInterval(() => {
               setRedirectCountdown(prev => {
                 if (prev && prev > 1) {
                   return prev - 1;
                 } else {
                   clearInterval(countdownInterval);
                   window.location.href = '/workspace/687f6773411203002bae936e/profile';
                   return null;
                 }
               });
             }, 1000);
          }).catch(() => {
            setError("Не удалось обновить баланс. Проверьте статус платежа в профиле.");
          });
        } catch (error) {
          setError("Ошибка обработки платежа. Обратитесь в поддержку.");
        }
      } else {
        setError("Информация о платеже не найдена. Проверьте статус в профиле.");
      }
      setLoading(false);
      return;
    }

    if (paymentId) {
      getPaymentStatusQueryFn(paymentId)
        .then(async (data) => {
          setPaymentStatus(data);
          
          // Если платеж успешен, пополняем баланс
          if (data.status === 'succeeded' && data.paid) {
            try {
              // Получаем информацию о платеже из localStorage
              const pendingPayment = localStorage.getItem('pendingPayment');
              if (pendingPayment) {
                const paymentInfo = JSON.parse(pendingPayment);
                
                // Пополняем баланс
                const result = await handleSuccessfulPaymentMutationFn({
                  paymentId: data.id,
                  amount: paymentInfo.amount
                });
                
                // Очищаем localStorage
                localStorage.removeItem('pendingPayment');
                setBalanceUpdated(true);
                
                // Показываем уведомление об успешном пополнении
                toast({
                  title: "Успешно!",
                  description: `Баланс пополнен на ${paymentInfo.amount} ₽. Новый баланс: ${result.balance} ₽`,
                  variant: "success",
                });
                
                // Запускаем счетчик обратного отсчета
                setRedirectCountdown(3);
                const countdownInterval = setInterval(() => {
                  setRedirectCountdown(prev => {
                    if (prev && prev > 1) {
                      return prev - 1;
                    } else {
                      clearInterval(countdownInterval);
                      window.location.href = '/workspace/687f6773411203002bae936e/profile';
                      return null;
                    }
                  });
                }, 1000);
              } else {
                // Если нет информации в localStorage, используем данные из платежа
                const amount = parseFloat(data.amount.value);
                const result = await handleSuccessfulPaymentMutationFn({
                  paymentId: data.id,
                  amount: amount
                });
                
                setBalanceUpdated(true);
                
                toast({
                  title: "Успешно!",
                  description: `Баланс пополнен на ${amount} ₽. Новый баланс: ${result.balance} ₽`,
                  variant: "success",
                });
                
                // Запускаем счетчик обратного отсчета
                setRedirectCountdown(3);
                const countdownInterval = setInterval(() => {
                  setRedirectCountdown(prev => {
                    if (prev && prev > 1) {
                      return prev - 1;
                    } else {
                      clearInterval(countdownInterval);
                      window.location.href = '/workspace/687f6773411203002bae936e/profile';
                      return null;
                    }
                  });
                }, 1000);
              }
            } catch (err) {
              console.error("Error updating balance:", err);
              setError("Платеж прошел, но не удалось обновить баланс. Обратитесь в поддержку.");
            }
          } else if (data.status === 'pending') {
            // Если платеж в ожидании, показываем соответствующее сообщение
            setError("Платеж обрабатывается. Баланс будет пополнен в течение нескольких минут.");
          } else {
            setError("Платеж не был завершен успешно.");
          }
        })
        .catch((err) => {
          setError("Не удалось получить статус платежа. Проверьте баланс в профиле.");
          console.error("Payment status error:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [paymentId, cancelled]);

  // Очистка интервала при размонтировании
  useEffect(() => {
    return () => {
      // Очищаем все интервалы при размонтировании
      const intervals = window.setInterval(() => {}, 0);
      for (let i = 0; i < intervals; i++) {
        window.clearInterval(i);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Проверяем статус платежа...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md p-8 text-center">
        {isCancelled ? (
          <div className="mb-6">
            <div className="w-16 h-16 text-red-500 mx-auto mb-4 text-4xl">❌</div>
            <h1 className="text-2xl font-bold mb-2 text-red-600">Ошибка оплаты</h1>
            <p className="text-gray-600 mb-6">
              Оплата была отменена или произошла ошибка. Баланс не был пополнен.
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Оплата прошла успешно!</h1>
            <p className="text-gray-600 mb-6">
              {balanceUpdated 
                ? "Спасибо за ваш платеж. Баланс успешно пополнен."
                : "Спасибо за ваш платеж. Ваша подписка активирована."
              }
              {redirectCountdown && (
                <div className="mt-2 text-sm text-blue-600">
                  Автоматическое перенаправление через {redirectCountdown} секунд...
                </div>
              )}
            </p>
          </div>
        )}

        {paymentStatus && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-2">Детали платежа:</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">ID платежа:</span> {paymentStatus.id}</p>
              <p><span className="font-medium">Сумма:</span> {paymentStatus.amount?.value} {paymentStatus.amount?.currency}</p>
              <p><span className="font-medium">Статус:</span> {paymentStatus.status}</p>
              <p><span className="font-medium">Описание:</span> {paymentStatus.description}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link to="/workspace/687f6773411203002bae936e/profile">
            <Button className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться в профиль
            </Button>
          </Link>
          {/* <Link to="/workspace/687f6773411203002bae936e/dashboard">
            <Button variant="outline" className="w-full">
              Перейти к дашборду
            </Button>
          </Link> */}
          {error && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                const pendingPayment = localStorage.getItem('pendingPayment');
                if (pendingPayment) {
                  localStorage.removeItem('pendingPayment');
                  window.location.reload();
                }
              }}
            >
              Очистить данные платежа
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
