import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "./ui/separator";
import { Link, useLocation } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
// import { RefreshCcw, Maximize2, Minimize2, Plus } from "lucide-react";
// import { useEffect, useState } from "react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
// } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";
// import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
// import CreateProjectDialog from "@/components/workspace/project/create-project-dialog";
// import CreateTaskDialog from "@/components/workspace/task/create-task-dialog";

const Header = () => {
  const location = useLocation();
  const workspaceId = useWorkspaceId();

  const pathname = location.pathname;

  const getPageLabel = (pathname: string) => {
    if (pathname.includes("/project/")) return "Комната";
    if (pathname.includes("/settings")) return "Настройки";
    if (pathname.includes("/tasks")) return "Все тренировки";
    if (pathname.includes("/members")) return "Участники";
    if (pathname.includes("/profile")) return "Мой профиль";
    if (pathname.includes("/completed")) return "Выполненные тренировки";
    return null; // Default label
  };

  const pageHeading = getPageLabel(pathname);
  // const [isFullscreen, setIsFullscreen] = useState(false);
  // const [time, setTime] = useState(() => {
  //   const now = new Date();
  //   return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  // });
  // const [openTimeDialog, setOpenTimeDialog] = useState(false);

  // Для диалога создания тренировки
  // const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  // // Для диалога создания комнаты
  // const { onOpen: onOpenProjectDialog } = useCreateProjectDialog();

  // useEffect(() => {
  //   function handleFullscreenChange() {
  //     setIsFullscreen(!!document.fullscreenElement);
  //   }
  //   document.addEventListener("fullscreenchange", handleFullscreenChange);
  //   return () => {
  //     document.removeEventListener("fullscreenchange", handleFullscreenChange);
  //   };
  // }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const now = new Date();
  //     setTime(now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'));
  //   }, 1000 * 10); // обновлять каждые 10 секунд для надежности
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <header className="flex sticky top-0 z-50 bg-white h-12 shrink-0 items-center border-b">
      <div className="flex flex-1 items-center gap-2 px-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center w-full justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block text-[15px]">
                {pageHeading ? (
                  <BreadcrumbLink asChild>
                    <Link to={`/workspace/${workspaceId}`}>Главная</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="line-clamp-1 ">
                    Главная
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>

              {pageHeading && (
                <>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem className="text-[15px]">
                    <BreadcrumbPage className="line-clamp-1">
                      {pageHeading}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          {/* <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              title="Обновить страницу"
              onClick={() => window.location.reload()}
              className="p-1 hover:bg-muted rounded"
            >
              <RefreshCcw size={16} />
            </button>
            <button
              type="button"
              title={isFullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
              onClick={() => {
                if (isFullscreen) {
                  if (document.exitFullscreen) {
                    document.exitFullscreen();
                  }
                } else {
                  if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                  }
                }
              }}
              className="p-1 hover:bg-muted rounded"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="min-w-[48px] text-right font-mono text-[15px] text-foreground select-none cursor-pointer p-1 rounded hover:bg-muted transition-colors"
                  type="button"
                >
                  {time}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col items-start py-2 px-2">
                  <div className="text-lg font-mono font-semibold mb-1">{time}</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
                  </div>
                  <div
                    className="flex items-center justify-between text-sm text-muted-foreground cursor-not-allowed select-none transition-colors hover:bg-accent w-full px-2 py-1 rounded mt-1"
                  >
                    <span className="pr-2">Часовой пояс</span>
                    <span className="text-foreground font-semibold">мск</span>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={openTimeDialog} onOpenChange={setOpenTimeDialog}>
              <DialogContent className="w-64 mt-2 p-4">
                <div className="text-center text-lg font-semibold">Текущее время</div>
                <div className="text-center text-2xl mt-2 font-mono">{time}</div>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="!cursor-pointer" onClick={onOpenProjectDialog}>
                  Новая комната
                </DropdownMenuItem>
                <DropdownMenuItem className="!cursor-pointer" onClick={() => setIsTaskDialogOpen(true)}>
                  Новая тренировка
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <CreateProjectDialog />
            <CreateTaskDialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen} />
          </div> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
