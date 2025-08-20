import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const Notifications = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Уведомления</h1>
        <p className="text-muted-foreground">
          Настройте уведомления для вашего рабочего пространства
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Email уведомления</span>
              <Badge variant="secondary">Основные</Badge>
            </CardTitle>
            <CardDescription>
              Получайте уведомления на email о важных событиях
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-tasks">Новые задачи</Label>
                <p className="text-sm text-muted-foreground">
                  Уведомления о новых задачах в проектах
                </p>
              </div>
              <Switch id="new-tasks" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="task-updates">Обновления задач</Label>
                <p className="text-sm text-muted-foreground">
                  Уведомления об изменениях в задачах
                </p>
              </div>
              <Switch id="task-updates" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="project-updates">Обновления проектов</Label>
                <p className="text-sm text-muted-foreground">
                  Уведомления об изменениях в проектах
                </p>
              </div>
              <Switch id="project-updates" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Push уведомления</CardTitle>
            <CardDescription>
              Настройте push уведомления в браузере
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Включить push уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Получайте уведомления даже когда вкладка не активна
                </p>
              </div>
              <Switch id="push-notifications" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Настройки уведомлений</CardTitle>
            <CardDescription>
              Дополнительные настройки для уведомлений
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Дополнительные настройки будут доступны в ближайшее время
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
