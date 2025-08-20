import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Watch, Download, Upload, Activity, CheckCircle, Calendar, MapPin, Heart, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import garminService from "@/lib/integrations/garmin-service";
import { GarminActivity, GarminUser } from "@/types/integrations.type";

interface GarminIntegrationProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}

const GarminIntegration = ({ 
  isConnected, 
  onConnect, 
  onDisconnect, 
  onSync 
}: GarminIntegrationProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [showActivitiesDialog, setShowActivitiesDialog] = useState(false);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);
  const [user, setUser] = useState<GarminUser | null>(null);
  const [activities, setActivities] = useState<GarminActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  // Загружаем статус подключения при монтировании
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const status = await garminService.getConnectionStatus();
      if (status.isConnected && status.user) {
        setUser(status.user);
        onConnect();
        if (status.lastSync) {
          setLastSyncDate(status.lastSync);
        }
      }
    } catch (error) {
      console.error("Ошибка проверки статуса подключения:", error);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Имитация процесса подключения через OAuth
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // После успешного подключения получаем информацию о пользователе
      const userInfo = await garminService.getUserInfo();
      if (userInfo) {
        setUser(userInfo);
        onConnect();
        setShowConnectionDialog(false);
      }
    } catch (error) {
      console.error("Ошибка подключения к Garmin:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await garminService.syncActivities();
      if (result.success) {
        setLastSyncDate(new Date().toLocaleString('ru-RU'));
        onSync();
        // Обновляем список активностей
        await loadActivities();
      }
    } catch (error) {
      console.error("Ошибка синхронизации:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = () => {
    garminService.disconnect();
    setUser(null);
    setActivities([]);
    setLastSyncDate(null);
    onDisconnect();
  };

  const loadActivities = async () => {
    setIsLoadingActivities(true);
    try {
      // Загружаем активности за последние 30 дней
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const activitiesList = await garminService.getActivities(startDate, endDate);
      setActivities(activitiesList);
    } catch (error) {
      console.error("Ошибка загрузки активностей:", error);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const openActivitiesDialog = async () => {
    setShowActivitiesDialog(true);
    if (activities.length === 0) {
      await loadActivities();
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} км`;
    }
    return `${Math.round(meters)} м`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="shadow-none w-full">
        <div>
          <div className="space-y-4">
            {/* Статус подключения без обводки и отступов */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0" style={{marginBottom: '10px'}}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Watch className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">Garmin Connect</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {isConnected 
                      ? user 
                        ? `Подключен аккаунт ${user.firstName} ${user.lastName}`
                        : "Ваш аккаунт Garmin подключен и готов к синхронизации"
                      : "Подключите свой аккаунт Garmin для синхронизации тренировок"
                    }
                  </p>
                  {lastSyncDate && (
                    <p className="text-xs text-blue-600 mt-1">
                      Последняя синхронизация: {lastSyncDate}
                    </p>
                  )}
                </div>
              </div>
              
              {!isConnected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConnectionDialog(true)}
                  disabled={isConnecting}
                  className="whitespace-nowrap w-full lg:w-auto"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                      Подключение...
                    </>
                  ) : (
                    "Подключить аккаунт"
                  )}
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openActivitiesDialog}
                    className="whitespace-nowrap w-full sm:w-auto"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Мои тренировки
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="whitespace-nowrap w-full sm:w-auto"
                  >
                    {isSyncing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2" />
                        Синхронизация...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Синхронизировать
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                    className="whitespace-nowrap text-red-600 hover:text-red-700 w-full sm:w-auto"
                  >
                    Отключить
                  </Button>
                </div>
              )}
            </div>

            {/* Информация о возможностях */}
            {isConnected && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4" style={{marginBottom: '10px'}}>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-xs sm:text-sm text-green-800">Тренировки</h4>
                  <p className="text-xs text-green-600">Автоматическая синхронизация</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Download className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-xs sm:text-sm text-blue-800">Данные</h4>
                  <p className="text-xs text-blue-600">FIT файлы и метрики</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg sm:col-span-2 lg:col-span-1">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium text-xs sm:text-sm text-purple-800">Экспорт</h4>
                  <p className="text-xs text-purple-600">Выгрузка в систему</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Диалог подключения */}
      <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Watch className="w-5 h-5 text-blue-600" />
              Подключение Garmin Connect
            </DialogTitle>
            <DialogDescription>
              Для подключения вашего аккаунта Garmin необходимо пройти авторизацию через Garmin Connect.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm text-blue-800 mb-2">Что будет синхронизироваться:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  Тренировки и активности
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  Данные о пульсе и нагрузке
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  GPS треки и маршруты
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  Статистика и достижения
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex-1"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Подключение...
                  </>
                ) : (
                  "Подключить Garmin"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowConnectionDialog(false)}
                disabled={isConnecting}
                className="flex-1 sm:flex-none"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог с тренировками */}
      <Dialog open={showActivitiesDialog} onOpenChange={setShowActivitiesDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Мои тренировки Garmin
            </DialogTitle>
            <DialogDescription>
              Просмотр и управление вашими тренировками из Garmin Connect
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {isLoadingActivities ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="ml-2 text-sm text-gray-600">Загрузка тренировок...</span>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Тренировки не найдены</p>
                <p className="text-sm">Попробуйте синхронизировать данные</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-3 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base">{activity.name}</h4>
                          <Badge variant="outline" className="text-xs w-fit">
                            {activity.type}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{formatDate(activity.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-gray-500" />
                            <span>{formatDuration(activity.duration)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{formatDistance(activity.distance)}</span>
                          </div>
                          {activity.averageHeartRate && (
                            <div className="flex items-center gap-2">
                              <Heart className="w-4 h-4 text-red-500" />
                              <span>{activity.averageHeartRate} уд/мин</span>
                            </div>
                          )}
                        </div>
                        
                        {activity.calories && (
                          <div className="mt-2 text-xs text-gray-600">
                            Сожжено калорий: {activity.calories}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Открыть детальную информацию о тренировке
                          console.log("Открыть тренировку:", activity.id);
                        }}
                        className="w-full lg:w-auto"
                      >
                        Подробнее
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GarminIntegration;
