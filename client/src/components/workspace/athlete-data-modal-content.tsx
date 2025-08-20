import * as React from "react";
import { Check, Loader, Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useCreateWorkspaceDialog from "@/hooks/use-create-workspace-dialog";
import { useQuery } from "@tanstack/react-query";
import { getAllWorkspacesUserIsMemberQueryFn } from "@/lib/api";
import { useAuthContext } from "@/context/auth-provider";
import { Button } from "../ui/button";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type WorkspaceType = {
  _id: string;
  name: string;
};

export function AthleteDataModalContent() {
  const navigate = useNavigate();
  const { onOpen } = useCreateWorkspaceDialog();
  const workspaceId = useWorkspaceId();
  const { user } = useAuthContext();

  const [activeWorkspace, setActiveWorkspace] = React.useState<WorkspaceType>();

  const { data, isPending } = useQuery({
    queryKey: ["userWorkspaces"],
    queryFn: getAllWorkspacesUserIsMemberQueryFn,
    staleTime: 1,
    refetchOnMount: true,
  });

  const workspaces = data?.workspaces;

  React.useEffect(() => {
    if (workspaces?.length) {
      const workspace = workspaceId
        ? workspaces.find((ws) => ws._id === workspaceId)
        : workspaces[0];

      if (workspace) {
        setActiveWorkspace(workspace);
      }
    }
  }, [workspaceId, workspaces]);

  const onSelect = (workspace: WorkspaceType) => {
    if (workspace._id === workspaceId) {
      toast({
        title: "Уведомление",
        description: "Этот спортсмен уже активен",
      });
      return;
    }
    setActiveWorkspace(workspace);
    navigate(`/workspace/${workspace._id}`);
  };

  const isCoach = user?.userRole === "coach";
  const isAthlete = user?.userRole === "athlete";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {isCoach ? 'Данные спортсмена' : isAthlete ? 'Мои данные' : 'Данные спортсмена'}
        </h3>
        <Button
          onClick={onOpen}
          size="sm"
          className="h-8 px-3"
        >
          <Plus className="h-4 w-4 mr-1" />
          Добавить
        </Button>
      </div>

      {isPending ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin" />
        </div>
      ) : workspaces?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-4">
            {isCoach 
              ? 'У вас пока нет спортсменов. Добавленные спортсмены будут отображаться здесь.'
              : isAthlete 
              ? 'У вас пока нет данных. Ваши данные будут отображаться здесь.'
              : 'У вас пока нет спортсменов. Добавленные спортсмены будут отображаться здесь.'
            }
          </p>
          <Button
            variant="outline"
            onClick={onOpen}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            {isCoach ? 'Добавить спортсмена' : isAthlete ? 'Добавить данные' : 'Добавить спортсмена'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {workspaces?.map((workspace) => (
            <div
              key={workspace._id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => onSelect(workspace)}
            >
              <div className="flex items-center gap-3">
                <div className="flex aspect-square size-10 items-center font-semibold justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {workspace?.name?.split(" ")?.[0]?.charAt(0)}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {workspace?.name}
                  </span>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end" className="w-48">
                   {workspace._id !== workspaceId ? (
                     <DropdownMenuItem
                       className="cursor-pointer"
                       onClick={() => onSelect(workspace)}
                     >
                       <Check className="h-4 w-4 mr-2" />
                       <span>Выбрать</span>
                     </DropdownMenuItem>
                   ) : (
                     <DropdownMenuItem className="cursor-pointer" disabled>
                       <Check className="h-4 w-4 mr-2" />
                       <span>Выбрано</span>
                       <DropdownMenuShortcut>
                         <Check className="w-4 h-4" />
                       </DropdownMenuShortcut>
                     </DropdownMenuItem>
                   )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate(`/workspace/${workspace._id}/settings`)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Настройки</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
