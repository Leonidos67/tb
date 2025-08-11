import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Watch, Activity } from "lucide-react";

const ConnectedAccounts = () => {
  const handleConnectGarmin = () => {
    // TODO: Реализовать подключение Garmin
    console.log("Подключение к Garmin");
  };

  const handleConnectStrava = () => {
    // TODO: Реализовать подключение Strava
    console.log("Подключение к Strava");
  };

  return (
    <Card className="shadow-none w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 sm:pb-6">
        <CardTitle className="text-sm font-medium">Подключенные аккаунты</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          {/* Garmin */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Watch className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Garmin</h3>
                <p className="text-sm text-gray-500">Подключите свой аккаунт Garmin для синхронизации тренировок</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnectGarmin}
              className="whitespace-nowrap"
            >
              Подключить аккаунт
            </Button>
          </div>

          {/* Strava */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Strava</h3>
                <p className="text-sm text-gray-500">Подключите свой аккаунт Strava для синхронизации тренировок</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnectStrava}
              className="whitespace-nowrap"
            >
              Подключить аккаунт
            </Button>
          </div>

          {/* Информация о подключении */}
          <div className="text-xs text-gray-500 text-center pt-2">
            Подключение аккаунтов позволит автоматически синхронизировать ваши тренировки
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectedAccounts;
