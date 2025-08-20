import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader, Globe } from "lucide-react";
import SocialHeader, { SocialSidebarMenu } from "@/components/social-header";

interface User {
  username: string;
  name: string;
  profilePicture: string | null;
}

const checkUserWebsite = (username: string): boolean => {
  try {
    const websites = JSON.parse(localStorage.getItem('websites') || '{}');
    return !!websites[username];
  } catch {
    return false;
  }
};

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
        <main className="flex-1 flex flex-col items-center px-2 sm:px-4 py-4 sm:py-8">
          <div className="w-full max-w-2xl flex flex-col gap-4 sm:gap-6">
            <h1 className="text-xl sm:text-2xl font-bold text-center">Пользователи</h1>
            {loading ? (
              <div className="flex justify-center items-center h-24 sm:h-32"><Loader className="animate-spin w-6 h-6 sm:w-8 sm:h-8" /></div>
            ) : error ? (
              <div className="text-center text-red-500 mt-6 sm:mt-10 text-sm sm:text-base">{error}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {users.map((user) => (
                  <Link key={user.username} to={`/u/users/${user.username}`} className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded shadow hover:bg-gray-50">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                      <AvatarImage src={user.profilePicture || ''} alt={user.name} />
                      <AvatarFallback className="text-sm">{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-sm sm:text-base">{user.name}</div>
                      <div className="text-blue-600 font-mono text-xs sm:text-sm">@{user.username}</div>
                    </div>
                    {checkUserWebsite(user.username) && (
                      <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
        {/* Правая колонка */}
        <aside className="hidden lg:flex flex-col w-64 border-l bg-white p-4 sm:p-6 gap-4 sm:gap-6 min-h-svh sticky top-0">
          <div>
            <div className="font-semibold text-base sm:text-lg mb-2">Все пользователи</div>
            <div className="grid grid-cols-3 gap-2">
              {users.map((user) => (
                <Link
                  key={user.username}
                  to={`/u/users/${user.username}`}
                  className="flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-50 transition-colors relative"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.profilePicture || ''} alt={user.name} />
                    <AvatarFallback className="text-xs">{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  {checkUserWebsite(user.username) && (
                    <Globe className="w-3 h-3 text-blue-600 absolute -top-1 -right-1" />
                  )}
                  <span className="font-semibold text-xs truncate max-w-[60px] text-center">{user.name}</span>
                  <span className="text-gray-500 text-[10px] font-mono truncate max-w-[60px] text-center">@{user.username}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default UsersListPage; 