import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { getPaymentHistoryQueryFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface PaymentHistoryProps {
  className?: string;
}

interface PaymentRecord {
  id: string;
  amount: number;
  status: 'succeeded' | 'pending' | 'canceled' | 'failed';
  description: string;
  createdAt: string;
}

export const PaymentHistory = ({ className }: PaymentHistoryProps) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const data = await getPaymentHistoryQueryFn();
        setPayments(data.payments);
      } catch (error) {
        console.error("Error fetching payment history:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить историю платежей",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'canceled':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Успешно</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="hover:bg-secondary">В обработке</Badge>;
      case 'canceled':
        return <Badge variant="destructive" className="hover:bg-destructive">Отменен</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="hover:bg-destructive">Ошибка</Badge>;
      default:
        return <Badge variant="outline" className="hover:bg-transparent">Неизвестно</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      
      {payments.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>История платежей пуста</p>
        </div>
      ) : (
        <div className="space-y-8 py-6">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-8 border rounded-lg py-10 my-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(payment.status)}
                <div>
                  <p className="font-medium">{payment.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{payment.amount} ₽</p>
                {getStatusBadge(payment.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
