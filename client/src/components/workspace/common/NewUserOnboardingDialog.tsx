import { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/auth-provider";
import { useTheme } from "@/context/theme-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { updateUserRoleMutationFn } from "@/lib/api";
import { Check, Circle } from "lucide-react";

interface NewUserOnboardingDialogProps {
  open: boolean;
  onClose: () => void;
  onFinish?: (answer: string) => void;
}

const options = [
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

const coachOptions = [
  { key: "1-10", label: "1 - 10" },
  { key: "11-25", label: "11 - 25" },
  { key: "26-50", label: "26 - 50" },
  { key: "51-100", label: "51 - 100" },
  { key: "101+", label: "101+" },
];

// Компонент выбора темы
const ThemeSelector = ({ selectedTheme, onThemeSelect }: { selectedTheme: string; onThemeSelect: (theme: string) => void }) => {
  return (
    <div className="flex flex-row flex-nowrap items-start gap-3 overflow-x-auto pb-1">
      {/* Светлая */}
      <button
        type="button"
        onClick={() => onThemeSelect('light')}
        className="group relative rounded-xl transition-colors text-left w-[160px]"
      >
        <div className="relative overflow-hidden rounded-xl bg-white border border-border" style={{ width: '160px', height: '80px' }}>
          <div className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-background/80 backdrop-blur p-1.5 shadow-sm">
            {selectedTheme === 'light' ? <Check className="h-3 w-3 text-primary" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
          </div>
        </div>
        <div className="px-2 py-2 text-center">
          <p className="text-sm font-medium">Светлая</p>
        </div>
      </button>

      {/* Темная */}
      <button
        type="button"
        onClick={() => onThemeSelect('dark')}
        className="group relative rounded-xl transition-colors text-left w-[160px]"
      >
        <div className="relative overflow-hidden rounded-xl bg-black border border-border" style={{ width: '160px', height: '80px' }}>
          <div className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-background/80 backdrop-blur p-1.5 shadow-sm">
            {selectedTheme === 'dark' ? <Check className="h-3 w-3 text-primary" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
          </div>
        </div>
        <div className="px-2 py-2 text-center">
          <p className="text-sm font-medium">Темная</p>
        </div>
      </button>
    </div>
  );
};


export default function NewUserOnboardingDialog({ open, onClose, onFinish }: NewUserOnboardingDialogProps) {
  const [step, setStep] = useState<number>(1);
  const [selected, setSelected] = useState<string>("");
  const [coachCount, setCoachCount] = useState<string>("");
  const [usageContext, setUsageContext] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { refetchAuth } = useAuthContext();
  const { theme: currentTheme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  // Инициализируем выбранную тему текущей активной темой
  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  // Мутация для обновления роли пользователя
  const updateUserRoleMutation = useMutation({
    mutationFn: updateUserRoleMutationFn,
    onSuccess: () => {
      // Обновляем данные пользователя
      refetchAuth();
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      toast({
        title: "Уведомление",
        description: "Ваша роль была обновлена",
      });
    },
    onError: (error) => {
      toast({
        title: "Уведомление",
        description: error.message || "Не удалось обновить роль пользователя",
        variant: "destructive",
      });
    },
  });

  const handleRoleSelect = (key: string) => {
    setUsageContext(key);
    setSelected(key);
    if (key === "team") {
      setStep(2);
    } else if (key === "solo") {
      setStep(3);
    }
  };

  const handleContinue = () => {
    if (usageContext === "team") {
      setStep(3);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Обновляем роль пользователя на сервере
      if (usageContext === "team") {
        await updateUserRoleMutation.mutateAsync("coach");
      } else if (usageContext === "solo") {
        await updateUserRoleMutation.mutateAsync("athlete");
      }
      
      if (onFinish) {
        if (usageContext === "team") {
          await onFinish(coachCount || "coach");
        } else if (usageContext === "solo") {
          await onFinish("athlete");
        }
      }
      onClose();
    } catch (error) {
      console.error("Ошибка при завершении онбординга:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setUsageContext("");
      setSelected("");
      setCoachCount("");
    } else if (step === 3) {
      if (usageContext === "team") {
        setStep(2);
      } else {
        setStep(1);
        setUsageContext("");
        setSelected("");
      }
    } else if (step === 4) {
      setStep(3);
    }
  };

  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
    // Сразу применяем тему при выборе
    setTheme(theme as 'light' | 'dark');
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
              "z-50 relative grid w-full max-w-lg gap-4 bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg md:w-full pb-5",
            )}
          >
            {step === 1 && (
              <>
                <DialogHeader>
                  <DialogTitle className="onboarding-title">Как вы будете использовать сервис?</DialogTitle>
                  <DialogDescription className="onboarding-description">
                    Эти ответы помогут вам персонализировать свою работу
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 mt-4">
                  {options.map(option => (
                    <button
                      key={option.key}
                      className={`onboarding-option border rounded px-4 py-2 text-left transition-colors ${selected === option.key ? 'selected border-ring bg-accent' : 'border-border hover:bg-accent'}`}
                      onClick={() => handleRoleSelect(option.key)}
                      disabled={loading}
                    >
                      <div className="font-semibold">{option.title}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 2 && usageContext === "team" && (
              <>
                <DialogHeader>
                  <DialogTitle className="onboarding-title">Какое количество спортсменов вы тренируете?</DialogTitle>
                  <DialogDescription className="onboarding-description">
                    Эти ответы помогут вам персонализировать свою работу
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 mt-4">
                  {coachOptions.map(opt => (
                    <button
                      key={opt.key}
                      className={`onboarding-option border rounded px-4 py-2 text-left transition-colors ${coachCount === opt.key ? 'selected border-ring bg-accent' : 'border-border hover:bg-accent'}`}
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
                  <Button onClick={handleContinue} disabled={!coachCount || loading}>
                    Продолжить
                  </Button>
                </DialogFooter>
              </>
            )}
            {step === 3 && usageContext === "team" && (
              <>
                <DialogHeader>
                  <DialogTitle className="onboarding-title">Выберите тему оформления</DialogTitle>
                  <DialogDescription className="onboarding-description">
                    Выберите, как будет выглядеть T-Sync
                  </DialogDescription>
                </DialogHeader>
                <ThemeSelector 
                  selectedTheme={selectedTheme} 
                  onThemeSelect={handleThemeSelect} 
                />
                <DialogFooter>
                  <Button variant="outline" onClick={handleBack} disabled={loading}>
                    Назад
                  </Button>
                  <Button onClick={() => setStep(4)} disabled={loading}>
                    Продолжить
                  </Button>
                </DialogFooter>
              </>
            )}
            {step === 4 && usageContext === "team" && (
              <>
                <DialogHeader>
                  <DialogTitle className="onboarding-title">Отлично!</DialogTitle>
                  <DialogDescription className="onboarding-description">
                    Ваш профиль настроен для работы с командой
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-6 onboarding-empty-block">
                  {/* Пустой блок */}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleBack} disabled={loading}>
                    Назад
                  </Button>
                  <Button onClick={handleFinish} disabled={loading}>
                    Завершить
                  </Button>
                </DialogFooter>
              </>
            )}
            {step === 3 && usageContext === "solo" && (
              <>
                <DialogHeader>
                  <DialogTitle className="onboarding-title">Выберите тему оформления</DialogTitle>
                  <DialogDescription className="onboarding-description">
                    Выберите, как будет выглядеть T-Sync
                  </DialogDescription>
                </DialogHeader>
                <ThemeSelector 
                  selectedTheme={selectedTheme} 
                  onThemeSelect={handleThemeSelect} 
                />
                <DialogFooter>
                  <Button variant="outline" onClick={handleBack} disabled={loading}>
                    Назад
                  </Button>
                  <Button onClick={handleFinish} disabled={loading}>
                    Завершить
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