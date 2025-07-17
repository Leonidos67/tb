import CreateTaskDialog from "@/components/workspace/task/create-task-dialog";
import TaskTable from "@/components/workspace/task/task-table";
import { Button } from "@/components/ui/button";
import React from "react";
import { Plus } from "lucide-react";

export default function Tasks() {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  return (
    <div className="w-full h-full flex-col space-y-8 pt-3">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Все тренировки</h2>
          <p className="text-muted-foreground">
            Список тренировок этого рабочего пространства
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="default"
            className="whitespace-nowrap"
            onClick={() => setIsTaskDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить тренировку
          </Button>
        </div>
      </div>
      <CreateTaskDialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen} />
      {/* {Task Table} */}
      <div>
        <TaskTable />
      </div>
    </div>
  );
}
