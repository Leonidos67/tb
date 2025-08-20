import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Heart, MessageCircle } from 'lucide-react';
import { WebsiteType } from '@/types/api.type';
import { Link } from 'react-router-dom';

interface PublicWebsiteProps {
  website: WebsiteType;
  username: string;
}

const PublicWebsite: React.FC<PublicWebsiteProps> = ({ website, username }) => {
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: website.title,
        text: website.description,
        url: window.location.href,
      });
    } else {
      // Fallback для браузеров без поддержки Web Share API
      navigator.clipboard.writeText(window.location.href);
      // Можно добавить toast уведомление
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Навигация */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link 
              to={`/u/users/${username}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Вернуться к профилю</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                Made in T-Sync
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Основной контент */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Заголовок сайта */}
        <Card className="p-8 mb-8 text-center bg-white shadow-lg">
          <div className="mb-6">
            {website.profileImage && (
              <img 
                src={website.profileImage} 
                alt={username} 
                className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-white shadow-lg"
              />
            )}
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {website.title}
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {website.description}
          </p>
          
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>Создан {new Date(website.createdAt).toLocaleDateString('ru-RU')}</span>
            <span>•</span>
            <span>Автор: @{username}</span>
          </div>
        </Card>

        {/* О себе */}
        <Card className="p-8 mb-8 bg-white shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">О себе</h2>
          <div 
            className="prose max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: renderMarkdownContent(website.about) 
            }}
          />
        </Card>

        {/* Галерея */}
        {website.gallery.length > 0 && (
          <Card className="p-8 mb-8 bg-white shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Галерея</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {website.gallery.map((image, index) => (
                <div key={index} className="group cursor-pointer">
                  <img 
                    src={image} 
                    alt={`Gallery ${index + 1}`} 
                    className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                    onClick={() => window.open(image, '_blank')}
                  />
                  <div className="mt-2 text-center text-sm text-gray-600">
                    Изображение {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Футер */}
        <Card className="p-6 text-center bg-white shadow-lg">
          <div className="flex items-center justify-center gap-6 mb-4">
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4 mr-2" />
              Нравится
            </Button>
            <Button variant="outline" size="sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              Комментировать
            </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Поделиться
              </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            Сайт создан с помощью <a className='text-black' target='_blank' href="https://t-sync.ru">T-Sync</a>
          </p>
          
          <div className="mt-4">
            <Link 
              to={`/u/users/${username}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Посмотреть профиль автора
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PublicWebsite;
