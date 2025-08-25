import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, History } from "lucide-react";
import { getPaymentHistoryQueryFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import BottomSheet from "@/components/ui/bottom-sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaymentRecord {
  id: string;
  amount: number;
  status: 'succeeded' | 'pending' | 'canceled' | 'failed';
  description: string;
  createdAt: string;
  currency: string;
}

export const PaymentHistoryModal = ({ isOpen, onClose }: PaymentHistoryModalProps) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen) {
      fetchPaymentHistory();
    }
  }, [isOpen]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
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

  const content = (
    <>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>История платежей пуста</p>
        </div>
              ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg py-6 my-2">
              <div className="flex items-center gap-3">
                {getStatusIcon(payment.status)}
                <div>
                  <p className="font-medium text-sm">{payment.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{payment.amount} {payment.currency}</p>
                {getStatusBadge(payment.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <BottomSheet open={isOpen} onOpenChange={onClose}>
        <div className="pb-4 max-h-[85vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>История платежей пуста</p>
            </div>
          ) : (
                         <div className="space-y-4">
               {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg py-6 my-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(payment.status)}
                    <div>
                      <p className="font-medium text-sm">{payment.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{payment.amount} {payment.currency}</p>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </BottomSheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            История пополнений
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
