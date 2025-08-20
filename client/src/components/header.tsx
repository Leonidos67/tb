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
import { Link, useLocation, useNavigate } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator as UiSeparator } from "@/components/ui/separator";
import { X, Plus } from "lucide-react";
import { NavMain } from "@/components/asidebar/nav-main";
import { NavProjects } from "@/components/asidebar/nav-projects";
import { useState } from "react";
import useCreateWorkspaceDialog from "@/hooks/use-create-workspace-dialog";
import CreateWorkspaceDialog from "@/components/workspace/create-workspace-dialog";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import CreateProjectDialog from "@/components/workspace/project/create-project-dialog";
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
import { AnimatedUser } from "@/components/ui/motion/AnimatedUser";
import { AnimatedUsers } from "@/components/ui/motion/AnimatedUsers";
import { AnimatedBolt } from "@/components/ui/motion/AnimatedBolt";

const Header = () => {
  const location = useLocation();
  const workspaceId = useWorkspaceId();
  const { user } = useAuthContext();

  const pathname = location.pathname;
  const isCoach = user?.userRole === "coach";

  const getPageLabel = (pathname: string) => {
    if (pathname.includes("/project/")) return isCoach ? "Комната" : "Тренировка";
    if (pathname.includes("/settings")) return "Настройки";
    if (pathname.includes("/tasks")) return "Все тренировки";
    if (pathname.includes("/members")) return isCoach ? "Мои спортсмены" : "Участники";
    if (pathname.includes("/profile")) return "Мои данные";
    if (pathname.includes("/completed")) return "Выполненные тренировки";
    if (pathname.includes("/user-guide")) return "Руководство по использованию";
    if (pathname.includes("/general-settings")) return "Генеральные настройки";
    if (pathname.includes("/create-website")) return "Создание сайта";
    if (pathname.includes("/ai")) return "Ai-ассистент";
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

  const [openMenuDialog, setOpenMenuDialog] = useState(false);
  const { onOpen: onOpenWorkspaceDialog } = useCreateWorkspaceDialog();
  const { onOpen: onOpenProjectDialog } = useCreateProjectDialog();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"quick" | "pages" | "rooms">("quick");

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
              <BreadcrumbItem className="text-[15px]">
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
                  <BreadcrumbSeparator />
                  <BreadcrumbItem className="text-[15px]">
                    <BreadcrumbPage className="line-clamp-1">
                      {pageHeading}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          {/* Кнопка Меню команд и модалка */}
          <div className="ml-2">
            <Dialog open={openMenuDialog} onOpenChange={setOpenMenuDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Меню команд
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-full" hideCloseButton>
                <div className="flex flex-col gap-3">
                  {/* Поиск + закрыть */}
                  <div className="flex items-center gap-2">
                    <Input placeholder="Поиск" className="flex-1" />
                    <DialogClose asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-4 w-4" />
                      </Button>
                    </DialogClose>
                  </div>

                  {/* Категории */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={activeTab === "quick" ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("quick")}
                    >
                      Быстрые команды
                    </Button>
                    <Button
                      variant={activeTab === "pages" ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("pages")}
                    >
                      Страницы
                    </Button>
                    <Button
                      variant={activeTab === "rooms" ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("rooms")}
                    >
                      Комнаты
                    </Button>
                  </div>

                  {/* Контент вкладок */}
                  {activeTab === "quick" && (
                    <div className="flex flex-col gap-2">
                      {/* Действия создания */}
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          className="justify-start gap-2"
                          onClick={() => {
                            setOpenMenuDialog(false);
                            onOpenWorkspaceDialog();
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          <span>Создать новую Рабочую Зону</span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start gap-2"
                          onClick={() => {
                            setOpenMenuDialog(false);
                            onOpenProjectDialog();
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          <span>Создать новую комнату</span>
                        </Button>
                      </div>

                      <UiSeparator />

                      {/* Навигация */}
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          className="justify-start gap-2"
                          onClick={() => {
                            setOpenMenuDialog(false);
                            navigate(`/workspace/${workspaceId}/profile`);
                          }}
                        >
                          <AnimatedUser />
                          <span>Мой профиль</span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start gap-2"
                          onClick={() => {
                            setOpenMenuDialog(false);
                            navigate(`/workspace/${workspaceId}/general-settings`);
                          }}
                        >
                          <AnimatedBolt />
                          <span>Профиль команды</span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start gap-2"
                          onClick={() => {
                            setOpenMenuDialog(false);
                            navigate(`/workspace/${workspaceId}/members`);
                          }}
                        >
                          <AnimatedUsers />
                          <span>Пригласить пользователей</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {activeTab === "pages" && (
                    <div className="flex flex-col gap-2 !p-0">
                      <NavMain compact onItemClick={() => setOpenMenuDialog(false)} />
                    </div>
                  )}

                  {activeTab === "rooms" && (
                    <div className="flex flex-col gap-2 !p-0">
                      <NavProjects compact onItemClick={() => setOpenMenuDialog(false)} />
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            {/* Диалоги для создания */}
            <CreateWorkspaceDialog />
            <CreateProjectDialog />
          </div>
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
