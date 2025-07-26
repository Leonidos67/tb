import { TaskStatusEnum } from "@/constant";
import { CheckCircle, Circle, HelpCircle } from "lucide-react";

export const statuses = [
  { value: TaskStatusEnum.BACKLOG, label: "Загружено", icon: HelpCircle },
  { value: TaskStatusEnum.TODO, label: "Просмотрено", icon: Circle },
  { value: TaskStatusEnum.DONE, label: "Выполнено", icon: CheckCircle },
];
