import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, EyeOff, Eye, Watch } from 'lucide-react';
import WebsitePreview from './website-preview';
import { useGetWebsiteByUsername, useDeleteWebsite } from '@/hooks/api/use-website';
import { ConfirmDialog } from '@/components/resuable/confirm-dialog';
import useAuth from '@/hooks/api/use-auth';
import useWorkspaceId from '@/hooks/use-workspace-id';

const WebsiteManager: React.FC = () => {
  const navigate = useNavigate();
  const { data: currentUser } = useAuth();
  const workspaceId = useWorkspaceId();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // По умолчанию показан
  
  const username = currentUser?.user?.username;
  const { data: websiteData, isLoading } = useGetWebsiteByUsername(username || '');
  const deleteWebsite = useDeleteWebsite();

  // URL для фронтенда (сайт), а не для API
  const frontendURL = window.location.origin;

  // Загружаем состояние из localStorage при монтировании
  useEffect(() => {
    const savedState = localStorage.getItem('website-manager-visible');
    if (savedState !== null) {
      setIsVisible(JSON.parse(savedState));
    }
  }, []);

  // Сохраняем состояние в localStorage при изменении
  const handleToggleVisibility = () => {
    const newState = !isVisible;
    setIsVisible(newState);
    localStorage.setItem('website-manager-visible', JSON.stringify(newState));
  };

  // Пытаемся получить данные сайта из localStorage, если API недоступен
  const getLocalWebsiteData = () => {
    if (!username) return null;
    try {
      const websites = JSON.parse(localStorage.getItem('websites') || '{}');
      return websites[username as string] || null;
    } catch {
      return null;
    }
  };

  const localWebsiteData = getLocalWebsiteData();
  const hasWebsite = websiteData?.website || localWebsiteData;

  const handleDeleteWebsite = async () => {
    try {
      // Удаляем из localStorage
      if (localWebsiteData) {
        const websites = JSON.parse(localStorage.getItem('websites') || '{}');
        delete websites[username as string];
        localStorage.setItem('websites', JSON.stringify(websites));
        window.location.reload();
        return;
      }

      // Если есть API, удаляем через него
      await deleteWebsite.mutateAsync();
      setDeleteDialogOpen(false);
    } catch {
      // Ошибка обрабатывается в хуке
    }
  };

  const handleEditWebsite = () => {
    setIsEditMode(true);
  };

  const handleCreateWebsite = () => {
    navigate(`/workspace/${workspaceId}/create-website`);
  };

  return (
    <Card className="shadow-none w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 sm:pb-6">
        <CardTitle className="text-sm font-medium">Персональный сайт</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleToggleVisibility}
          aria-label={isVisible ? "Скрыть блок сайта" : "Показать блок сайта"}
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </CardHeader>
      
      {isVisible && (
        <CardContent className="pb-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : !hasWebsite ? (
            <div className="space-y-4">
              {/* Блок создания сайта в стиле Garmin */}
              <div className="flex items-center justify-between" style={{marginBottom: '10px'}}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Watch className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Сайт о себе</h3>
                    <p className="text-sm text-gray-500">Создайте свой персональный сайт для демонстрации достижений.</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={handleCreateWebsite}
                >
                  Создать
                </Button>
              </div>
              
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Мой персональный сайт</h2>
                  <p className="text-gray-600">
                    Управляйте своим персональным сайтом и его содержимым
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleEditWebsite}
                  >
                    Редактировать
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => window.open(`${frontendURL}/web/${username}`, '_blank')}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Открыть сайт
                  </Button>
                </div>
              </div>

              <WebsitePreview
                website={websiteData?.website || localWebsiteData}
                onEdit={handleEditWebsite}
                onDelete={() => setDeleteDialogOpen(true)}
                isOwner={true}
              />

              {isEditMode && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditMode(false)}
                  className="w-full"
                >
                  Редактировать сайт
                </Button>
              )}

              <ConfirmDialog
                isOpen={deleteDialogOpen}
                isLoading={deleteWebsite.isPending}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteWebsite}
                title="Удалить сайт?"
                description="Вы уверены, что хотите удалить свой персональный сайт? Это действие невозможно отменить."
                confirmText="Удалить"
                cancelText="Отменить"
              />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default WebsiteManager;
