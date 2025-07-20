import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Loader } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Plus } from "lucide-react";
import CreateTaskDialog from "@/components/workspace/task/create-task-dialog";

export default function CompletedTasks() {
  const workspaceId = useWorkspaceId();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const location = useLocation();
  const isStandalonePage = location.pathname.endsWith("/completed");

  const { data, isLoading } = useQuery({
    queryKey: ["all-tasks", workspaceId, "completed"],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        status: TaskStatusEnum.DONE,
      }),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const tasks: TaskType[] = data?.tasks || [];

  return (
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
            <button
              className="whitespace-nowrap bg-primary text-white rounded-md px-4 py-2 flex items-center font-semibold hover:bg-primary/90 transition-colors"
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
      <div className="flex flex-col pt-2">
        {isLoading ? (
          <Loader className="w-8 h-8 animate-spin place-self-center flex" />
        ) : null}

        {tasks?.length === 0 && !isLoading && (
          <div className="font-semibold text-sm text-muted-foreground text-center py-5">
            Выполненных тренировок нет
          </div>
        )}

        <ul role="list" className="divide-y divide-gray-200">
          {tasks.map((task) => {
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
                    Дата: {task.dueDate ? format(task.dueDate, "PPP") : null}
                  </span>
                </div>

                {/* Task Status */}
                <div className="text-sm font-medium ">
                  <Badge
                    variant={TaskStatusEnum[task.status]}
                    className="flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0"
                  >
                    <span>{transformStatusEnum(task.status)}</span>
                  </Badge>
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
      </div>
    </div>
  );
} 