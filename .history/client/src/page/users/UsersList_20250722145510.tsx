import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader } from "lucide-react";
import SocialHeader, { SocialSidebarMenu } from "@/components/social-header";

interface User {
  username: string;
  name: string;
  profilePicture: string | null;
}

const UsersListPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/user/all")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        setError(null);
      })
      .catch(() => setError("Ошибка загрузки пользователей"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SocialHeader />
      <div className="flex min-h-svh bg-muted">
        {/* Левая колонка */}
        <SocialSidebarMenu />
        {/* Центр: список пользователей */}
        <main className="flex-1 flex flex-col items-center px-2 py-8">
          <div className="w-full max-w-2xl flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-center">Пользователи</h1>
            {loading ? (
              <div className="flex justify-center items-center h-32"><Loader className="animate-spin w-8 h-8" /></div>
            ) : error ? (
              <div className="text-center text-red-500 mt-10">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((user) => (
                  <Link key={user.username} to={`/u/users/${user.username}`} className="flex items-center gap-3 p-4 bg-white rounded shadow hover:bg-gray-50">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.profilePicture || ''} alt={user.name} />
                      <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-blue-600 font-mono">@{user.username}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
        {/* Правая колонка */}
        <aside className="hidden lg:flex flex-col w-64 border-l bg-white p-6 gap-6 min-h-svh sticky top-0">
          <div>
            <div className="font-semibold text-lg mb-2">Мои подписки</div>
            <div className="text-gray-500 text-sm">Скоро здесь появятся ваши подписки на пользователей.</div>
          </div>
          <div>
            <div className="font-semibold text-lg mb-2">Рекомендации</div>
            <div className="text-gray-500 text-sm">Здесь будут рекомендации по интересным людям и постам.</div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default UsersListPage; 