import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Loader } from "lucide-react";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/api/use-auth";
import { getFollowersQueryFn, followUserMutationFn, unfollowUserMutationFn } from "@/lib/api";

interface PublicUser {
  name: string;
  username: string;
  profilePicture: string | null;
  email?: string;
}

interface FollowerUser {
  username: string;
  name: string;
  profilePicture: string | null;
}

const fetchPublicUser = async (username: string): Promise<PublicUser> => {
  const res = await fetch(`/api/user/public/${username}`);
  if (!res.ok) throw new Error("Пользователь не найден");
  return res.json();
};

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: currentUser } = useAuth();
  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetchPublicUser(username)
      .then((data) => {
        setUser(data);
        setError(null);
      })
      .catch((e) => {
        setError(e.message || "Ошибка");
        setUser(null);
      })
      .finally(() => setLoading(false));

    // Получить подписчиков
    getFollowersQueryFn(username)
      .then((data) => {
        setFollowers(data.followers || []);
        if (currentUser?.user && data.followers) {
          setIsFollowing(data.followers.some((f: FollowerUser) => f.username === currentUser.user.username));
        }
      })
      .catch(() => setFollowers([]));
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!username) return;
    setFollowLoading(true);
    try {
      await followUserMutationFn(username);
      setIsFollowing(true);
      // Обновить список подписчиков
      const data = await getFollowersQueryFn(username);
      setFollowers(data.followers || []);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!username) return;
    setFollowLoading(true);
    try {
      await unfollowUserMutationFn(username);
      setIsFollowing(false);
      // Обновить список подписчиков
      const data = await getFollowersQueryFn(username);
      setFollowers(data.followers || []);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin w-8 h-8" /></div>;
  }
  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }
  if (!user) return null;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo />
          <span className="text-xl font-bold tracking-tight">T-Sync.</span>
        </Link>
        <div className="flex flex-col gap-6">
          <Card className="p-0">
            <div className="flex flex-col items-center gap-2 pt-8">
              <div className="text-lg font-semibold mb-2">👋 Привет! Я пользуюсь T-Sync.</div>
            </div>
            <div className="flex flex-col items-center gap-4 px-8 pb-8">
              <Avatar className="w-24 h-24 mt-2">
                <AvatarImage src={user.profilePicture || ''} alt={user.name} />
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="text-2xl font-bold">{user.name}</div>
              <div className="text-blue-600 font-mono text-lg">@{user.username}</div>
              {user.email && <div className="text-gray-500">{user.email}</div>}
              {currentUser?.user?.username === user.username && (
                <Button className="mt-4">Редактировать профиль</Button>
              )}
              {currentUser?.user && currentUser.user.username !== user.username && (
                isFollowing ? (
                  <Button variant="outline" className="mt-4" onClick={handleUnfollow} disabled={followLoading}>
                    Отписаться
                  </Button>
                ) : (
                  <Button className="mt-4" onClick={handleFollow} disabled={followLoading}>
                    Подписаться
                  </Button>
                )
              )}
              <div className="mt-6 w-full">
                <div className="font-semibold mb-2">Подписчики ({followers.length}):</div>
                <div className="flex flex-wrap gap-3">
                  {followers.length === 0 && <span className="text-gray-400">Нет подписчиков</span>}
                  {followers.map((f) => (
                    <Link key={f.username} to={`/u/users/${f.username}`} className="flex items-center gap-2 hover:underline">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={f.profilePicture || ''} alt={f.name} />
                        <AvatarFallback>{f.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <span>@{f.username}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 