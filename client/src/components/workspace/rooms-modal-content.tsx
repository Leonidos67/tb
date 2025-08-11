import React from 'react';
import { Link } from 'react-router-dom';
import { Loader, MoreHorizontal, Plus } from 'lucide-react';
import { AnimatedFolders } from '@/components/ui/motion/AnimatedFolders';
import { AnimatedDelete } from '@/components/ui/motion/AnimatedDelete';
import { AnimatedUsers } from '@/components/ui/motion/AnimatedUsers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Permissions } from '@/constant';
import PermissionsGuard from '@/components/resuable/permission-guard';
import useWorkspaceId from '@/hooks/use-workspace-id';
import useCreateProjectDialog from '@/hooks/use-create-project-dialog';
import useGetProjectsInWorkspaceQuery from '@/hooks/api/use-get-projects';
import { useAuthContext } from '@/context/auth-provider';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function RoomsModalContent() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const workspaceId = useWorkspaceId();
  const { onOpen } = useCreateProjectDialog();

  const [pageSize, setPageSize] = useState(10);
  const [pageNumber] = useState(1);
  const [openFolderAnimating, setOpenFolderAnimating] = React.useState(false);
  const [deleteAnimating, setDeleteAnimating] = React.useState(false);
  const [addUserAnimating, setAddUserAnimating] = React.useState(false);

  const isCoach = user?.userRole === 'coach';
  const isAthlete = user?.userRole === 'athlete';

  const { data, isPending, isFetching, isError } =
    useGetProjectsInWorkspaceQuery({
      workspaceId,
      pageSize,
      pageNumber,
    });

  const projects = data?.projects || [];

  const fetchNextPage = () => {
    if (isFetching) return;
    setPageSize((prev) => prev + 5);
  };

  if (isError) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">Ошибка загрузки комнат</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {isCoach ? 'Комнаты для спортсмена' : isAthlete ? 'Мои комнаты' : 'Комнаты для спортсмена'}
        </h3>
        <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
          <Button
            onClick={onOpen}
            size="sm"
            className="h-8 px-3"
          >
            <Plus className="h-4 w-4 mr-1" />
            Создать
          </Button>
        </PermissionsGuard>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-4">
            {isCoach 
              ? 'У вас пока нет комнат. Созданные вами комнаты будут отображаться здесь.'
              : isAthlete 
              ? 'У вас пока нет комнат. Созданные вами комнаты будут отображаться здесь.'
              : 'У вас пока нет комнат. Созданные вами комнаты будут отображаться здесь.'
            }
          </p>
          <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
            <Button
              variant="outline"
              onClick={onOpen}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Создать комнату
            </Button>
          </PermissionsGuard>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((item) => {
            const projectUrl = `/workspace/${workspaceId}/project/${item._id}`;

            return (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Link
                  to={projectUrl}
                  className="flex items-center gap-3 flex-1 hover:text-primary transition-colors"
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => navigate(projectUrl)}
                      onMouseEnter={() => setOpenFolderAnimating(true)}
                      onMouseLeave={() => setOpenFolderAnimating(false)}
                    >
                      <AnimatedFolders isAnimating={openFolderAnimating} />
                      <span>Открыть</span>
                    </DropdownMenuItem>
                    
                    {isCoach && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link 
                          to={`/workspace/${workspaceId}/members`} 
                          className="flex items-center gap-2"
                          onMouseEnter={() => setAddUserAnimating(true)}
                          onMouseLeave={() => setAddUserAnimating(false)}
                        >
                          <AnimatedUsers isAnimating={addUserAnimating} />
                          <span>Добавить участника</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {isCoach && (
                      <PermissionsGuard requiredPermission={Permissions.DELETE_PROJECT}>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive"
                          onMouseEnter={() => setDeleteAnimating(true)}
                          onMouseLeave={() => setDeleteAnimating(false)}
                        >
                          <AnimatedDelete isAnimating={deleteAnimating} />
                          <span>Удалить комнату</span>
                        </DropdownMenuItem>
                      </PermissionsGuard>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}

          {projects.length >= pageSize && (
            <Button
              variant="outline"
              onClick={fetchNextPage}
              disabled={isFetching}
              className="w-full"
            >
              {isFetching ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Загрузка...
                </>
              ) : (
                'Загрузить еще'
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
