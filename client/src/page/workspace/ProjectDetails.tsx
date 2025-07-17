import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import ProjectAnalytics from "@/components/workspace/project/project-analytics";
import ProjectHeader from "@/components/workspace/project/project-header";
import TaskTable from "@/components/workspace/task/task-table";
import CreateTaskDialog from "@/components/workspace/task/create-task-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useParams } from "react-router-dom";

const ProjectDetails = () => {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const { projectId } = useParams();

  return (
    <div className="w-full space-y-6 py-4 md:pt-3">
      <div className="flex items-center justify-between">
        <ProjectHeader />
        <Button
          variant="default"
          className="whitespace-nowrap"
          onClick={() => setIsTaskDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить тренировку
        </Button>
        <CreateTaskDialog projectId={projectId} open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen} />
      </div>
      <div className="space-y-5">
        <ProjectAnalytics />
        <Separator />
        <TaskTable />
      </div>
    </div>
  );
};

export default ProjectDetails;
