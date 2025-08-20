import React from 'react';
import { useParams } from 'react-router-dom';
import { Loader, AlertCircle } from 'lucide-react';
import { useGetWebsiteByUsername } from '@/hooks/api/use-website';
import PublicWebsite from '@/components/website/public-website';

const PublicWebsitePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { data: websiteData, isLoading } = useGetWebsiteByUsername(username || '');

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Ошибка</h1>
          <p>Имя пользователя не указано</p>
        </div>
      </div>
    );
  }

  // Пытаемся получить данные сайта из localStorage, если API недоступен
  const getLocalWebsiteData = () => {
    try {
      const websites = JSON.parse(localStorage.getItem('websites') || '{}');
      return websites[username] || null;
    } catch {
      return null;
    }
  };

  const localWebsiteData = getLocalWebsiteData();
  const hasWebsite = websiteData?.website || localWebsiteData;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-600" />
          <h1 className="text-2xl font-bold mb-2">Загрузка сайта</h1>
          <p className="text-gray-600">Пожалуйста, подождите...</p>
        </div>
      </div>
    );
  }

  if (!hasWebsite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Сайт не найден</h1>
          <p>Пользователь @{username} еще не создал свой персональный сайт</p>
          <p className="text-sm text-gray-500 mt-2">
            Или сайт временно недоступен
          </p>
        </div>
      </div>
    );
  }

  const website = websiteData?.website || localWebsiteData;
  return <PublicWebsite website={website} username={username} />;
};

export default PublicWebsitePage;
