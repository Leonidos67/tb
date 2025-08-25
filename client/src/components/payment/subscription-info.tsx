import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, CheckCircle } from "lucide-react";

interface SubscriptionInfoProps {
  isPremium?: boolean;
  expiresAt?: string;
  className?: string;
}

export const SubscriptionInfo = ({ 
  isPremium = false, 
  expiresAt, 
  className 
}: SubscriptionInfoProps) => {
  if (!isPremium) {
    return null;
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <Crown className="w-5 h-5 text-yellow-500" />
        <div>
          <h3 className="font-semibold text-sm">Premium подписка</h3>
          <Badge variant="secondary" className="text-xs">
            Активна
          </Badge>
        </div>
      </div>
      
      {expiresAt && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Действует до: {new Date(expiresAt).toLocaleDateString('ru-RU')}</span>
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t">
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>Все функции разблокированы</span>
        </div>
      </div>
    </Card>
  );
};
