import {
  ArrowRight,
  Loader,
  MoreHorizontal,
  Plus,
  Move,
} from "lucide-react";
import { AnimatedFolders } from "@/components/ui/motion/AnimatedFolders";
import { AnimatedDelete } from "@/components/ui/motion/AnimatedDelete";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import { ConfirmDialog } from "../resuable/confirm-dialog";
import useConfirmDialog from "@/hooks/use-confirm-dialog";
import { Button } from "../ui/button";
import { Permissions } from "@/constant";
import PermissionsGuard from "../resuable/permission-guard";
import { useState } from "react";
import * as React from "react";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import { PaginationType } from "@/types/api.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProjectMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/auth-provider";
import { AnimatedUsers } from "../ui/motion/AnimatedUsers";
import { DraggableModal } from "../ui/draggable-modal";
import { RoomsModalContent } from "../workspace/rooms-modal-content";

export function NavProjects() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuthContext();

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { isMobile, open } = useSidebar();
  const { onOpen } = useCreateProjectDialog();
  const { context, open: openDialog, onOpenDialog, onCloseDialog } = useConfirmDialog();

  const [pageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [openFolderAnimating, setOpenFolderAnimating] = React.useState(false);
  const [deleteAnimating, setDeleteAnimating] = React.useState(false);
  const [addUserAnimating, setAddUserAnimating] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(true);

  const isCoach = user?.userRole === "coach";
  const isAthlete = user?.userRole === "athlete";

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: deleteProjectMutationFn,
  });

  const { data, isPending, isFetching, isError } =
    useGetProjectsInWorkspaceQuery({
      workspaceId,
      pageSize,
      pageNumber,
    });

  const projects = data?.projects || [];
  const pagination = data?.pagination || ({} as PaginationType);
  const hasMore = pagination?.totalPages > pageNumber;

  const fetchNextPage = () => {
    if (!hasMore || isFetching) return;
    setPageSize((prev) => prev + 5);
  };

  const handleConfirm = () => {
    if (!context) return;
    mutate(
      {
        workspaceId,
        projectId: context?._id,
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: ["allprojects", workspaceId],
          });
          toast({
            title: "Уведомление",
            description: data.message,
            variant: "success",
          });

          navigate(`/workspace/${workspaceId}`);
          setTimeout(() => onCloseDialog(), 100);
        },
        onError: (error) => {
          toast({
            title: "Уведомление",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsSidebarVisible(false);
  };

  const handleRestoreToSidebar = () => {
    setIsModalOpen(false);
    setIsSidebarVisible(true);
  };
  return (
    <>
      {isSidebarVisible && (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="w-full justify-between pr-0">
          <span>
            {isCoach ? "Комнаты для спортсмена" : isAthlete ? "Мои комнаты" : "Комнаты для спортсмена"}
          </span>

          {/* Кнопки для всех пользователей */}
          <div className="flex items-center gap-1">
            <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
              <button
                onClick={onOpen}
                type="button"
                className="flex size-5 items-center justify-center rounded-full border"
              >
                <Plus className="size-3.5" />
              </button>
            </PermissionsGuard>
            <button
              onClick={handleOpenModal}
              type="button"
              className="hidden md:flex size-5 items-center justify-center rounded-full border"
              title="Открыть в drag окне"
            >
              <Move className="size-3.5" />
            </button>
          </div>
        </SidebarGroupLabel>
        <SidebarMenu className={`h-[320px] scrollbar overflow-y-auto pb-2 transition-transform duration-200 ${!open ? '-translate-x-2' : ''}`}>
          {isError ? <div></div> : null}
          {isPending ? (
            <Loader
              className=" w-5 h-5
             animate-spin
              place-self-center"
            />
          ) : null}

          {!isPending && projects?.length === 0 ? (
            <div className="pl-3">
              <p className="text-xs text-muted-foreground">
                {isCoach 
                  ? "У вас пока нет комнат. Созданные вами комнаты будут отображаться здесь."
                  : isAthlete 
                  ? "У вас пока нет комнат. Созданные вами комнаты будут отображаться здесь."
                  : "У вас пока нет комнат. Созданные вами комнаты будут отображаться здесь."
                }
              </p>
              {/* Кнопка создания для всех пользователей */}
              <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
                <Button
                  variant="link"
                  type="button"
                  className="h-0 p-0 text-[13px] underline font-semibold mt-4"
                  onClick={onOpen}
                >
                  {isCoach ? "Создать комнату" : isAthlete ? "Создать комнату" : "Создать комнату"}
                  <ArrowRight />
                </Button>
              </PermissionsGuard>
            </div>
          ) : (
            projects.map((item) => {
              const projectUrl = `/workspace/${workspaceId}/project/${item._id}`;

              return (
                <SidebarMenuItem key={item._id}>
                  <SidebarMenuButton asChild isActive={projectUrl === pathname}>
                    <Link to={projectUrl}>
                      {item.emoji}
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48 rounded-lg"
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "end" : "start"}
                    >

                    <DropdownMenuItem
                      className="!cursor-pointer"  
                      onClick={() => navigate(`${projectUrl}`)}
                      onMouseEnter={() => setOpenFolderAnimating(true)}
                      onMouseLeave={() => setOpenFolderAnimating(false)}
                    >
                      <AnimatedFolders isAnimating={openFolderAnimating} />
                      <span>Открыть</span>
                    </DropdownMenuItem>
                    
                    {/* Кнопка "Добавить участника" только для тренеров */}
                    {isCoach && (
                      <DropdownMenuItem asChild className="!cursor-pointer">
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

                    {/* Кнопка "Удалить" только для тренеров */}
                    {isCoach && (
                      <PermissionsGuard
                        requiredPermission={Permissions.DELETE_PROJECT}
                      >
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="!cursor-pointer"
                          disabled={isLoading}
                          onClick={() => onOpenDialog(item)}
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
                </SidebarMenuItem>
              );
            })
          )}

          {hasMore && (
            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-sidebar-foreground/70"
                disabled={isFetching}
                onClick={fetchNextPage}
              >
                <MoreHorizontal className="text-sidebar-foreground/70" />
                <span>{isFetching ? "Загрузка..." : "More"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroup>
      )}

      <DraggableModal
        isOpen={isModalOpen}
        onRestore={handleRestoreToSidebar}
      >
        <RoomsModalContent />
      </DraggableModal>

      <ConfirmDialog
        isOpen={openDialog}
        isLoading={isLoading}
        onClose={onCloseDialog}
        onConfirm={handleConfirm}
        title={isCoach ? "Удаление комнаты" : "Удаление тренировки"}
        description={`Вы уверены, что хотите удалить "${
          context?.name || "this item"
        }"? Это действие невозможно отменить.`}
        confirmText="Удалить"
        cancelText="Отменить"
      />
    </>
  );
}
