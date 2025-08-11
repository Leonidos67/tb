import WorkspaceAnalytics from "@/components/workspace/workspace-analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentProjects from "@/components/workspace/project/recent-projects";
import RecentTasks from "@/components/workspace/task/recent-tasks";
import RecentMembers from "@/components/workspace/member/recent-members";
import CompletedTasks from "./CompletedTasks";
import { useAuthContext } from "@/context/auth-provider";
import NewUserOnboardingDialog from "@/components/workspace/common/NewUserOnboardingDialog";
import { useState } from "react";
import { onboardingMutationFn } from "@/lib/api";

const WorkspaceDashboard = () => {
  const { user, refetchAuth } = useAuthContext();
  
  const shouldShowOnboarding = Boolean(user?.isNewUser && user?.userRole !== "athlete");
  const [open, setOpen] = useState(shouldShowOnboarding);

  const isCoach = user?.userRole === "coach";
  const isAthlete = user?.userRole === "athlete";

  const handleFinish = async (answer?: string) => {
    if (!answer) return;
    await onboardingMutationFn({ answer });
    await refetchAuth();
    setOpen(false);
  };

  return (
    <>
      {shouldShowOnboarding && (
        <NewUserOnboardingDialog
          open={open}
          onClose={() => setOpen(false)}
          onFinish={handleFinish}
        />
      )}
      <main className="flex flex-1 flex-col py-4 md:pt-3">
        <div className="flex items-center justify-between space-y-2 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {isCoach ? "Рабочая область" : isAthlete ? "Тренировочная зона" : "Рабочая область"}
            </h2>
          </div>
        </div>
        <WorkspaceAnalytics />
        <div className="mt-4">
          <Tabs defaultValue="projects" className="w-full border rounded-lg p-2">
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
              <CompletedTasks />
            </TabsContent>
            <TabsContent value="members" className="mt-0">
              <RecentMembers />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default WorkspaceDashboard;