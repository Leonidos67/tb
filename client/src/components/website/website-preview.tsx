import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit, Trash2 } from 'lucide-react';
import { WebsiteType } from '@/types/api.type';


interface WebsitePreviewProps {
  website: WebsiteType;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

const WebsitePreview: React.FC<WebsitePreviewProps> = ({ 
  website, 
  onEdit, 
  onDelete, 
  isOwner = false 
}) => {
  const websiteUrl = `${window.location.origin}/web/${website.username}`;

  const renderMarkdownContent = (content: string) => {
    // Простой парсер Markdown для отображения
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/>(.*?)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">$1</blockquote>')
      .replace(/^- (.*?)$/gm, '<li class="list-disc ml-4">$1</li>')
      .replace(/^1\. (.*?)$/gm, '<li class="list-decimal ml-4">$1</li>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-2" />')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
      .replace(/<span style="color: (.*?)">(.*?)<\/span>/g, '<span style="color: $1">$2</span>');
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Заголовок и действия */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{website.title}</h1>
          <p className="text-lg text-gray-600">{website.description}</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(websiteUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Открыть сайт
          </Button>
          
          {isOwner && (
            <>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Информация о сайте */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Информация о сайте</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Ссылка:</span>
              <a 
                href={websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-2 font-mono"
              >
                {websiteUrl}
              </a>
            </div>
            <div>
              <span className="font-medium">Статус:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                website.isPublished 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {website.isPublished ? 'Опубликован' : 'Черновик'}
              </span>
            </div>
            <div>
              <span className="font-medium">Создан:</span>
              <span className="ml-2 text-gray-600">
                {new Date(website.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
            <div>
              <span className="font-medium">Обновлен:</span>
              <span className="ml-2 text-gray-600">
                {new Date(website.updatedAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>

        {/* Фото профиля */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Фото профиля</h3>
          {website.profileImage ? (
            <img 
              src={website.profileImage} 
              alt="Profile" 
              className="w-32 h-32 object-cover rounded-lg border"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
              Нет фото
            </div>
          )}
        </div>
      </div>

      {/* О себе */}
      <div>
        <h3 className="text-lg font-semibold mb-3">О себе</h3>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: renderMarkdownContent(website.about) 
          }}
        />
      </div>

      {/* Галерея */}
      {website.gallery.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Галерея</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {website.gallery.map((image, index) => (
              <div key={index} className="relative group">
                <img 
                  src={image} 
                  alt={`Gallery ${index + 1}`} 
                  className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(image, '_blank')}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                    Нажмите для увеличения
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR код для быстрого доступа */}
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">
          Поделитесь ссылкой на ваш сайт:
        </p>
        <div className="bg-white p-3 rounded-lg inline-block">
          <div className="text-xs font-mono text-gray-800 break-all max-w-xs">
            {websiteUrl}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WebsitePreview;
