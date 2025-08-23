import React from "react";
import { TaskType } from "@/types/api.type";
import {
  addDays,
  startOfWeek,
  isSameDay,
  format,
  parseISO,
} from "date-fns";
import { ru } from "date-fns/locale";
import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";

type WeeklyCalendarProps = {
  tasks: TaskType[];
  onCreateTask?: (date: Date) => void;
};

function getStartOfCurrentWeek(date = new Date()): Date {
  // Week starts on Monday for RU locale
  return startOfWeek(date, { weekStartsOn: 1 });
}

export default function WeeklyCalendar({ tasks, onCreateTask }: WeeklyCalendarProps) {
  const navigate = useNavigate();
  const workspaceId = useWorkspaceId();
  const weekStart = React.useMemo(() => getStartOfCurrentWeek(), []);

  const days = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const tasksByDay = React.useMemo(() => {
    return days.map((day) => {
      const dayTasks = tasks.filter((task) => {
        const due = parseISO(task.dueDate);
        return isSameDay(due, day);
      });
      // Optional: sort by time if present in dueDate
      dayTasks.sort((a, b) =>
        parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()
      );
      return dayTasks;
    });
  }, [days, tasks]);

  const handleCreateTask = (date: Date) => {
    if (onCreateTask) {
      onCreateTask(date);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 md:gap-3">
        {days.map((day, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-md border bg-card min-h-[220px]"
          >
            {(() => {
              const isCurrent = isSameDay(day, new Date());
              return (
                <div className={`px-2 py-1.5 border-b rounded-t-md ${isCurrent ? "bg-foreground text-background" : "bg-muted"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-xs ${isCurrent ? "text-background/80" : "text-muted-foreground"}`}>
                        {format(day, "EEEE", { locale: ru })}
                      </div>
                      <div className={`text-sm font-semibold ${isCurrent ? "text-background" : ""}`}>
                        {format(day, "d MMM", { locale: ru })}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 w-6 p-0 ${isCurrent ? "text-background hover:bg-background/10" : "hover:bg-accent"}`}
                      onClick={() => handleCreateTask(day)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })()}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
              {tasksByDay[idx].length === 0 ? (
                <div className="text-xs text-muted-foreground">Нет тренировок</div>
              ) : (
                tasksByDay[idx].map((task) => (
                  <div
                    key={task._id}
                    className="rounded border p-2 text-sm bg-card hover:bg-accent transition-colors"
                    title={task.title}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium line-clamp-2">{task.title}</div>
                        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{format(parseISO(task.dueDate), "HH:mm")}</span>
                          {task.project?.name && (
                            <span className="truncate max-w-[80px]">{task.project.name}</span>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 p-0 shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-[90]">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              const prefill = `Расскажи про тренировку: ${task.title}`;
                              navigate(`/workspace/${workspaceId}/ai`, { state: { prefillQuestion: prefill } });
                            }}
                          >
                            Спросить у ИИ
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              // TODO: open edit dialog when available
                              navigate(`/workspace/${workspaceId}/tasks`, { state: { editTaskId: task._id } });
                            }}
                          >
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-700"
                            onClick={() => {
                              // TODO: wire real delete with confirmation
                              const event = new CustomEvent("task-delete-request", { detail: { taskId: task._id } });
                              window.dispatchEvent(event);
                            }}
                          >
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


