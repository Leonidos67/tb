import WorkspaceAnalytics from "@/components/workspace/workspace-analytics";
import TrainingChart from "@/components/workspace/training-chart";
import IntegrationsManager from "@/components/integrations/integrations-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentProjects from "@/components/workspace/project/recent-projects";
import RecentTasks from "@/components/workspace/task/recent-tasks";
import RecentMembers from "@/components/workspace/member/recent-members";
import SimpleCompletedTasks from "@/components/workspace/task/simple-completed-tasks";
import { useAuthContext } from "@/context/auth-provider";
import NewUserOnboardingDialog from "@/components/workspace/common/NewUserOnboardingDialog";
import { useState } from "react";
import { onboardingMutationFn } from "@/lib/api";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomSheet from "@/components/ui/bottom-sheet";
import FullscreenModal from "@/components/ui/fullscreen-modal";

const WorkspaceDashboard = () => {
  const { user, refetchAuth } = useAuthContext();
  
  const shouldShowOnboarding = Boolean(user?.isNewUser && user?.userRole !== "athlete");
  const [open, setOpen] = useState(shouldShowOnboarding);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const isCoach = user?.userRole === "coach";
  const isAthlete = user?.userRole === "athlete";

  const handleFinish = async (answer?: string) => {
    if (!answer) return;
    await onboardingMutationFn({ answer });
    await refetchAuth();
    setOpen(false);
  };

  const handleFullscreenToggle = () => {
    setIsFullscreenOpen(!isFullscreenOpen);
  };

  const DashboardContent = () => (
    <main className="flex flex-1 flex-col py-4 md:pt-3 bg-white relative z-10 pointer-events-auto main-content">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isCoach ? "Рабочая область" : isAthlete ? "Тренировочная зона" : "Рабочая область"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFullscreenToggle}
          className="h-8 w-10 border"
        >
          {isFullscreenOpen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsBottomSheetOpen(true)}
          className="h-8"
        >
          Открыть панель
        </Button>
        </div>
      </div>
      <WorkspaceAnalytics />
      <div className="mt-4">
        <TrainingChart />
      </div>
      <div className="mt-4">
        <IntegrationsManager />
      </div>
      <div className="mt-4 mb-4">
        <Tabs defaultValue="projects" className="w-full border rounded-lg p-2 bg-white main-content">
          <div className="relative">
            <TabsList className="w-full justify-start border-0 bg-gray-50 px-1 h-12 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <TabsTrigger className="py-2" value="projects">
                {isCoach ? "Общие комнаты со спортсменом" : isAthlete ? "Общие комнаты с тренером" : "Общие комнаты со спортсменом"}
              </TabsTrigger>
              <TabsTrigger className="py-2" value="tasks">
                Актуальные тренировки
              </TabsTrigger>
              <TabsTrigger className="py-2" value="completed">
                Выполненные тренировки
              </TabsTrigger>
              <TabsTrigger className="py-2" value="members">
                {isCoach ? "Участники зоны" : isAthlete ? "Участники зоны" : "Участники зоны"}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="projects" className="mt-0">
            <RecentProjects />
          </TabsContent>
          <TabsContent value="tasks" className="mt-0">
            <RecentTasks />
          </TabsContent>
          <TabsContent value="completed" className="mt-0">
            <SimpleCompletedTasks />
          </TabsContent>
          <TabsContent value="members" className="mt-0">
            <RecentMembers />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );

  // Отдельный компонент для модального окна без лишних классов
  const ModalDashboardContent = () => (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isCoach ? "Рабочая область" : isAthlete ? "Тренировочная зона" : "Рабочая область"}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFullscreenOpen(false)}
          className="h-8 w-10 border"
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </div>
      <WorkspaceAnalytics />
      <div className="mt-4">
        <TrainingChart />
      </div>
      <div className="mt-4">
        <IntegrationsManager />
      </div>
      <div className="mt-4 mb-8">
        <Tabs defaultValue="projects" className="w-full border rounded-lg p-2 bg-white">
          <div className="relative">
            <TabsList className="w-full justify-start border-0 bg-gray-50 px-1 h-12 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <TabsTrigger className="py-2" value="projects">
                {isCoach ? "Общие комнаты со спортсменом" : isAthlete ? "Общие комнаты с тренером" : "Общие комнаты со спортсменом"}
              </TabsTrigger>
              <TabsTrigger className="py-2" value="tasks">
                Актуальные тренировки
              </TabsTrigger>
              <TabsTrigger className="py-2" value="completed">
                Выполненные тренировки
              </TabsTrigger>
              <TabsTrigger className="py-2" value="members">
                {isCoach ? "Участники зоны" : isAthlete ? "Участники зоны" : "Участники зоны"}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="projects" className="mt-0">
            <RecentProjects />
          </TabsContent>
          <TabsContent value="tasks" className="mt-0">
            <RecentTasks />
          </TabsContent>
          <TabsContent value="completed" className="mt-0">
            <SimpleCompletedTasks />
          </TabsContent>
          <TabsContent value="members" className="mt-0">
            <RecentMembers />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  return (
    <>
      {shouldShowOnboarding && (
        <NewUserOnboardingDialog
          open={open}
          onClose={() => setOpen(false)}
          onFinish={handleFinish}
        />
      )}
      <DashboardContent />
      <BottomSheet
        open={isBottomSheetOpen}
        onOpenChange={setIsBottomSheetOpen}
        title={isCoach ? "Панель тренера" : isAthlete ? "Панель спортсмена" : "Панель"}
        description="Быстрый доступ к действиям и информации"
      >
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Быстрые действия</div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setIsBottomSheetOpen(false)}>Закрыть</Button>
            <Button variant="default">Новая тренировка</Button>
            <Button variant="outline">Пригласить участника</Button>
            <Button variant="outline">Создать комнату</Button>
          </div>
        </div>
      </BottomSheet>
      <FullscreenModal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
      >
        <ModalDashboardContent />
      </FullscreenModal>
    </>
  );
};

export default WorkspaceDashboard;