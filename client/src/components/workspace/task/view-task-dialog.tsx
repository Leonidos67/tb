import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TaskType } from "@/types/api.type";
import { TaskStatusEnum } from "@/constant";
import { transformStatusEnum } from "@/lib/helper";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { useState } from "react";
import { Info, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";

interface ViewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskType | null;
  onReupload?: (taskId: string, comment: string) => void;
}

export default function ViewTaskDialog({ 
  open, 
  onOpenChange, 
  task, 
  onReupload 
}: ViewTaskDialogProps) {
  const [comment, setComment] = useState("");
  const [isReuploading, setIsReuploading] = useState(false);

  const handleReupload = async () => {
    if (!task || !onReupload) return;
    
    setIsReuploading(true);
    try {
      await onReupload(task._id, comment);
      setComment("");
      onOpenChange(false);
    } catch (error) {
      console.error("Ошибка при повторной загрузке:", error);
    } finally {
      setIsReuploading(false);
    }
  };

  if (!task) return null;

  const name = task?.assignedTo?.name || "";
  const initials = getAvatarFallbackText(name);
  const avatarColor = getAvatarColor(name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Детальная информация о тренировке
          </DialogTitle>
          <DialogDescription>
            Просмотр детальной информации о тренировке и возможность повторной загрузки
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Код тренировки</Label>
              <p className="text-lg font-semibold">{task.taskCode}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-600">Название</Label>
              <p className="text-lg font-semibold">{task.title}</p>
            </div>
            
            {task.description && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Описание</Label>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}
            
            <div>
              <Label className="text-sm font-medium text-gray-600">Статус</Label>
              <Badge
                variant={TaskStatusEnum[task.status]}
                className="mt-1 flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0"
              >
                <span>{transformStatusEnum(task.status)}</span>
              </Badge>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-600">Дедлайн тренировки</Label>
              <p className="text-sm text-gray-700">
                {task.dueDate ? format(new Date(task.dueDate), "d MMMM yyyy", { locale: ru }) : "Не указана"}
              </p>
            </div>
            
            {task.createdAt && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Дата создания</Label>
                <p className="text-sm text-gray-700">
                  {format(new Date(task.createdAt), "d MMMM yyyy", { locale: ru })}
                </p>
              </div>
            )}
            
            {task.createdAt && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Время создания</Label>
                <p className="text-sm text-gray-700">
                  {format(new Date(task.createdAt), "HH:mm", { locale: ru })}
                </p>
              </div>
            )}

            {task.project && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Комната</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">{task.project.emoji}</span>
                  <span className="text-sm font-medium">{task.project.name}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Исполнитель */}
          {task.assignedTo && (
            <div>
              <Label className="text-sm font-medium text-gray-600">Исполнитель</Label>
              <div className="flex items-center gap-3 mt-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={task.assignedTo.profilePicture || ""}
                    alt={task.assignedTo.name}
                  />
                  <AvatarFallback className={avatarColor}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{task.assignedTo.name}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Повторная загрузка */}
          {onReupload && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-600">
                Комментарий к повторной загрузке
              </Label>
              <Textarea
                placeholder="Укажите причину повторной загрузки тренировки..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleReupload}
                disabled={isReuploading || !comment.trim()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isReuploading ? "Загрузка..." : "Загрузить повторно"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
