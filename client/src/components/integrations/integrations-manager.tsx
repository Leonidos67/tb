import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import GarminIntegration from "./garmin-integration";

interface IntegrationStatus {
  garmin: boolean;
}

const IntegrationsManager = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus>({
    garmin: false
  });

  const [lastGlobalSync] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("integrationsVisible");
      return stored !== null ? stored === "true" : false; // по умолчанию скрыто
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("integrationsVisible", String(isVisible));
    } catch {
      // ignore
    }
  }, [isVisible]);

  const handleGarminConnect = () => {
    setIntegrations(prev => ({ ...prev, garmin: true }));
  };

  const handleGarminDisconnect = () => {
    setIntegrations(prev => ({ ...prev, garmin: false }));
  };

  const handleGarminSync = () => {
    console.log("Синхронизация Garmin");
  };

  const connectedCount = Object.values(integrations).filter(Boolean).length;
  const totalCount = Object.keys(integrations).length;

  return (
    <Card className="shadow-none w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 sm:pb-6">
        <div className="flex items-center space-x-3">
          <CardTitle className="text-sm font-medium">Подключенные аккаунты</CardTitle>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          aria-label={isVisible ? "Скрыть" : "Показать"}
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </CardHeader>
      {isVisible && (
        <CardContent className="pb-2">
          <div className="space-y-4">
            {/* Глобальная информация */}
            {connectedCount > 0 && (
              <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-green-50 border rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Статус интеграций</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {connectedCount === totalCount 
                        ? "Garmin Connect подключен. Ваши тренировки будут автоматически синхронизироваться. Используйте кнопку синхронизации для принудительного обновления"
                        : "Garmin Connect подключен. Ваши тренировки будут автоматически синхронизироваться. Используйте кнопку синхронизации для принудительного обновления"
                      }
                    </p>
                    {lastGlobalSync && (
                      <p className="text-xs text-blue-600 mt-1">
                        Последняя глобальная синхронизация: {lastGlobalSync}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {connectedCount === totalCount ? (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Garmin интеграция */}
            <GarminIntegration
              isConnected={integrations.garmin}
              onConnect={handleGarminConnect}
              onDisconnect={handleGarminDisconnect}
              onSync={handleGarminSync}
            />
            
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default IntegrationsManager;
