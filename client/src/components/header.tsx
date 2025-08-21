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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import BottomSheet from "@/components/ui/bottom-sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator as UiSeparator } from "@/components/ui/separator";
import { X, Plus, Maximize2, Minimize2, ChevronDown, Circle } from "lucide-react";
import { NavMain } from "@/components/asidebar/nav-main";
import { NavProjects } from "@/components/asidebar/nav-projects";
import { useState, useEffect } from "react";
import useCreateWorkspaceDialog from "@/hooks/use-create-workspace-dialog";
import CreateWorkspaceDialog from "@/components/workspace/create-workspace-dialog";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import CreateProjectDialog from "@/components/workspace/project/create-project-dialog";
// import { RefreshCcw, Maximize2, Minimize2, Plus } from "lucide-react";
// import { useEffect, useState } from "react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";
// import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
// import CreateProjectDialog from "@/components/workspace/project/create-project-dialog";
// import CreateTaskDialog from "@/components/workspace/task/create-task-dialog";
import { AnimatedUser } from "@/components/ui/motion/AnimatedUser";
import { useIsMobile } from "@/hooks/use-mobile";

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
    if (pathname.includes("/ai")) return "ИИ-ассистент";
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
  const isMobile = useIsMobile();
  
  // Состояния для полноэкранного режима и времени
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  });
  const [currentTimeDetailed, setCurrentTimeDetailed] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  });


  // useEffect для отслеживания полноэкранного режима
  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // useEffect для обновления времени
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit'
      }));
      setCurrentTimeDetailed(now.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Функция для переключения полноэкранного режима
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

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
          <div className="ml-2 flex items-center gap-2">
            {/* Время - всегда видимо */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center justify-center h-8 px-3 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 rounded-md transition-colors">
                  <div className="relative mr-2">
                    <Circle className="h-2 w-2 text-black animate-pulse" />
                    <div className="absolute inset-0 rounded-full bg-black opacity-10 animate-ping"></div>
                  </div>
                  {currentTime}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="start" side="bottom">
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
                    {currentTimeDetailed}
                  </div>
                  <div className="text-sm text-gray-600">
                    (GMT +3:00) Москва
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Десктопная версия - скрыта на мобильных */}
            <div className="hidden md:flex items-center gap-2">
              {/* Полноэкранный режим */}
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              {/* Кнопка - Добавить кнопку
              <Button variant="outline" size="sm">
                Добавить кнопку
              </Button> */}
            </div>

            {/* Мобильная версия - кнопка Еще */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    Еще
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* Полноэкранный режим */}
                  <DropdownMenuItem className="!cursor-pointer" onClick={toggleFullscreen}>
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4 mr-2" />
                    ) : (
                      <Maximize2 className="h-4 w-4 mr-2" />
                    )}
                    {isFullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
                  </DropdownMenuItem>
                  {/* Разделитель */}
                  <UiSeparator />
                  {/* Быстрый доступ */}
                  <DropdownMenuItem className="!cursor-pointer" onClick={() => setOpenMenuDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Быстрый доступ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Десктоп: диалог Быстрый доступ */}
            {!isMobile && (
              <Dialog open={openMenuDialog} onOpenChange={setOpenMenuDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="!cursor-pointer hidden md:inline-flex">
                    Быстрый доступ
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md w-full" hideCloseButton>
                  <div className="flex flex-col gap-3">
                    {/* Поиск + кнопка закрытия справа от инпута */}
                    <div className="flex items-center gap-2">
                      <Input placeholder="Поиск" className="flex-1" />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpenMenuDialog(false)}>
                        <X className="h-4 w-4" />
                      </Button>
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
                            <span>Создать новую Комнату</span>
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start gap-2"
                            onClick={() => {
                              setOpenMenuDialog(false);
                              navigate(`/workspace/${workspaceId}/members`);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            <span>Пригласить пользователей</span>
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
            )}

            {/* Мобильный BottomSheet для Быстрый доступ */}
            {isMobile && (
              <BottomSheet
                open={openMenuDialog}
                onOpenChange={setOpenMenuDialog}
              >
                <div className="flex flex-col gap-3">
                  {/* Поиск */}
                  <div className="mt-3 flex items-center gap-2">
                    <Input placeholder="Поиск" className="flex-1" />
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
                          <span>Создать новую Комнату</span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start gap-2"
                          onClick={() => {
                            setOpenMenuDialog(false);
                            navigate(`/workspace/${workspaceId}/members`);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          <span>Пригласить пользователей</span>
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
              </BottomSheet>
            )}
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
