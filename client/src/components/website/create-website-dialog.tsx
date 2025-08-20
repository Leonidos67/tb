import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Image, FileText, User, CheckCircle, ExternalLink } from 'lucide-react';
import TipTapEditor from '@/components/tiptap-editor';
import { useToast } from '@/hooks/use-toast';

import { CreateWebsiteType } from '@/types/api.type';
import useAuth from '@/hooks/api/use-auth';


interface CreateWebsiteDialogProps {
  children: React.ReactNode;
}

const CreateWebsiteDialog: React.FC<CreateWebsiteDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { data: currentUser } = useAuth();

  // Форма сайта
  const [formData, setFormData] = useState<CreateWebsiteType>({
    title: '',
    description: '',
    about: '',
    profileImage: null,
    gallery: []
  });

  // Убеждаемся, что gallery всегда является массивом
  const safeGallery = formData.gallery || [];

  const handleInputChange = (field: keyof CreateWebsiteType, value: string | string[] | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (field: 'profileImage' | 'gallery') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = field === 'gallery';
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      if (field === 'profileImage') {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = () => {
          handleInputChange('profileImage', reader.result as string);
        };
        reader.readAsDataURL(file);
              } else if (field === 'gallery') {
          const newGallery: string[] = [];
          Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
              newGallery.push(reader.result as string);
              if (newGallery.length === files.length) {
                handleInputChange('gallery', [...safeGallery, ...newGallery]);
              }
            };
            reader.readAsDataURL(file);
          });
        }
    };
    
    input.click();
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = safeGallery.filter((_, i) => i !== index);
    handleInputChange('gallery', newGallery);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() && formData.description.trim();
      case 2:
        return formData.about.trim();
      case 3:
        return true; // Галерея опциональна
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!currentUser?.user?.username) {
      toast({
        title: "Ошибка",
        description: "Не удалось получить имя пользователя",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Временно сохраняем в localStorage вместо API
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

      // Сохраняем в localStorage
      const existingWebsites = JSON.parse(localStorage.getItem('websites') || '{}');
      existingWebsites[currentUser.user.username] = websiteData;
      localStorage.setItem('websites', JSON.stringify(existingWebsites));

      toast({
        title: "Успешно!",
        description: "Ваш сайт создан и доступен по ссылке",
      });
      
      // Показать ссылку на сайт
      const websiteUrl = `${window.location.origin}/web/${currentUser.user.username}`;
      toast({
        title: "Ссылка на ваш сайт",
        description: (
          <div className="flex items-center gap-2">
            <a 
              href={websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              {websiteUrl}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ),
      });
      
      setIsOpen(false);
      setCurrentStep(1);
      setFormData({
        title: '',
        description: '',
        about: '',
        profileImage: null,
        gallery: []
      });

      // Обновляем страницу для отображения созданного сайта
      window.location.reload();
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

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <Globe className="w-5 h-5" />;
      case 2: return <FileText className="w-5 h-5" />;
      case 3: return <Image className="w-5 h-5" />;
      case 4: return <User className="w-5 h-5" />;
      default: return null;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Основная информация";
      case 2: return "О себе";
      case 3: return "Галерея";
      case 4: return "Завершение";
      default: return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Создать персональный сайт
          </DialogTitle>
        </DialogHeader>

        {/* Прогресс-бар */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2
                ${step < currentStep ? 'bg-green-500 border-green-500 text-white' : 
                  step === currentStep ? 'bg-blue-500 border-blue-500 text-white' : 
                  'bg-gray-200 border-gray-300 text-gray-500'}
              `}>
                {step < currentStep ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  getStepIcon(step)
                )}
              </div>
              {step < 4 && (
                <div className={`
                  w-16 h-1 mx-2
                  ${step < currentStep ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              )}
            </div>
          ))}
        </div>

        <Tabs value={currentStep.toString()} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {[1, 2, 3, 4].map((step) => (
              <TabsTrigger 
                key={step} 
                value={step.toString()}
                disabled={step > currentStep}
                className="text-sm"
              >
                {getStepTitle(step)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Шаг 1: Основная информация */}
          <TabsContent value="1" className="space-y-4">
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
                  placeholder="Кратко опишите, о чем ваш сайт"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label>Фото профиля</Label>
                <div className="mt-2">
                  {formData.profileImage ? (
                    <div className="relative inline-block">
                      <img 
                        src={formData.profileImage} 
                        alt="Profile" 
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                        onClick={() => handleInputChange('profileImage', null)}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleImageUpload('profileImage')}
                      className="mt-2"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Загрузить фото
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Шаг 2: О себе */}
          <TabsContent value="2" className="space-y-4">
            <div>
              <Label>Расскажите о себе *</Label>
              <TipTapEditor
                content={formData.about}
                onChange={(content) => handleInputChange('about', content)}
                placeholder="Расскажите о себе, своих достижениях, опыте..."
                className="mt-2"
              />
            </div>
          </TabsContent>

          {/* Шаг 3: Галерея */}
          <TabsContent value="3" className="space-y-4">
            <div>
              <Label>Галерея изображений</Label>
              <p className="text-sm text-gray-600 mb-4">
                Добавьте фотографии для вашего сайта (опционально)
              </p>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => handleImageUpload('gallery')}
                className="mb-4"
              >
                <Image className="w-4 h-4 mr-2" />
                Добавить изображения
              </Button>

              {safeGallery.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {safeGallery.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Gallery ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                        onClick={() => removeGalleryImage(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Шаг 4: Завершение */}
          <TabsContent value="4" className="space-y-4">
            <Card className="p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Готово к созданию!</h3>
              <p className="text-gray-600 mb-4">
                Проверьте всю информацию перед созданием сайта
              </p>
              
              <div className="text-left space-y-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <strong>Название:</strong> {formData.title}
                </div>
                <div>
                  <strong>Описание:</strong> {formData.description}
                </div>
                <div>
                  <strong>О себе:</strong> 
                  <div className="mt-1 text-sm text-gray-600 max-h-20 overflow-y-auto">
                    {formData.about}
                  </div>
                </div>
                <div>
                  <strong>Фото профиля:</strong> {formData.profileImage ? 'Загружено' : 'Не загружено'}
                </div>
                <div>
                  <strong>Изображений в галерее:</strong> {safeGallery.length}
                </div>
                <div>
                  <strong>Ссылка на сайт:</strong> 
                  <div className="text-blue-600 font-mono text-sm">
                    {window.location.origin}/web/{currentUser?.user?.username}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Навигация */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Назад
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceedToNext()}
            >
              Далее
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Создание...' : 'Создать'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWebsiteDialog;
