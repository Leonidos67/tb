import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Globe, Plus, ExternalLink, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import TipTapEditor from '@/components/tiptap-editor';
import useAuth from '@/hooks/api/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/resuable/confirm-dialog';
import FullscreenModal from '@/components/ui/fullscreen-modal';

const CreateWebsite = () => {
  const { data: currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState<string | null>(null);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    about: '',
    profileImage: null as File | null,
    gallery: [] as File[]
  });

  // Получаем данные о существующих сайтах из localStorage
  const [existingWebsites, setExistingWebsites] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const websites = JSON.parse(localStorage.getItem('websites') || '{}');
    setExistingWebsites(websites);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
    }
  };

  const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...files] }));
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!currentUser?.user?.username) {
      toast({
        title: "Ошибка",
        description: "Пользователь не найден",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const websiteData = {
        _id: Date.now().toString(),
        userId: currentUser.user._id || 'temp',
        username: currentUser.user.username,
        title: formData.title,
        description: formData.description,
        about: formData.about,
        profileImage: formData.profileImage,
        gallery: formData.gallery,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existingWebsites = JSON.parse(localStorage.getItem('websites') || '{}');
      existingWebsites[currentUser.user.username] = websiteData;
      localStorage.setItem('websites', JSON.stringify(existingWebsites));

      toast({
        title: "Успешно!",
        description: "Ваш сайт создан и доступен по ссылке",
      });

      // Обновляем состояние
      setExistingWebsites(existingWebsites);
      setShowCreateForm(false);
      setCurrentStep(1);
      setFormData({
        title: '',
        description: '',
        about: '',
        profileImage: null,
        gallery: []
      });
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось создать сайт. Попробуйте еще раз.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWebsite = (username: string) => {
    setWebsiteToDelete(username);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteWebsite = () => {
    if (websiteToDelete) {
      const websites = JSON.parse(localStorage.getItem('websites') || '{}');
      delete websites[websiteToDelete];
      localStorage.setItem('websites', JSON.stringify(websites));
      setExistingWebsites(websites);
      setDeleteDialogOpen(false);
      setWebsiteToDelete(null);
      
      toast({
        title: "Успешно!",
        description: "Сайт удален",
      });
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() && formData.description.trim();
      case 2:
        return formData.about.trim();
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleCreateNewWebsite = () => {
    setShowCreateForm(true);
    setCurrentStep(1);
    setFormData({
      title: '',
      description: '',
      about: '',
      profileImage: null,
      gallery: []
    });
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setCurrentStep(1);
    setFormData({
      title: '',
      description: '',
      about: '',
      profileImage: null,
      gallery: []
    });
  };

  const handleFullscreenToggle = () => {
    setIsFullscreenOpen(!isFullscreenOpen);
  };

  const CreateWebsiteContent = () => (
    <main className="flex flex-1 flex-col py-4 md:pt-3">
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Создание сайта</h2>
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFullscreenToggle}
            className="h-8 w-10 border"
          >
            {isFullscreenOpen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          {/* <Button
            type="button"
            onClick={handleCreateNewWebsite}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Создать новый сайт</span>
            <span className="sm:hidden">Создать</span>
          </Button> */}
        </div>
      </div>

      <div className="w-full">
        {/* Секция с уже созданными сайтами */}
        {Object.keys(existingWebsites).length > 0 && (
          <div className="w-full border rounded-lg p-6 bg-white flex flex-col items-start text-left shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4">Мои сайты</h3>
            <div className="w-full space-y-4">
                                            {Object.entries(existingWebsites).map(([username, website]: [string, unknown]) => {
                 const websiteData = website as { title: string; description: string };
                 return (
                 <div key={username} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                   <div className="flex items-center space-x-3">
                     <div className="p-2 bg-blue-100 rounded-lg">
                       <Globe className="w-5 h-5 text-blue-600" />
                     </div>
                     <div>
                       <h4 className="font-medium text-gray-900">{websiteData.title}</h4>
                       <p className="text-sm text-gray-500 sm:block hidden">{websiteData.description}</p>
                       <p className="text-xs text-blue-600 font-mono sm:block hidden">
                         {window.location.origin}/web/{username}
                       </p>
                     </div>
                   </div>
                                     <div className="flex gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => window.open(`${window.location.origin}/web/${username}`, '_blank')}
                     >
                       <ExternalLink className="w-4 h-4 sm:mr-2" />
                       <span className="sm:inline hidden">Открыть</span>
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => handleDeleteWebsite(username)}
                     >
                       <Trash2 className="w-4 h-4 sm:mr-2" />
                       <span className="sm:inline hidden">Удалить</span>
                     </Button>
                   </div>
                 </div>
               );
               })}
            </div>
          </div>
        )}

        {/* Форма создания сайта */}
        {showCreateForm && (
          <div className="w-full border rounded-lg p-6 bg-white flex flex-col items-start text-left shadow-sm">
            <div className="w-full">
              {/* Прогресс-бар */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      1
                    </div>
                                         <span className={`text-sm sm:block hidden ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                       Основная информация
                     </span>
                  </div>
                  <div className="flex-1 h-px bg-gray-200 mx-4"></div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      2
                    </div>
                                         <span className={`text-sm sm:block hidden ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                       О себе
                     </span>
                  </div>
                  <div className="flex-1 h-px bg-gray-200 mx-4"></div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 3 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      3
                    </div>
                                         <span className={`text-sm sm:block hidden ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>
                       Медиафайлы
                     </span>
                  </div>
                </div>
              </div>

              {/* Шаг 1: Основная информация */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Название сайта *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Введите название вашего сайта"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Краткое описание *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Кратко опишите, о чем будет ваш сайт"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                </div>
              )}

              {/* Шаг 2: О себе */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="about">Расскажите о себе *</Label>
                    <div className="mt-1">
                      <TipTapEditor
                        content={formData.about}
                        onChange={(value) => handleInputChange('about', value)}
                        placeholder="Расскажите о себе, своих достижениях, увлечениях..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Шаг 3: Медиафайлы */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Фото профиля */}
                  <div>
                    <Label>Фото профиля</Label>
                    <div className="mt-2">
                      <div className="flex items-center space-x-4">
                        {formData.profileImage && (
                          <div className="relative">
                            <img
                              src={URL.createObjectURL(formData.profileImage)}
                              alt="Profile"
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 w-6 h-6 p-0"
                              onClick={() => setFormData(prev => ({ ...prev, profileImage: null }))}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        <div>
                          <input
                            type="file"
                            id="profile-image"
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                            className="hidden"
                          />
                          <Label
                            htmlFor="profile-image"
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {formData.profileImage ? 'Изменить фото' : 'Загрузить фото'}
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Галерея */}
                  <div>
                    <Label>Галерея фотографий</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        id="gallery"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                        className="hidden"
                      />
                      <Label
                        htmlFor="gallery"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Добавить фотографии
                      </Label>
                    </div>
                    
                    {formData.gallery.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {formData.gallery.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 w-6 h-6 p-0"
                              onClick={() => removeGalleryImage(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Навигация по шагам */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={currentStep === 1 ? handleCancelCreate : prevStep}
                >
                  {currentStep === 1 ? 'Отмена' : 'Назад'}
                </Button>
                
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed()}
                  >
                    Далее
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canProceed() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Создание...' : 'Создать сайт'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Если нет сайтов и форма не показана */}
        {Object.keys(existingWebsites).length === 0 && !showCreateForm && (
          <div className="w-full border rounded-lg p-6 bg-white flex flex-col items-center text-center shadow-sm">
            <div className="p-4 bg-blue-100 rounded-full mb-4">
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Создайте свой сайт</h3>
            <p className="text-gray-600 mb-4">
              Создайте красивый сайт о себе с фотографиями и описанием
            </p>
            <Button onClick={handleCreateNewWebsite}>
              <Plus className="w-4 h-4 mr-2" />
              Создать сайт
            </Button>
          </div>
        )}
      </div>

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        isLoading={false}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteWebsite}
        title="Удалить сайт?"
        description="Вы уверены, что хотите удалить этот сайт? Это действие невозможно отменить."
        confirmText="Удалить"
        cancelText="Отменить"
      />
    </main>
  );

  return (
    <>
      <CreateWebsiteContent />
      <FullscreenModal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
      >
        <CreateWebsiteContent />
      </FullscreenModal>
    </>
  );
};

export default CreateWebsite;
