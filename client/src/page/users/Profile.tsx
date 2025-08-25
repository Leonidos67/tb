import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/api/use-auth";
import { getFollowersQueryFn, followUserMutationFn, unfollowUserMutationFn } from "@/lib/api";
import { getUserPostsQueryFn, deleteUserPostMutationFn, likeUserPostMutationFn } from "@/lib/api";
import { ConfirmDialog } from "@/components/resuable/confirm-dialog";
import SocialHeader, { SocialSidebarMenu } from "@/components/social-header";
import { getFollowingQueryFn } from "@/lib/api";
import { EllipsisVertical, Globe } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { PaymentButton } from "@/components/payment/payment-button";
import { SubscriptionInfo } from "@/components/payment/subscription-info";
import { BalanceDisplay } from "@/components/payment/balance-display";
import { PaymentHistory } from "@/components/payment/payment-history";

interface PublicUser {
  name: string;
  username: string;
  profilePicture: string | null;
  userRole?: "coach" | "athlete" | null;
  email?: string;
}

interface FollowerUser {
  username: string;
  name: string;
  profilePicture: string | null;
  userRole?: "coach" | "athlete" | null;
}

interface Post {
  _id: string;
  text: string;
  image?: string | null;
  createdAt: string;
  author: string;
  likes?: string[];
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [following, setFollowing] = useState<FollowerUser[]>([]);
  const [hasWebsite, setHasWebsite] = useState(false);

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

    // Получить подписки текущего пользователя для правого блока
    if (currentUser?.user?.username) {
      getFollowingQueryFn(currentUser.user.username)
        .then((data) => setFollowing(data.following || []))
        .catch(() => setFollowing([]));
    }

