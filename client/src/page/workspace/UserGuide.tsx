import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, BookOpen, HelpCircle } from "lucide-react";

const UserGuide = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Руководство пользователя</h1>
        <p className="text-muted-foreground">
          Изучите возможности T-Sync и научитесь эффективно использовать платформу
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span>Быстрый старт</span>
              <Badge variant="default">Рекомендуется</Badge>
            </CardTitle>
            <CardDescription>
              Основные шаги для начала работы с T-Sync
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Создание рабочего пространства</h4>
                  <p className="text-sm text-muted-foreground">
                    Создайте свое первое рабочее пространство для организации тренировок
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Добавление проектов</h4>
                  <p className="text-sm text-muted-foreground">
                    Создавайте проекты для группировки связанных задач и тренировок
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Создание задач</h4>
                  <p className="text-sm text-muted-foreground">
                    Добавляйте задачи и тренировки в проекты для отслеживания прогресса
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              <span>Видеоуроки</span>
            </CardTitle>
            <CardDescription>
              Обучающие видео по использованию T-Sync
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start">
                <Play className="mr-2 h-4 w-4" />
                Основы работы с T-Sync
                <ExternalLink className="ml-auto h-4 w-4" />
              </Button>
              <Button variant="outline" className="justify-start">
                <Play className="mr-2 h-4 w-4" />
                Управление проектами
                <ExternalLink className="ml-auto h-4 w-4" />
              </Button>
              <Button variant="outline" className="justify-start">
                <Play className="mr-2 h-4 w-4" />
                Создание и отслеживание задач
                <ExternalLink className="ml-auto h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              <span>Навигация по платформе</span>
            </CardTitle>
            <CardDescription>
              Ответы на популярные вопросы пользователей
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Как создать новое рабочее пространство?</h4>
                <p className="text-sm text-muted-foreground">
                  Нажмите на кнопку "Создать рабочее пространство" в верхней части сайдбара и заполните необходимую информацию.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Как пригласить участников в проект?</h4>
                <p className="text-sm text-muted-foreground">
                  В настройках проекта найдите раздел "Участники" и используйте кнопку "Добавить участника".
                </p>
              </div>
              <div>
                <h4 className="font-medium">Как отслеживать прогресс задач?</h4>
                <p className="text-sm text-muted-foreground">
                  Используйте статусы задач и календарь для отслеживания прогресса выполнения.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Дополнительные ресурсы</CardTitle>
            <CardDescription>
              Полезные ссылки и документация
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start">
                <ExternalLink className="mr-2 h-4 w-4" />
                Полная документация
              </Button>
              <Button variant="outline" className="justify-start">
                <ExternalLink className="mr-2 h-4 w-4" />
                Сообщество пользователей
              </Button>
              <Button variant="outline" className="justify-start">
                <ExternalLink className="mr-2 h-4 w-4" />
                Поддержка
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserGuide;
