import { Dialog, DialogContent } from "@/components/ui/dialog";
import CreateTaskForm from "./create-task-form";

const CreateTaskDialog = (props: { projectId?: string; open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { projectId, open, onOpenChange } = props;
  const onClose = () => {
    onOpenChange(false);
  };
  return (
    <Dialog modal={true} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-auto my-5 border-0">
        <CreateTaskForm projectId={projectId} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
