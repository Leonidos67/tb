import { useEffect, useState } from "react";
import { getFeedQueryFn, likeUserPostMutationFn, deleteUserPostMutationFn, getFollowingQueryFn } from "@/lib/api";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import useAuth from "@/hooks/api/use-auth";
import SocialHeader, { SocialSidebarMenu } from "@/components/social-header";
import { EllipsisVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

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
  const [following, setFollowing] = useState<FollowingUser[]>([]);

  useEffect(() => {
    setLoading(true);
    getFeedQueryFn()
      .then((data) => setPosts(data.posts || []))
      .finally(() => setLoading(false));

    if (currentUser?.user?.username) {
      getFollowingQueryFn(currentUser.user.username)
        .then((data) => setFollowing(data.following || []))
        .catch(() => setFollowing([]));
    }
  }, [currentUser]);

  const handleLikePost = async (postId: string) => {
    const post = posts.find(p => p._id === postId);
    if (!userId || !post) return;
    const isLiked = post.likes && post.likes.includes(userId);
    await likeUserPostMutationFn(postId);
    setPosts(posts => posts.map(p =>
      p._id === postId
        ? {
            ...p,
            likes: isLiked
              ? (p.likes || []).filter(id => id !== userId)
              : [...(p.likes || []), userId]
          }
        : p
    ));
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Удалить пост?")) return;
    await deleteUserPostMutationFn(postId);
    setPosts(posts => posts.filter(p => p._id !== postId));
  };

  return (
    <>
      <SocialHeader />
      <div className="flex min-h-svh bg-muted">
        {/* Левая колонка */}
        <SocialSidebarMenu />
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
                  const isLiked = post.likes && userId ? post.likes.includes(userId) : false;
                  return (
                    <div key={post._id} className="p-4 border rounded bg-white relative">
                      <div className="flex items-center gap-3 mb-2">
                        <Link to={`/u/users/${post.author.username}`} className="flex items-center gap-2 hover:underline">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={post.author.profilePicture || ''} alt={post.author.name} />
                            <AvatarFallback>{post.author.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-semibold">{post.author.name}</span>
                          <span className="text-blue-600 font-mono">@{post.author.username}</span>
                        </Link>
                        <span className="text-xs text-gray-400 ml-auto">{new Date(post.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="mb-2 whitespace-pre-line">{post.text}</div>
                      {post.image && <img src={post.image} alt="post" className="max-h-60 object-contain rounded" />}
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          className={`text-pink-500 flex items-center gap-1 ${isLiked ? 'font-bold' : ''}`}
                          onClick={() => handleLikePost(post._id)}
                          disabled={!userId}
                        >
                          <span>❤</span> {post.likes?.length || 0}
                        </button>
                        {isOwner && (
                          <button className="text-red-500 ml-2" onClick={() => handleDeletePost(post._id)}>
                            Удалить
                          </button>
                        )}
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