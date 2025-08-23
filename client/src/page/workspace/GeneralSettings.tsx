import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EyeOff, Eye, ChevronDown as ChevronDownIcon, Check, Circle } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/theme-provider";

const GeneralSettings = () => {
  const [isWorkspaceInfoVisible, setIsWorkspaceInfoVisible] = useState(true);
  const [isSecurityVisible, setIsSecurityVisible] = useState(true);
  const [isSystemViewVisible, setIsSystemViewVisible] = useState(true);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(true);

  // Состояние для уведомлений
  const [newTasksNotifications, setNewTasksNotifications] = useState(true);
  const [taskUpdatesNotifications, setTaskUpdatesNotifications] = useState(true);
  const [projectUpdatesNotifications, setProjectUpdatesNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [desktopCommentsNotifications, setDesktopCommentsNotifications] = useState(false);
  const [desktopMeetingNotifications, setDesktopMeetingNotifications] = useState(false);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [workspaceActivityEmails, setWorkspaceActivityEmails] = useState(true);
  const [alwaysSendEmails, setAlwaysSendEmails] = useState(false);
  const [pageUpdatesEmails, setPageUpdatesEmails] = useState(true);
  const [workspaceDigestEmails, setWorkspaceDigestEmails] = useState(true);
  const [announcementsEmails, setAnnouncementsEmails] = useState(false);
  
  // Используем глобальный провайдер темы
  const { theme, setTheme } = useTheme();

  // Функция для переключения темы
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  // Функции для переключения видимости блоков
  const handleToggleWorkspaceInfo = () => {
    const newState = !isWorkspaceInfoVisible;
    setIsWorkspaceInfoVisible(newState);
    localStorage.setItem('general-settings-workspace-info-visible', JSON.stringify(newState));
  };

  const handleToggleSecurity = () => {
    const newState = !isSecurityVisible;
    setIsSecurityVisible(newState);
    localStorage.setItem('general-settings-security-visible', JSON.stringify(newState));
  };

  const handleToggleSystemView = () => {
    const newState = !isSystemViewVisible;
    setIsSystemViewVisible(newState);
    localStorage.setItem('general-settings-system-view-visible', JSON.stringify(newState));
  };

  const handleToggleNotifications = () => {
    const newState = !isNotificationsVisible;
    setIsNotificationsVisible(newState);
    localStorage.setItem('general-settings-notifications-visible', JSON.stringify(newState));
  };

  // Функции для сохранения состояния уведомлений
  const handleNewTasksChange = (checked: boolean) => {
    setNewTasksNotifications(checked);
    localStorage.setItem('general-settings-new-tasks-notifications', JSON.stringify(checked));
  };

  const handleTaskUpdatesChange = (checked: boolean) => {
    setTaskUpdatesNotifications(checked);
    localStorage.setItem('general-settings-task-updates-notifications', JSON.stringify(checked));
  };

  const handleProjectUpdatesChange = (checked: boolean) => {
    setProjectUpdatesNotifications(checked);
    localStorage.setItem('general-settings-project-updates-notifications', JSON.stringify(checked));
  };

  const handlePushNotificationsChange = (checked: boolean) => {
    setPushNotifications(checked);
    localStorage.setItem('general-settings-push-notifications', JSON.stringify(checked));
  };

  const handleDesktopCommentsChange = (checked: boolean) => {
    setDesktopCommentsNotifications(checked);
    localStorage.setItem('general-settings-desktop-comments-notifications', JSON.stringify(checked));
  };

  const handleDesktopMeetingsChange = (checked: boolean) => {
    setDesktopMeetingNotifications(checked);
    localStorage.setItem('general-settings-desktop-meeting-notifications', JSON.stringify(checked));
  };

  const handleSlackChange = (checked: boolean) => {
    setSlackNotifications(checked);
    localStorage.setItem('general-settings-slack-notifications', JSON.stringify(checked));
  };

  const handleWorkspaceActivityChange = (checked: boolean) => {
    setWorkspaceActivityEmails(checked);
    localStorage.setItem('general-settings-workspace-activity-emails', JSON.stringify(checked));
  };

  const handleAlwaysSendEmailsChange = (checked: boolean) => {
    setAlwaysSendEmails(checked);
    localStorage.setItem('general-settings-always-send-emails', JSON.stringify(checked));
  };

  const handlePageUpdatesChange = (checked: boolean) => {
    setPageUpdatesEmails(checked);
    localStorage.setItem('general-settings-page-updates-emails', JSON.stringify(checked));
  };

  const handleWorkspaceDigestChange = (checked: boolean) => {
    setWorkspaceDigestEmails(checked);
    localStorage.setItem('general-settings-workspace-digest-emails', JSON.stringify(checked));
  };

  const handleAnnouncementsChange = (checked: boolean) => {
    setAnnouncementsEmails(checked);
    localStorage.setItem('general-settings-announcements-emails', JSON.stringify(checked));
  };

  // Загружаем состояние из localStorage при монтировании
  useEffect(() => {
    const savedWorkspaceInfo = localStorage.getItem('general-settings-workspace-info-visible');
    const savedSecurity = localStorage.getItem('general-settings-security-visible');
    const savedSystemView = localStorage.getItem('general-settings-system-view-visible');
    const savedNotifications = localStorage.getItem('general-settings-notifications-visible');
    
    if (savedWorkspaceInfo !== null) {
      setIsWorkspaceInfoVisible(JSON.parse(savedWorkspaceInfo));
    }
    if (savedSecurity !== null) {
      setIsSecurityVisible(JSON.parse(savedSecurity));
    }
    if (savedSystemView !== null) {
      setIsSystemViewVisible(JSON.parse(savedSystemView));
    }
    if (savedNotifications !== null) {
      setIsNotificationsVisible(JSON.parse(savedNotifications));
    }

    // Загружаем состояние уведомлений
    const savedNewTasks = localStorage.getItem('general-settings-new-tasks-notifications');
    const savedTaskUpdates = localStorage.getItem('general-settings-task-updates-notifications');
    const savedProjectUpdates = localStorage.getItem('general-settings-project-updates-notifications');
    const savedPushNotifications = localStorage.getItem('general-settings-push-notifications');
    const savedDesktopComments = localStorage.getItem('general-settings-desktop-comments-notifications');
    const savedDesktopMeetings = localStorage.getItem('general-settings-desktop-meeting-notifications');
    const savedSlack = localStorage.getItem('general-settings-slack-notifications');
    const savedWorkspaceActivity = localStorage.getItem('general-settings-workspace-activity-emails');
    const savedAlwaysSendEmails = localStorage.getItem('general-settings-always-send-emails');
    const savedPageUpdates = localStorage.getItem('general-settings-page-updates-emails');
    const savedWorkspaceDigest = localStorage.getItem('general-settings-workspace-digest-emails');
    const savedAnnouncements = localStorage.getItem('general-settings-announcements-emails');
    
    if (savedNewTasks !== null) setNewTasksNotifications(JSON.parse(savedNewTasks));
    if (savedTaskUpdates !== null) setTaskUpdatesNotifications(JSON.parse(savedTaskUpdates));
    if (savedProjectUpdates !== null) setProjectUpdatesNotifications(JSON.parse(savedProjectUpdates));
    if (savedPushNotifications !== null) setPushNotifications(JSON.parse(savedPushNotifications));
    if (savedDesktopComments !== null) setDesktopCommentsNotifications(JSON.parse(savedDesktopComments));
    if (savedDesktopMeetings !== null) setDesktopMeetingNotifications(JSON.parse(savedDesktopMeetings));
    if (savedSlack !== null) setSlackNotifications(JSON.parse(savedSlack));
    if (savedWorkspaceActivity !== null) setWorkspaceActivityEmails(JSON.parse(savedWorkspaceActivity));
    if (savedAlwaysSendEmails !== null) setAlwaysSendEmails(JSON.parse(savedAlwaysSendEmails));
    if (savedPageUpdates !== null) setPageUpdatesEmails(JSON.parse(savedPageUpdates));
    if (savedWorkspaceDigest !== null) setWorkspaceDigestEmails(JSON.parse(savedWorkspaceDigest));
    if (savedAnnouncements !== null) setAnnouncementsEmails(JSON.parse(savedAnnouncements));
  }, []);

  return (
    <div className="page-container space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Общие настройки</h1>
        <p className="text-muted-foreground">
          Управляйте основными настройками вашего рабочего пространства
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Текущая тема:</span>
          <Badge variant="outline" className="capitalize">
            {theme === 'light' ? 'Светлая' : 'Темная'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">

      <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 sm:pb-6">
            <div>
              <CardTitle>Системные настройки</CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleSystemView}
              aria-label={isSystemViewVisible ? "Скрыть блок" : "Показать блок"}
            >
              {isSystemViewVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </CardHeader>
          {isSystemViewVisible && (
            <CardContent className="space-y-6">
              {/* Часовой пояс */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="timezone" className="!cursor-pointer">Часовой пояс</Label>
                    <p className="text-sm text-muted-foreground">
                      Напоминания и уведомления будут доставляться в зависимости от вашего часового пояса.
                    </p>
                  </div>
                  <Button disabled variant="outline" className="w-full sm:w-[180px] opacity-60 px-3 py-2" style={{ cursor: 'default' }}>
                    <span className="text-sm font-medium truncate">(GMT +3:00) Москва</span>
                    <ChevronDownIcon className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
                  </Button>
                </div>
              </div>

              {/* Внешний вид */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium !cursor-pointer">Внешний вид</Label>
                    <p className="text-sm text-muted-foreground">
                      Настройте дизайн T-Sync на вашем устройстве
                    </p>
                  </div>
                </div>

                {/* Выбор темы: 3 горизонтальных блока */}
                <div className="flex flex-row flex-nowrap items-start gap-3 overflow-x-auto pb-1">
                  {/* Светлая */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    className="group relative rounded-xl transition-colors text-left w-[200px]"
                  >
                    <div className="relative overflow-hidden rounded-xl bg-white border border-border" style={{ width: '200px', height: '100px' }}>
                      <div className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-background/80 backdrop-blur p-1.5 shadow-sm">
                        {theme === 'light' ? <Check className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                    <div className="px-3 py-2 text-center">
                      <p className="text-sm font-medium">Светлая</p>
                    </div>
                  </button>

                  {/* Темная */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    className="group relative rounded-xl transition-colors text-left w-[200px]"
                  >
                    <div className="relative overflow-hidden rounded-xl bg-black border border-border" style={{ width: '200px', height: '100px' }}>
                      <div className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-background/80 backdrop-blur p-1.5 shadow-sm">
                        {theme === 'dark' ? <Check className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                    <div className="px-3 py-2 text-center">
                      <p className="text-sm font-medium">Темная</p>
                    </div>
                  </button>

                </div>
              </div>

              <Separator />

              {/* Язык */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium !cursor-pointer">Язык</Label>
                    <p className="text-sm text-muted-foreground">
                      Выберите язык, используемый в пользовательском интерфейсе.
                    </p>
                  </div>
                  <Button disabled variant="outline" className="w-full sm:w-[180px] opacity-60 px-3 py-2 flex items-center justify-between" style={{ cursor: 'default' }}>
                    <span className="text-sm font-medium truncate">ru</span>
                    <ChevronDownIcon className="h-4 w-4 opacity-50 flex-shrink-0" />
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>Информация о рабочем пространстве</span>
                <Badge variant="secondary">Основное</Badge>
              </CardTitle>
              <CardDescription>
                Основная информация о вашем рабочем пространстве
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleWorkspaceInfo}
              aria-label={isWorkspaceInfoVisible ? "Скрыть блок" : "Показать блок"}
            >
              {isWorkspaceInfoVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </CardHeader>
          {isWorkspaceInfoVisible && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Название</label>
                  <p className="text-sm text-muted-foreground">T-Sync Workspace</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Описание</label>
                  <p className="text-sm text-muted-foreground">Рабочее пространство для управления тренировками</p>
                </div>
              </div>

              <Separator />

              {/* Slack уведомления */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="slack-notifications" className="text-base font-medium">Уведомления Slack</Label>
                    <p className="text-sm text-muted-foreground">
                      Получайте уведомления в своем рабочем пространстве Slack, когда вас упоминают на странице, в свойствах базы данных или в комментариях
                    </p>
                  </div>
                  <Switch 
                    id="slack-notifications" 
                    checked={slackNotifications}
                    onCheckedChange={handleSlackChange}
                  />
                </div>
              </div>

              <Separator />

              {/* Дополнительные email уведомления */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="workspace-activity" className="text-base font-medium">Активность в вашем рабочем пространстве</Label>
                    <p className="text-sm text-muted-foreground">
                      Получайте электронные письма, когда вы получаете комментарии, упоминания, приглашения на страницу, напоминания, запросы на доступ и изменения свойств
                    </p>
                  </div>
                  <Switch 
                    id="workspace-activity" 
                    checked={workspaceActivityEmails}
                    onCheckedChange={handleWorkspaceActivityChange}
                  />
                </div>

                <div className="ml-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="always-send-emails">Всегда отправляйте уведомления по электронной почте</Label>
                      <p className="text-sm text-muted-foreground">
                        Получайте электронные письма об активности в вашем рабочем пространстве, даже если вы активны в приложении
                      </p>
                    </div>
                    <Switch 
                      id="always-send-emails" 
                      checked={alwaysSendEmails}
                      onCheckedChange={handleAlwaysSendEmailsChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="page-updates">Обновления страниц</Label>
                      <p className="text-sm text-muted-foreground">
                        Получайте по электронной почте сводки об изменениях на страницах, на которые вы подписаны
                      </p>
                    </div>
                    <Switch 
                      id="page-updates" 
                      checked={pageUpdatesEmails}
                      onCheckedChange={handlePageUpdatesChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="workspace-digest">Сводки о рабочем пространстве</Label>
                      <p className="text-sm text-muted-foreground">
                        Получайте по электронной почте сводки о том, что происходит в вашем рабочем пространстве
                      </p>
                    </div>
                    <Switch 
                      id="workspace-digest" 
                      checked={workspaceDigestEmails}
                      onCheckedChange={handleWorkspaceDigestChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="announcements">Объявления и электронные письма с обновлениями</Label>
                      <p className="text-sm text-muted-foreground">
                        Время от времени получайте электронные письма о запуске продукта и новых функциях от Notion
                      </p>
                    </div>
                    <Switch 
                      id="announcements" 
                      checked={announcementsEmails}
                      onCheckedChange={handleAnnouncementsChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Настройки безопасности</CardTitle>
              <CardDescription>
                Управляйте безопасностью и доступом к рабочему пространству
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleSecurity}
              aria-label={isSecurityVisible ? "Скрыть блок" : "Показать блок"}
            >
              {isSecurityVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </CardHeader>
          {isSecurityVisible && (
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Настройки безопасности будут доступны в ближайшее время
              </p>
            </CardContent>
          )}
        </Card>

        {/* Блок уведомлений */}
        <Card className="mb-5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 sm:pb-6">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>Уведомления</span>
              </CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleNotifications}
              aria-label={isNotificationsVisible ? "Скрыть блок" : "Показать блок"}
            >
              {isNotificationsVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </CardHeader>
          {isNotificationsVisible && (
            <CardContent className="space-y-6">
              {/* Рабочий стол */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="text-base font-medium !cursor-auto">Рабочий стол</Label>
                  </div>
                </div>
                
                <div className="space-y-4 ml-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-tasks" className="!cursor-pointer">Новые задачи</Label>
                      <p className="text-sm text-muted-foreground">
                        Уведомления о новых задачах в проектах
                      </p>
                    </div>
                    <Switch 
                      id="new-tasks" 
                      checked={newTasksNotifications}
                      onCheckedChange={handleNewTasksChange}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="task-updates" className="!cursor-pointer">Обновления задач</Label>
                      <p className="text-sm text-muted-foreground">
                        Уведомления об изменениях в задачах
                      </p>
                    </div>
                    <Switch 
                      id="task-updates" 
                      checked={taskUpdatesNotifications}
                      onCheckedChange={handleTaskUpdatesChange}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="project-updates" className="!cursor-pointer">Обновления проектов</Label>
                      <p className="text-sm text-muted-foreground">
                        Уведомления об изменениях в проектах
                      </p>
                    </div>
                    <Switch 
                      id="project-updates" 
                      checked={projectUpdatesNotifications}
                      onCheckedChange={handleProjectUpdatesChange}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Push уведомления */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications" className="text-base font-medium">Push уведомления</Label>
                    <p className="text-sm text-muted-foreground">
                      Настройте push уведомления в браузере
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 ml-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications-toggle" className="!cursor-pointer">Включить push уведомления</Label>
                      <p className="text-sm text-muted-foreground">
                        Получайте уведомления даже когда вкладка не активна
                      </p>
                    </div>
                    <Switch 
                      id="push-notifications-toggle" 
                      checked={pushNotifications}
                      onCheckedChange={handlePushNotificationsChange}
                    />
                  </div>

                  {/* Desktop уведомления показываются только когда включены push уведомления */}
                  {pushNotifications && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="desktop-comments" className="!cursor-pointer">Уведомления о комментариях и упоминаниях на рабочем столе</Label>
                          <p className="text-sm text-muted-foreground">
                            Получайте push-уведомления о упоминаниях и комментариях непосредственно на рабочем столе
                          </p>
                        </div>
                        <Switch 
                          id="desktop-comments" 
                          checked={desktopCommentsNotifications}
                          onCheckedChange={handleDesktopCommentsChange}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="desktop-meetings" className="!cursor-pointer">Уведомления об обнаружении собраний на рабочем столе</Label>
                          <p className="text-sm text-muted-foreground">
                            Получайте push-уведомления для запуска заметок о собраниях, когда вы присоединяетесь к собранию на рабочем столе
                          </p>
                        </div>
                        <Switch 
                          id="desktop-meetings" 
                          checked={desktopMeetingNotifications}
                          onCheckedChange={handleDesktopMeetingsChange}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

      </div>
    </div>
  );
};

export default GeneralSettings;
