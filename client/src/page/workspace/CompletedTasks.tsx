import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskStatusEnum } from "@/constant";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAllTasksQueryFn, hideTaskMutationFn, editTaskMutationFn, unhideTaskMutationFn } from "@/lib/api";
import {
  getAvatarColor,
  getAvatarFallbackText,
  transformStatusEnum,
} from "@/lib/helper";
import { TaskType } from "@/types/api.type";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Loader, Info, Trash2, Plus, Maximize2, Minimize2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import CreateTaskDialog from "@/components/workspace/task/create-task-dialog";
import ViewTaskDialog from "@/components/workspace/task/view-task-dialog";
import { useToast } from "@/hooks/use-toast";
import FullscreenModal from "@/components/ui/fullscreen-modal";

export default function CompletedTasks() {
  const workspaceId = useWorkspaceId();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("completed");
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const location = useLocation();
  const isStandalonePage = location.pathname.endsWith("/completed");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: completedData, isLoading: isCompletedLoading } = useQuery({
    queryKey: ["all-tasks", workspaceId, "completed"],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        status: TaskStatusEnum.DONE,
      }),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const { data: hiddenData, isLoading: isHiddenLoading } = useQuery({
    queryKey: ["all-tasks", workspaceId, "hidden"],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        status: TaskStatusEnum.DONE,
        includeHidden: true,
      }),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const hideTaskMutation = useMutation({
    mutationFn: hideTaskMutationFn,
    onSuccess: () => {
      toast({
        title: "Уведомление",
        description: "Тренировка скрыта",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
    },
    onError: () => {
      toast({
        title: "Уведомление",
        description: "Не удалось скрыть тренировку",
        variant: "destructive",
      });
    },
  });

  const unhideTaskMutation = useMutation({
    mutationFn: unhideTaskMutationFn,
    onSuccess: () => {
      toast({
        title: "Уведомление",
        description: "Тренировка восстановлена",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
    },
    onError: () => {
      toast({
        title: "Уведомление",
        description: "Не удалось восстановить тренировку",
        variant: "destructive",
      });
    },
  });

  const reuploadTaskMutation = useMutation({
    mutationFn: editTaskMutationFn,
    onSuccess: () => {
      toast({
        title: "Уведомление",
        description: "Тренировка отправлена на повторную загрузку",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
    },
    onError: () => {
      toast({
        title: "Уведомление",
        description: "Не удалось отправить тренировку на повторную загрузку",
        variant: "destructive",
      });
    },
  });

  const completedTasks: TaskType[] = completedData?.tasks || [];
  const hiddenTasks: TaskType[] = (hiddenData?.tasks || []).filter(task => task.isHidden === true);

  const handleViewTask = (task: TaskType) => {
    setSelectedTask(task);
    setIsViewDialogOpen(true);
  };

  const handleHideTask = (taskId: string) => {
    hideTaskMutation.mutate({ workspaceId, taskId });
  };

  const handleUnhideTask = (taskId: string) => {
    unhideTaskMutation.mutate({ workspaceId, taskId });
  };

  const handleReupload = async (taskId: string, comment: string) => {
    if (!selectedTask?.project?._id) return;
    
    reuploadTaskMutation.mutate({
      taskId,
      workspaceId,
      projectId: selectedTask.project._id,
      data: {
        status: TaskStatusEnum.TODO,
        description: selectedTask.description ? `${selectedTask.description}\n\nКомментарий к повторной загрузке: ${comment}` : `Комментарий к повторной загрузке: ${comment}`,
        title: selectedTask.title,
        priority: selectedTask.priority,
        assignedTo: selectedTask.assignedTo?._id || undefined,
        dueDate: selectedTask.dueDate,
      },
    });
  };

  const handleFullscreenToggle = () => {
    setIsFullscreenOpen(!isFullscreenOpen);
  };

  const renderTaskList = (tasks: TaskType[], showHideButton: boolean = false) => {
    if (tasks.length === 0) {
      return (
        <div className="font-semibold text-sm text-muted-foreground text-center py-5">
          {activeTab === "completed" ? "Выполненных тренировок нет" : "Скрытых тренировок нет"}
        </div>
      );
    }

    return (
      <ul role="list" className="space-y-3">
        {tasks.map((task) => {
          const name = task?.assignedTo?.name || "";
          const initials = getAvatarFallbackText(name);
          const avatarColor = getAvatarColor(name);
          return (
            <li
              key={task._id}
              className="flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-card border border-gray-200 dark:border-border/50 hover:bg-gray-50 dark:hover:bg-accent/50 transition-colors duration-200"
            >
              {/* Task Info */}
              <div className="flex flex-col flex-grow">
                <span className="text-sm capitalize text-gray-600 dark:text-muted-foreground font-medium">
                  {task.taskCode}
                </span>
                <p className="text-sm font-medium text-gray-900 dark:text-foreground truncate">
                  {task.title}
                </p>
                <span className="text-sm text-gray-500 dark:text-muted-foreground">
                  Дата: {task.dueDate ? format(new Date(task.dueDate), "d MMMM yyyy", { locale: ru }) : "Не указана"}
                </span>
              </div>

              {/* Task Status */}
              <div className="text-sm font-medium">
                <Badge
                  variant={TaskStatusEnum[task.status]}
                  className="flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0"
                >
                  <span>{transformStatusEnum(task.status)}</span>
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewTask(task)}
                  className="h-8 w-8 p-0"
                >
                  <Info className="h-4 w-4" />
                </Button>
                
                {showHideButton ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHideTask(task._id)}
                    disabled={hideTaskMutation.isPending}
                    className="h-8 w-8 p-0"
                    title="Скрыть тренировку"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnhideTask(task._id)}
                    disabled={unhideTaskMutation.isPending}
                    className="h-8 w-8 p-0"
                    title="Восстановить тренировку"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Assignee */}
              <div className="flex-shrink-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={task.assignedTo?.profilePicture || ""}
                    alt={task.assignedTo?.name}
                  />
                  <AvatarFallback className={avatarColor}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  const CompletedTasksContent = () => (
    <div className="flex flex-col pt-2">
      {isStandalonePage && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Выполненные тренировки</h2>
            <p className="text-muted-foreground">
              Список выполненных тренировок
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreenToggle}
              className="px-5 py-1.5 border"
            >
              {isFullscreenOpen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <button
              className="whitespace-nowrap bg-primary text-primary-foreground rounded-md px-5 py-1.5 flex items-center font-semibold hover:bg-primary/90 transition-colors"
              onClick={() => setIsTaskDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить тренировку
            </button>
          </div>
        </div>
      )}
      
      {isStandalonePage && (
        <CreateTaskDialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen} />
      )}

      {/* Tabs */}
      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="completed">Выполненные тренировки</TabsTrigger>
                         <TabsTrigger value="hidden" className="flex items-center gap-2">
               <Trash2 className="w-4 h-4" />
               Скрытые тренировки
             </TabsTrigger>
          </TabsList>
          
          <TabsContent value="completed" className="mt-4">
            {isCompletedLoading ? (
              <Loader className="w-8 h-8 animate-spin place-self-center flex" />
            ) : (
              renderTaskList(completedTasks, true)
            )}
          </TabsContent>
          
          <TabsContent value="hidden" className="mt-4">
            {isHiddenLoading ? (
              <Loader className="w-8 h-8 animate-spin place-self-center flex" />
            ) : (
              renderTaskList(hiddenTasks, false)
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* View Task Dialog */}
      <ViewTaskDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        task={selectedTask}
        onReupload={handleReupload}
      />
    </div>
  );

  return (
    <>
      <CompletedTasksContent />
      <FullscreenModal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
      >
        <CompletedTasksContent />
      </FullscreenModal>
    </>
  );
} 