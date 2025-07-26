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
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

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
    description: "У меня уже есть тренер/Ищу себе тренера",
  },
];

const athleteInfo = (
  <div className="mt-0 text-base text-gray-700">
    Тренер должен прислать вам вступительную ссылку-приглашение
  </div>
);

const coachOptions = [
  { key: "1-20", label: "1 - 20" },
  { key: "21-50", label: "21 - 50" },
  { key: "50-200", label: "50 - 200" },
  { key: "200+", label: "200+" },
];

const usageContextOptions = [
  {
    key: "team",
    title: "С моей командой",
    description: "Вместе фокусироваться на задачах, вести заметки и планы, ставить цели и обсуждать тренировки.",
  },
  {
    key: "solo",
    title: "Один",
    description: "Управлять личными результатами и тренировками, вести дневник и отслеживать прогресс.",
  },
];


export default function NewUserOnboardingDialog({ open, onClose, onFinish }: NewUserOnboardingDialogProps) {
  const [step, setStep] = useState<number>(1);
  const [selected, setSelected] = useState<string>("");
  const [coachCount, setCoachCount] = useState<string>("");
  const [usageContext, setUsageContext] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>("");

  const handleRoleSelect = (key: string) => {
    setRole(key);
    setSelected(key);
    if (key === "coach") {
      setStep(2);
    } else if (key === "athlete") {
      setStep(2);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (role === "coach" && onFinish) await onFinish(usageContext || coachCount || "coach");
      else if (role === "athlete" && onFinish) await onFinish("athlete");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setRole("");
      setSelected("");
      setCoachCount("");
    } else if (step === 3) {
      setStep(2);
      setUsageContext("");
    }
  };

  return (
    <Dialog open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-muted bg-cover bg-center bg-no-repeat data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 overflow-y-auto max-h-screen grid place-items-center",
          )}
        >
          <DialogPrimitive.Content
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
            onEscapeKeyDown={(e) => {
              e.preventDefault();
            }}
            className={cn(
              "z-50 relative grid w-full max-w-lg gap-4 bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg md:w-full",
            )}
          >
            {step === 1 && (
              <>
                <DialogHeader>
                  <DialogTitle>Как вы планируете использовать T-Sync?</DialogTitle>
                  <DialogDescription>
                    Эти ответы помогут вам персонализировать свою работу
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 mt-4">
                  {options.map(option => (
                    <button
                      key={option.key}
                      className={`border rounded px-4 py-2 text-left transition-colors ${selected === option.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                      onClick={() => handleRoleSelect(option.key)}
                      disabled={loading}
                    >
                      <div className="font-semibold">{option.title}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 2 && role === "coach" && (
              <>
                <DialogHeader>
                  <DialogTitle>Какое количество спортсменов вы тренируете?</DialogTitle>
                  <DialogDescription>
                    Эти ответы помогут вам персонализировать свою работу
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 mt-4">
                  {coachOptions.map(opt => (
                    <button
                      key={opt.key}
                      className={`border rounded px-4 py-2 text-left transition-colors ${coachCount === opt.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                      onClick={() => setCoachCount(opt.key)}
                      disabled={loading}
                    >
                      <div className="font-semibold">{opt.label}</div>
                    </button>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleBack} disabled={loading}>
                    Назад
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!coachCount || loading}>
                    Продолжить
                  </Button>
                </DialogFooter>
              </>
            )}
            {step === 2 && role === "athlete" && (
              <>
                <DialogHeader>
                  <DialogTitle>Вам нужно получить приглашение</DialogTitle>
                </DialogHeader>
                {athleteInfo}
                {/* <DialogFooter>
                  <Button variant="outline" onClick={handleBack} disabled={loading}>
                    Назад
                  </Button>
                  <Button onClick={handleFinish} disabled={loading}>
                    Понятно
                  </Button>
                </DialogFooter> */}
              </>
            )}
            {step === 3 && role === "coach" && (
              <>
                <DialogHeader>
                  <DialogTitle>Как вы будете использовать сервис?</DialogTitle>
                  <DialogDescription>
                    Эти ответы помогут вам персонализировать свою работу
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 mt-4">
                  {usageContextOptions.map(option => (
                    <button
                      key={option.key}
                      className={`border rounded px-4 py-2 text-left transition-colors ${usageContext === option.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                      onClick={() => setUsageContext(option.key)}
                      disabled={loading}
                    >
                      <div className="font-semibold">{option.title}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </button>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleBack} disabled={loading}>
                    Назад
                  </Button>
                  <Button onClick={handleFinish} disabled={!usageContext || loading}> 
                    Продолжить
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </Dialog>
  );
} 