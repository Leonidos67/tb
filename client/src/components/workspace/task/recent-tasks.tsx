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
import { Loader, Eye, FolderOpen } from "lucide-react";
import { useState } from "react";
import ViewTaskDialog from "@/components/workspace/task/view-task-dialog";
import { Link } from "react-router-dom";

const RecentTasks = () => {
  const workspaceId = useWorkspaceId();
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["all-tasks", workspaceId],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
      }),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const allTasks: TaskType[] = data?.tasks || [];
  
  // Фильтруем задачи, исключая выполненные (DONE)
  const tasks: TaskType[] = allTasks.filter(task => task.status !== TaskStatusEnum.DONE);

  const handleViewTask = (task: TaskType) => {
    setSelectedTask(task);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="flex flex-col pt-2">
      {isLoading ? (
        <Loader
          className="w-8 h-8 
        animate-spin
        place-self-center flex
        "
        />
      ) : null}

      {tasks?.length === 0 && (
        <div
          className="font-semibold
          text-sm text-muted-foreground
          text-center py-5"
        >
          Актуальные тренировки не найдены
        </div>
      )}

      <ul role="list" className="space-y-3">
        {tasks.map((task) => {
          const name = task?.assignedTo?.name || "";
          const initials = getAvatarFallbackText(name);
          const avatarColor = getAvatarColor(name);
          return (
            <li
              key={task._id}
              className="flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-card border-0 dark:border-0 hover:bg-gray-50 dark:hover:bg-accent/50 transition-colors duration-200"
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
                  Дедлайн: {task.dueDate ? format(task.dueDate, "PPP") : null}
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
                {task.project && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0"
                    title="Перейти в комнату"
                  >
                    <Link to={`/workspace/${workspaceId}/project/${task.project._id}`}>
                      <FolderOpen className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
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

      {/* View Task Dialog */}
      <ViewTaskDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        task={selectedTask}
      />
    </div>
  );
};

export default RecentTasks;

// const RecentTasks = () => {
//   const tasks = [
//     {
//       id: "Task-12",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//     {
//       id: "Task-13",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//     {
//       id: "Task-14",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//     {
//       id: "Task-15",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//     {
//       id: "Task-16",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//   ];
//   return (
//     <div className="flex flex-col pt-2">
//       <ul role="list" className="space-y-2">
//         {tasks.map((item, index) => (
//           <li
//             key={index}
//             role="listitem"
//             className="shadow-none border-0 py-2 hover:bg-[#fbfbfb] transition-colors ease-in-out "
//           >
//             <div className="grid grid-cols-7 gap-1 p-0">
//               <div className="shrink">
//                 <p>{item.id}</p>
//               </div>
//               <div className="col-span-2">
//                 <p className="text-sm font-medium leading-none">{item.title}</p>
//               </div>
//               <div>dueDate</div>
//               <div>Todo</div>
//               <div>High</div>
//               <div className="flex items-center gap-4 place-self-end">
//                 <span className="text-sm text-gray-500">Спортсмен</span>
//                 <Avatar className="hidden h-9 w-9 sm:flex">
//                   <AvatarImage src="/avatars/01.png" alt="Avatar" />
//                   <AvatarFallback>{item.assigneeTo}</AvatarFallback>
//                 </Avatar>
//               </div>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default RecentTasks;
