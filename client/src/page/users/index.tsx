import { Link } from "react-router-dom";

const SocialMainPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <h1 className="text-3xl font-bold text-center mb-4">Добро пожаловать в T-Sync Social!</h1>
        <div className="flex flex-col gap-4 items-center">
          <Link to="/u/users" className="text-blue-600 underline text-lg">Пользователи</Link>
          <div className="text-gray-500 text-center max-w-md">
            Здесь будет ваша лента, рекомендации, новости и многое другое — как во ВКонтакте, Instagram, Meta и других соцсетях.
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-4 items-center">
          <div className="w-full h-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg flex items-center justify-center text-2xl font-semibold text-gray-700">
            Лента новостей (скоро)
          </div>
          <div className="w-full h-20 bg-gradient-to-r from-pink-200 to-yellow-200 rounded-lg flex items-center justify-center text-lg text-gray-600">
            Рекомендации (скоро)
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMainPage; 