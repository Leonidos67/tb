import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NewUserOnboardingDialogProps {
  open: boolean;
  onClose: () => void;
  onFinish?: (answer: string) => void;
}

const options = [
  {
    key: "coach",
    title: "Я - Тренер",
    description: "Уже имеется своя команда",
  },
  {
    key: "athlete",
    title: "Я - Спортсмен",
    description: "У меня уже есть тренер/Я ищу себе тренера",
  },
];

export default function NewUserOnboardingDialog({ open, onClose, onFinish }: NewUserOnboardingDialogProps) {
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      if (onFinish) await onFinish(selected);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent hideCloseButton preventCloseOnOutsideClick>
        <DialogHeader>
          <DialogTitle>Как вы планируете использовать T-Sync?</DialogTitle>
          <DialogDescription>
            Это поможет нам сделать сервис лучше для вас.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          {options.map(option => (
            <button
              key={option.key}
              className={`border rounded px-4 py-2 text-left transition-colors ${selected === option.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setSelected(option.key)}
              disabled={loading}
            >
              <div className="font-semibold">{option.title}</div>
              <div className="text-sm text-gray-500">{option.description}</div>
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleFinish} disabled={!selected || loading}>
            {"Продолжить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 