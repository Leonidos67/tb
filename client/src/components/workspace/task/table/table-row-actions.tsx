import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/resuable/confirm-dialog";
import { TaskType } from "@/types/api.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { deleteTaskMutationFn, editTaskMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import EditTaskDialog from "../edit-task-dialog"; // Import the Edit Dialog
import { TaskStatusEnum, TaskStatusEnumType } from "@/constant";

interface DataTableRowActionsProps {
  row: Row<TaskType>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [openDeleteDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false); // State for edit dialog
  const [openStatusMenu, setOpenStatusMenu] = useState(false);
  const [isStatusPending, setIsStatusPending] = useState(false);

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { mutate, isPending } = useMutation({
    mutationFn: deleteTaskMutationFn,
  });

  const { mutate: mutateStatus } = useMutation({
    mutationFn: editTaskMutationFn,
  });

  const task = row.original;
  const taskId = task._id as string;
  const taskCode = task.taskCode;
  const projectId = task.project?._id || "";

  const handleConfirm = () => {
    mutate(
      { workspaceId, taskId },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
          toast({ title: "Уведомление", description: data.message, variant: "success" });
          setTimeout(() => setOpenDialog(false), 100);
        },
        onError: (error) => {
          toast({ title: "Уведомление", description: error.message, variant: "destructive" });
        },
      }
    );
  };

  // Быстрое изменение статуса
  const statusOptions = [
    { value: TaskStatusEnum.BACKLOG, label: "Загружено" },
    { value: TaskStatusEnum.TODO, label: "Просмотрено" },
    { value: TaskStatusEnum.DONE, label: "Выполнено" },
  ];

  const handleQuickStatusChange = (status: string) => {
    if (!projectId) {
      toast({ title: "Уведомление", description: "У задачи не найден проект. Смена статуса невозможна.", variant: "destructive" });
      return;
    }
    setIsStatusPending(true);
    mutateStatus(
      {
        taskId,
        workspaceId,
        projectId,
        data: {
          status: status as TaskStatusEnumType,
          title: task.title,
          description: task.description ?? "",
          assignedTo: task.assignedTo?._id ?? "",
          dueDate: task.dueDate,
          priority: task.priority || 'LOW',
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
          toast({ title: "Уведомление", description: "Статус успешно обновлён", variant: "success" });
        },
        onError: (error) => {
          toast({ title: "Уведомление", description: error.message, variant: "destructive" });
        },
        onSettled: () => {
          setIsStatusPending(false);
          setOpenStatusMenu(false);
        },
      }
    );
  };

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Кнопка быстрого изменения статуса */}
        <DropdownMenu open={openStatusMenu} onOpenChange={setOpenStatusMenu}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-8 w-8 p-0" title="Быстро изменить статус" disabled={!projectId}>
              <RotateCw />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            {statusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleQuickStatusChange(option.value)}
                disabled={isStatusPending || task.status === option.value}
                className={task.status === option.value ? "font-bold" : ""}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Троеточие */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
              <MoreHorizontal />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            {/* Edit Task Option */}
            <DropdownMenuItem className="cursor-pointer" onClick={() => setOpenEditDialog(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {/* Delete Task Option */}
            <DropdownMenuItem
              className="!text-destructive cursor-pointer"
              onClick={() => setOpenDialog(true)}
            >
              Удалить
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Task Dialog */}
      <EditTaskDialog task={task} isOpen={openEditDialog} onClose={() => setOpenEditDialog(false)} />

      {/* Delete Task Confirmation Dialog */}
      <ConfirmDialog
        isOpen={openDeleteDialog}
        isLoading={isPending}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleConfirm}
        title="Удаление тренировки"
        description={`Вы действительно уверены, что хотите удалить "${taskCode}"?`}
        confirmText="Удалить"
        cancelText="Отменить"
      />
    </>
  );
}
