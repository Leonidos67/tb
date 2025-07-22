import { useEffect, useState } from "react";
import { getFeedQueryFn, likeUserPostMutationFn, deleteUserPostMutationFn, getFollowingQueryFn, followUserMutationFn, unfollowUserMutationFn, getUserPostsQueryFn } from "@/lib/api";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import useAuth from "@/hooks/api/use-auth";
import SocialHeader from "@/components/social-header";
import { EllipsisVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FeedPost {
  _id: string;
  text: string;
  image?: string | null;
  createdAt: string;
  author: {
    username: string;
    name: string;
    profilePicture: string | null;
    _id: string;
  };
  likes?: string[];
}

interface FollowingUser {
  username: string;
  name: string;
  profilePicture: string | null;
}

const SocialMainPage = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: currentUser } = useAuth();
  const userId = currentUser?.user?._id;
  const location = useLocation();
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [userPostsCount, setUserPostsCount] = useState<Record<string, number>>({});
  const [followLoading, setFollowLoading] = useState<string | null>(null);
  const [followingUsernames, setFollowingUsernames] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    getFeedQueryFn()
      .then((data) => setPosts(data.posts || []))
      .finally(() => setLoading(false));

    if (currentUser?.user?.username) {
      getFollowingQueryFn(currentUser.user.username)
        .then((data) => {
          setFollowing(data.following || []);
          setFollowingUsernames((data.following || []).map((u: { username: string }) => u.username));
        })
        .catch(() => {
          setFollowing([]);
          setFollowingUsernames([]);
        });
    }
  }, [currentUser]);

  // Получение числа публикаций для каждого автора
  useEffect(() => {
    const uniqueAuthors = Array.from(new Set(posts.map(p => p.author.username)));
    uniqueAuthors.forEach(username => {
      if (userPostsCount[username] === undefined) {
        getUserPostsQueryFn(username).then(data => {
          setUserPostsCount(prev => ({ ...prev, [username]: (data.posts || []).length }));
        });
      }
    });
  }, [posts]);

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Удалить пост?")) return;
    await deleteUserPostMutationFn(postId);
    setPosts(posts => posts.filter(p => p._id !== postId));
  };

  const handleFollow = async (username: string) => {
    setFollowLoading(username);
    try {
      await followUserMutationFn(username);
      setFollowingUsernames(prev => [...prev, username]);
      toast.success("Вы подписались на пользователя");
    } catch {
      toast.error("Ошибка подписки");
    } finally {
      setFollowLoading(null);
    }
  };
  const handleUnfollow = async (username: string) => {
    setFollowLoading(username);
    try {
      await unfollowUserMutationFn(username);
      setFollowingUsernames(prev => prev.filter(u => u !== username));
      toast.success("Вы отписались от пользователя");
    } catch {
      toast.error("Ошибка отписки");
    } finally {
      setFollowLoading(null);
    }
  };
  const handleShare = (username: string, postId: string) => {
    const url = `${window.location.origin}/u/users/${username}#post-${postId}`;
    navigator.clipboard.writeText(url);
    toast.success("Ссылка на пост скопирована");
  };

  return (
    <>
      <SocialHeader />
      <div className="flex min-h-svh bg-muted">
        {/* Левая колонка */}
        <aside className="hidden md:flex flex-col w-64 border-r bg-white p-6 gap-4 min-h-svh sticky top-0">
          <nav className="flex flex-col gap-2">
            <Link
              // rounded-[30px]
              to="/u/"
              className={`font-semibold text-lg px-3 py-2 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${location.pathname === "/u/" ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground"}`}
            >
              <span className="pl-2">Лента</span>
            </Link>
            <Link
              to="/u/users"
              className={`font-semibold text-lg px-3 py-2 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${location.pathname === "/u/users" ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground"}`}
            >
              <span className="pl-2">Пользователи</span>
            </Link>
            <Link
              to="/u/articles"
              className={`font-semibold text-lg px-3 py-2 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${location.pathname === "/u/articles" ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground"}`}
            >
              <span className="pl-2">Статьи</span>
            </Link>
          </nav>
        </aside>
        {/* Центр: лента */}
        <main className="flex-1 flex flex-col items-center px-2 py-8">
          <div className="w-full max-w-2xl flex flex-col gap-6">
            <div className="mt-8 flex flex-col gap-4">
              {loading ? (
                <div className="text-center text-gray-400">Загрузка...</div>
              ) : posts.length === 0 ? (
                <div className="text-center text-gray-400">Авторизуйтесь, чтобы просматривать посты пользователей</div>
              ) : (
                posts.map(post => {
                  const isOwner = userId && post.author._id === userId;
                  const isFollowing = followingUsernames.includes(post.author.username);
                  return (
                    <div key={post._id} id={`post-${post._id}`} className="p-4 border rounded bg-white relative">
                      <div className="flex items-center gap-4 mb-2">
                        {/* Аватарка */}
                        <Link to={`/u/users/${post.author.username}`} className="flex-shrink-0">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={post.author.profilePicture || ''} alt={post.author.name} />
                            <AvatarFallback>{post.author.name?.[0]}</AvatarFallback>
                          </Avatar>
                        </Link>
                        {/* Имя и ник */}
                        <div className="flex flex-col justify-center min-w-0">
                          <span className="font-bold text-lg truncate">{post.author.name}</span>
                          <span className="text-blue-600 font-mono text-base truncate">@{post.author.username}</span>
                        </div>
                        {/* Кнопка подписки */}
                        {!isOwner && (
                          isFollowing ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-auto"
                              disabled={followLoading === post.author.username}
                              onClick={() => handleUnfollow(post.author.username)}
                            >
                              Отписаться
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="ml-auto"
                              disabled={followLoading === post.author.username}
                              onClick={() => handleFollow(post.author.username)}
                            >
                              Подписаться
                            </Button>
                          )
                        )}
                      </div>
                      <div className="mb-2 whitespace-pre-line">{post.text}</div>
                      {post.image && <img src={post.image} alt="post" className="max-h-60 object-contain rounded" />}
                      <div className="flex items-center gap-3 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(post.author.username, post._id)}
                        >
                          <span role="img" aria-label="share">🔗</span> Поделиться
                        </Button>
                        {isOwner && (
                          <Button variant="ghost" size="sm" className="text-red-500 ml-2" onClick={() => handleDeletePost(post._id)}>
                            Удалить
                          </Button>
                        )}
                      </div>
                      {/* Снизу число публикаций и время */}
                      <div className="flex justify-between items-center mt-4 text-xs text-gray-500 border-t pt-2">
                        <span>Публикаций: {userPostsCount[post.author.username] ?? '—'}</span>
                        <span>{new Date(post.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
        {/* Правая колонка */}
        <aside className="hidden lg:flex flex-col w-64 border-l bg-white p-6 gap-6 min-h-svh sticky top-0">
          <div>
            <div className="font-semibold text-lg mb-2">Мои подписки</div>
            {following.length === 0 ? (
              <div className="text-gray-500 text-sm">Вы ни на кого не подписаны.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {following.map(user => (
                  <div key={user.username} className="flex items-center gap-2 group">
                    <Link to={`/u/users/${user.username}`} className="flex items-center gap-2 hover:underline flex-1 min-w-0">
                      <img src={user.profilePicture || ''} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-semibold truncate">{user.name}</span>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-full hover:bg-gray-100 ml-1">
                          <EllipsisVertical className="w-5 h-5 text-gray-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/u/users/${user.username}`}>Посмотреть профиль</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default SocialMainPage; 