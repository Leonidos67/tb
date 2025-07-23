import { useEffect, useState } from "react";
import { getFeedQueryFn, likeUserPostMutationFn, deleteUserPostMutationFn, getFollowingQueryFn, createUserPostMutationFn, followUserMutationFn, unfollowUserMutationFn } from "@/lib/api";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import useAuth from "@/hooks/api/use-auth";
import SocialHeader, { SocialSidebarMenu } from "@/components/social-header";
import { EllipsisVertical, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/resuable/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postLoading, setPostLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState<string | null>(null);

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

  const handleDeletePost = async () => {
    if (!deletePostId) return;
    setDeleteLoading(true);
    await deleteUserPostMutationFn(deletePostId);
    setPosts(posts => posts.filter(p => p._id !== deletePostId));
    setDeleteLoading(false);
    setDeleteDialogOpen(false);
    setDeletePostId(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPostImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) return;
    setPostLoading(true);
    try {
      await createUserPostMutationFn(postText, { text: postText, image: postImage });
      setPostText("");
      setPostImage(null);
      setCreateDialogOpen(false);
      // Обновить ленту
      setLoading(true);
      getFeedQueryFn()
        .then((data) => setPosts(data.posts || []))
        .finally(() => setLoading(false));
    } finally {
      setPostLoading(false);
    }
  };

  const handleFollow = async (username: string) => {
    setFollowLoading(username);
    try {
      await followUserMutationFn(username);
      setFollowing(f => [...f, { username, name: '', profilePicture: null }]);
    } finally {
      setFollowLoading(null);
    }
  };
  const handleUnfollow = async (username: string) => {
    setFollowLoading(username);
    try {
      await unfollowUserMutationFn(username);
      setFollowing(f => f.filter(u => u.username !== username));
    } finally {
      setFollowLoading(null);
    }
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
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white font-semibold hover:bg-gray-900 transition w-full justify-center"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-5 h-5" />
              Создать пост
            </button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Создать пост</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
                  <textarea
                    className="border rounded p-2 resize-none"
                    rows={3}
                    placeholder="Текст поста..."
                    value={postText}
                    onChange={e => setPostText(e.target.value)}
                    disabled={postLoading}
                  />
                  <input type="file" accept="image/*" onChange={handleImageChange} disabled={postLoading} />
                  {postImage && <img src={postImage} alt="preview" className="max-h-40 object-contain rounded" />}
                  <DialogFooter>
                    <Button type="submit" disabled={postLoading || !postText.trim()} className="w-full">
                      {postLoading ? "Публикуем..." : "Опубликовать"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <div className="mt-0 flex flex-col gap-4">
              {loading ? (
                <div className="text-center text-gray-400">Загрузка...</div>
              ) : posts.length === 0 ? (
                <div className="text-center text-gray-400">Авторизуйтесь, чтобы просматривать посты пользователей</div>
              ) : (
                posts.map(post => {
                  const isOwner = userId && post.author._id === userId;
                  const isLiked = post.likes && userId ? post.likes.includes(userId) : false;
                  const isFollowing = following.some(f => f.username === post.author.username);
                  return (
                    <div key={post._id} className="p-4 border rounded bg-white relative">
                      <div className="flex items-start gap-3 mb-2">
                        <Link to={`/u/users/${post.author.username}`} className="flex items-center gap-2 hover:underline">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={post.author.profilePicture || ''} alt={post.author.name} />
                            <AvatarFallback>{post.author.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-semibold">{post.author.name}</span>
                        </Link>
                        {userId && post.author._id !== userId && (
                          <div className="ml-2 flex items-center">
                            {isFollowing ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={followLoading === post.author.username}
                                onClick={() => handleUnfollow(post.author.username)}
                                className="ml-2"
                              >
                                {followLoading === post.author.username ? '...' : 'Отписаться'}
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                disabled={followLoading === post.author.username}
                                onClick={() => handleFollow(post.author.username)}
                                className="ml-2 bg-black hover:bg-gray-900"
                              >
                                {followLoading === post.author.username ? '...' : 'Подписаться'}
                              </Button>
                            )}
                          </div>
                        )}
                        <div className="ml-auto">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 rounded-full hover:bg-gray-100">
                                <EllipsisVertical className="w-5 h-5 text-gray-500" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/u/users/${post.author.username}`}>Перейти в профиль</Link>
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
                      <div className="flex items-center gap-3 mt-2">
                        {isOwner && (
                          <button className="text-red-500 ml-2" onClick={() => { setDeleteDialogOpen(true); setDeletePostId(post._id); }}>
                            Удалить
                          </button>
                        )}
                      </div>
                      <hr className="my-3" />
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <button
                          className={`text-pink-500 flex items-center gap-1 ${isLiked ? 'font-bold' : ''}`}
                          onClick={() => handleLikePost(post._id)}
                          disabled={!userId}
                        >
                          <span>❤</span> {post.likes?.length || 0}
                        </button>
                        <span>{format(new Date(post.createdAt), 'dd.MM HH:mm', { locale: ru })}</span>
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

export default SocialMainPage; 