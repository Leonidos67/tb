import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskStatusEnum } from "@/constant";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAllTasksQueryFn } from "@/lib/api";
import {
  getAvatarColor,
  getAvatarFallbackText,
  transformStatusEnum,
} from "@/lib/helper";
import { TaskType } from "@/types/api.type";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Loader, Info, Eye } from "lucide-react";
import { useState } from "react";
import ViewTaskDialog from "@/components/workspace/task/view-task-dialog";

export default function SimpleCompletedTasks() {
  const workspaceId = useWorkspaceId();
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

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

  const completedTasks: TaskType[] = completedData?.tasks || [];

  const handleViewTask = (task: TaskType) => {
    setSelectedTask(task);
    setIsViewDialogOpen(true);
  };

  if (isCompletedLoading) {
    return (
      <div className="flex flex-col pt-2">
        <Loader className="w-8 h-8 animate-spin place-self-center flex" />
      </div>
    );
  }

  if (completedTasks.length === 0) {
    return (
      <div className="flex flex-col pt-2">
        <div className="font-semibold text-sm text-muted-foreground text-center py-5">
          Выполненных тренировок нет
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pt-2">
      <ul role="list" className="divide-y divide-gray-200">
        {completedTasks.map((task) => {
          const name = task?.assignedTo?.name || "";
          const initials = getAvatarFallbackText(name);
          const avatarColor = getAvatarColor(name);
          return (
            <li
              key={task._id}
              className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              {/* Task Info */}
              <div className="flex flex-col space-y-1 flex-grow">
                <span className="text-sm capitalize text-gray-600 font-medium">
                  {task.taskCode}
                </span>
                <p className="text-md font-semibold text-gray-800 truncate">
                  {task.title}
                </p>
                <span className="text-sm text-gray-500">
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
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewTask(task)}
                  className="h-8 w-8 p-0"
                  title="Просмотреть тренировку"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              {/* Assignee */}
              <div className="flex items-center space-x-2 ml-2">
                <Avatar className="h-8 w-8">
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

      {/* View Task Dialog */}
      <ViewTaskDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        task={selectedTask}
      />
    </div>
  );
}