    // Проверить наличие сайта у пользователя
    const checkWebsite = () => {
      try {
        const websites = JSON.parse(localStorage.getItem('websites') || '{}');
        setHasWebsite(!!websites[username]);
      } catch {
        setHasWebsite(false);
      }
    };
    checkWebsite();
  }, [username, currentUser]);

  // Получение постов
  useEffect(() => {
    if (!username) return;
    getUserPostsQueryFn(username)
      .then((data) => setPosts(data.posts || []))
      .catch(() => setPosts([]));
  }, [username]);

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



  const userId = currentUser?.user?._id;

  const handleDeletePost = async () => {
    if (!deletePostId) return;
    setDeleteLoading(true);
    await deleteUserPostMutationFn(deletePostId);
    setPosts(posts => posts.filter(p => p._id !== deletePostId));
    setDeleteLoading(false);
    setDeleteDialogOpen(false);
    setDeletePostId(null);
  };

  const handleLikePost = async (postId: string) => {
    const res = await likeUserPostMutationFn(postId);
    // Обновить посты (лайки)
    setPosts(posts => posts.map(p => p._id === postId ? { ...p, likes: res.likesCount ? [...(p.likes || []), userId!] : (p.likes || []).filter(id => id !== userId) } : p));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin w-8 h-8" /></div>;
  }
  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }
  if (!user) return null;

  return (
    <>
      <SocialHeader />
      <div className="flex min-h-svh bg-muted">
        {/* Левая колонка */}
        <SocialSidebarMenu />
        {/* Центр: профиль */}
        <main className="flex-1 flex flex-col items-center px-2 sm:px-4 py-4 sm:py-8">
          {/* Весь старый JSX профиля */}
          <div className="w-full flex flex-col gap-4 sm:gap-6 max-w-2xl">
            <Card className="p-0">
              <div className="flex flex-col items-center gap-2 pt-6 sm:pt-8">
                <div className="text-base sm:text-lg font-semibold mb-2 text-center">👋 Привет! Я пользуюсь T-Sync.</div>
              </div>
              <div className="flex flex-col items-center gap-3 sm:gap-4 px-4 sm:px-8 pb-6 sm:pb-8">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mt-2">
                  <AvatarImage src={user.profilePicture || ''} alt={user.name} />
                  <AvatarFallback className="text-lg sm:text-xl">{user.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-center">
                  {user.name}
                  {user.userRole === "coach" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-xl sm:text-2xl cursor-help">🏋️‍♂️</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Этот эмодзи присваивается только тренерам</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="text-blue-600 font-mono text-base sm:text-lg">@{user.username}</div>
                {user.email && <div className="text-gray-500 text-sm sm:text-base">{user.email}</div>}
                {hasWebsite && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={`${window.location.origin}/web/${user.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          <span className="text-sm font-medium">Мой сайт</span>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Перейти на персональный сайт</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {currentUser?.user?.username === user.username && (
                  <>
                    <Button className="mt-4 text-sm sm:text-base">Редактировать профиль</Button>
                    
                    {/* Секция баланса */}
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-4">Баланс</h3>
                      <BalanceDisplay />
                    </div>
                    
                    {/* Информация о подписке */}
                    <div className="mt-4">
                      <SubscriptionInfo 
                        isPremium={false} // Здесь можно добавить логику проверки подписки
                        className="mb-4"
                      />
                      
                      {/* Кнопки оплаты */}
                      <div className="space-y-2">
                        <PaymentButton 
                          amount={1}
                          description="Тестовое пополнение баланса на 1 ₽"
                          className="w-full text-sm sm:text-base bg-green-600 hover:bg-green-700"
                        />
                        <PaymentButton 
                          amount={100}
                          description="Подписка на T-Sync Premium"
                          className="w-full text-sm sm:text-base"
                        />
                      </div>
                    </div>
                    
                    {/* История платежей */}
                    <div className="mt-4">
                      <PaymentHistory />
                    </div>
                    

                  </>
                )}
                {currentUser?.user && currentUser.user.username !== user.username && (
                  isFollowing ? (
                    <Button variant="outline" className="mt-4 text-sm sm:text-base" onClick={handleUnfollow} disabled={followLoading}>
                      Отписаться
                    </Button>
                  ) : (
                    <Button className="mt-4 text-sm sm:text-base" onClick={handleFollow} disabled={followLoading}>
                      Подписаться
                    </Button>
                  )
                )}
                <div className="mt-4 sm:mt-6 w-full">
                  <div className="font-semibold mb-2 text-sm sm:text-base">Подписчики: {followers.length}</div>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {followers.length === 0 && <span className="text-gray-400 text-sm sm:text-base">Нет подписчиков</span>}
                    {followers.map((f) => (
                      <Link key={f.username} to={`/u/users/${f.username}`} className="flex items-center gap-1.5 sm:gap-2 hover:underline">
                        <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                          <AvatarImage src={f.profilePicture || ''} alt={f.name} />
                          <AvatarFallback className="text-xs sm:text-sm">{f.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="flex items-center gap-1 text-xs sm:text-sm">
                          @{f.username}
                          {f.userRole === "coach" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="text-xs sm:text-sm cursor-help">🏋️‍♂️</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Тренер</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div className="mt-8 w-full max-w-2xl">
            <div className="font-semibold mb-2">Посты:</div>
            {posts.length === 0 && <div className="text-gray-400">Нет постов</div>}
            <div className="flex flex-col gap-4">
              {posts.map(post => {
                const isOwner = currentUser?.user?._id && post.author === currentUser.user._id;
                const isLiked = post.likes && userId ? post.likes.includes(userId) : false;
                return (
                  <div key={post._id} className="p-4 border rounded bg-white relative">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user?.profilePicture || ''} alt={user?.name} />
                          <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold flex items-center gap-1">
                          {user?.name}
                          {user?.userRole === "coach" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="text-lg cursor-help">🏋️‍♂️</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Тренер</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </span>
                      </div>
                      <div className="ml-auto">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded-full hover:bg-gray-100">
                              <EllipsisVertical className="w-5 h-5 text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/u/users/${user?.username}`}>Посмотреть профиль</Link>
                            </DropdownMenuItem>
                            {isOwner && (
                              <>
                                <DropdownMenuItem>Редактировать</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setDeleteDialogOpen(true); setDeletePostId(post._id); }}>Удалить</DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="mb-2 whitespace-pre-line">{post.text}</div>
                    {post.image && <img src={post.image} alt="post" className="max-h-60 object-contain rounded" />}
                    <hr className="my-3" />
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <button
                        className={`text-pink-500 flex items-center gap-1 ${isLiked ? 'font-bold' : ''}`}
                        onClick={() => handleLikePost(post._id)}
                        disabled={!userId}
                      >
                        <span>❤</span> {post.likes?.length || 0}
                      </button>
                      <span>{format(new Date(post.createdAt), 'dd.MM', { locale: ru })} в {format(new Date(post.createdAt), 'HH:mm', { locale: ru })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
        {/* Правая колонка */}
        <aside className="hidden lg:flex flex-col w-64 border-l bg-white p-4 sm:p-6 gap-4 sm:gap-6 min-h-svh sticky top-0">
          <div>
            <div className="font-semibold text-base sm:text-lg mb-2">Мои подписки</div>
            {following.length === 0 ? (
              <div className="text-gray-500 text-sm">Вы ни на кого не подписаны.</div>
            ) : (
              <div className="flex flex-col gap-2 sm:gap-3">
                {following.map(user => (
                  <div key={user.username} className="flex items-center gap-1.5 sm:gap-2 group">
                    <Link to={`/u/users/${user.username}`} className="flex items-center gap-1.5 sm:gap-2 hover:underline flex-1 min-w-0">
                      <img src={user.profilePicture || ''} alt={user.name} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover" />
                      <span className="font-semibold truncate flex items-center gap-1 text-sm sm:text-base">
                        {user.name}
                        {user.userRole === "coach" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="text-xs sm:text-sm cursor-help">🏋️‍♂️</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Тренер</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </span>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-full hover:bg-gray-100 ml-1">
                          <EllipsisVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
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
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        isLoading={deleteLoading}
        onClose={() => { setDeleteDialogOpen(false); setDeletePostId(null); }}
        onConfirm={handleDeletePost}
        title="Вы уверены, что хотите удалить этот пост?"
        description="Это действие невозможно отменить. После удаления восстановить пост будет невозможно."
        confirmText="Удалить"
        cancelText="Отменить"
      />
    </>
  );
};

export default UserProfile; 