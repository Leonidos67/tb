import BottomSheet from "@/components/ui/bottom-sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import CreateTaskForm from "./create-task-form";

const CreateTaskDialog = (props: { 
  projectId?: string; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date | null;
}) => {
  const { projectId, open, onOpenChange, selectedDate } = props;
  const isMobile = useIsMobile();
  const onClose = () => {
    onOpenChange(false);
  };
  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        className="pb-0"
      >
        <CreateTaskForm projectId={projectId} onClose={onClose} selectedDate={selectedDate} />
      </BottomSheet>
    );
  }
  return (
    <Dialog modal={true} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-auto my-5 border-0">
        <DialogHeader>
          <DialogTitle className="sr-only">Создание тренировки</DialogTitle>
        </DialogHeader>
        <CreateTaskForm projectId={projectId} onClose={onClose} selectedDate={selectedDate} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
