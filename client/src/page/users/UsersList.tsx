import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader } from "lucide-react";
import Logo from "@/components/logo";

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
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium">
          <Logo />
          <span className="text-xl font-bold tracking-tight">T-Sync.</span>
        </Link>
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
    </div>
  );
};

export default UsersListPage; 