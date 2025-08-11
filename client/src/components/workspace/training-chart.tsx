import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader, EyeOff, Eye, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceWeeklyAnalyticsQueryFn } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CreateTaskDialog from "./task/create-task-dialog";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-green-600">{`Выполнено: ${payload[0].value}`}</p>
        <p className="text-gray-600">{`Всего: ${payload[1].value}`}</p>
      </div>
    );
  }
  return null;
};

const TrainingChart = () => {
  const workspaceId = useWorkspaceId();
  const [isVisible, setIsVisible] = useState(false); // По умолчанию скрыт
  const [currentWeek, setCurrentWeek] = useState(0); // Текущая неделя (0 = текущая)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false); // Состояние модального окна создания тренировки

  // Загружаем состояние из localStorage при монтировании
  useEffect(() => {
    const savedState = localStorage.getItem('training-chart-visible');
    if (savedState !== null) {
      setIsVisible(JSON.parse(savedState));
    }
  }, []);

  // Сохраняем состояние в localStorage при изменении
  const handleToggleVisibility = () => {
    const newState = !isVisible;
    setIsVisible(newState);
    localStorage.setItem('training-chart-visible', JSON.stringify(newState));
  };

  // Функции для переключения недель
  const goToPreviousWeek = () => {
    setCurrentWeek(prev => prev - 1);
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => prev + 1);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(0);
  };

  // Функция для получения дат недели
  const getWeekDates = (weekOffset: number) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1 + (weekOffset * 7)); // Понедельник + смещение недель
    startOfWeek.setHours(0, 0, 0, 0);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeek);

  const { data, isPending } = useQuery({
    queryKey: ["workspace-weekly-analytics", workspaceId, currentWeek],
    queryFn: () => getWorkspaceWeeklyAnalyticsQueryFn(workspaceId, currentWeek),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const weeklyData = data?.weeklyData || [];
  
  // Находим максимальное значение для расчета делений оси Y
  const maxValue = weeklyData.length > 0 
    ? Math.max(...weeklyData.map(item => Math.max(item.completed || 0, item.total || 0)))
    : 0;
  
  // Создаем массив делений от 0 до maxValue
  const yTicks = Array.from({ length: maxValue + 1 }, (_, i) => i);

  return (
    <Card className="shadow-none w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 sm:pb-6">
        <CardTitle className="text-sm font-medium">График тренировок</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleToggleVisibility}
          aria-label={isVisible ? "Скрыть график" : "Показать график"}
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </CardHeader>
      {isVisible && (
        <CardContent className="pb-2">
          {isPending ? (
            <div className="h-[300px] w-full flex items-center justify-center">
              <Loader className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="h-[250px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={weeklyData} 
                    margin={{ top: 20, right: 50, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 12 }}
                      className="text-xs sm:text-sm"
                    />
                    <YAxis 
                      tickFormatter={(value) => Math.round(value).toString()}
                      domain={[0, 'dataMax']}
                      ticks={yTicks}
                      tick={{ fontSize: 12 }}
                      className="text-xs sm:text-sm"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="completed" fill="#22c55e" name="Выполнено" />
                    <Bar dataKey="total" fill="#000000" name="Всего" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 mb-2">
                {/* Навигация, даты и кнопки */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Кнопки навигации */}
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousWeek}
                      aria-label="Предыдущая неделя"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={goToCurrentWeek}
                      disabled={currentWeek === 0}
                      aria-label="Текущая неделя"
                    >
                      Сегодня
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={goToNextWeek}
                      aria-label="Следующая неделя"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Диапазон дат */}
                  <div className="text-sm text-gray-600 font-medium text-center">
                    {weekDates[0].toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - {weekDates[6].toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </div>
                  
                  {/* Кнопка добавить тренировку */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => setIsTaskDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Добавить тренировку</span>
                  </Button>
                </div>
                
                {/* Легенда */}
                <div className="flex justify-center gap-4 sm:gap-6 mt-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: "#22c55e" }} />
                    <span className="text-gray-800 font-medium">Выполнено</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: "#000000" }} />
                    <span className="text-gray-800 font-medium">Всего</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
      
      {/* Модальное окно создания тренировки */}
      <CreateTaskDialog 
        open={isTaskDialogOpen} 
        onOpenChange={setIsTaskDialogOpen} 
      />
    </Card>
  );
};

export default TrainingChart;
