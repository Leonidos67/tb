import { Separator } from "@/components/ui/separator";
import InviteMember from "@/components/workspace/member/invite-member";
import AllMembers from "@/components/workspace/member/all-members";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";
import { useAuthContext } from "@/context/auth-provider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";

export default function Members() {
  const { user } = useAuthContext();
  const workspaceId = useWorkspaceId();
  const isCoach = user?.userRole === "coach";
  const isAthlete = user?.userRole === "athlete";

  // Если пользователь спортсмен, показываем сообщение о том, что страница недоступна
  if (isAthlete) {
    return (
      <div className="w-full h-full flex-col space-y-8 pt-3">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              Страница недоступна
            </h2>
            <p className="text-muted-foreground mb-6">
              Эта страница доступна только для тренеров. Спортсмены не могут управлять участниками рабочей зоны.
            </p>
            <Button asChild>
              <Link to={`/workspace/${workspaceId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться на главную
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex-col space-y-8 pt-3">
      <WorkspaceHeader />
      <Separator className="my-4 " />
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isCoach ? "Мои спортсмены" : "Участники"}
          </h2>
          <p className="text-muted-foreground">
            {isCoach 
              ? "Управляйте своими спортсменами, приглашайте новых участников и отслеживайте их прогресс."
              : "Участники рабочей области могут просматривать все проекты и задачи рабочей области и присоединяться к ним, а также создавать новые задачи в рабочей области."
            }
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <InviteMember />
      <Separator className="my-4 !h-[0.5px]" />
      <AllMembers />
    </div>
  );
}
