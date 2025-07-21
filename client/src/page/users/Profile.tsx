import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Loader } from "lucide-react";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/api/use-auth";
import { getFollowersQueryFn, followUserMutationFn, unfollowUserMutationFn } from "@/lib/api";
import { getUserPostsQueryFn, createUserPostMutationFn, deleteUserPostMutationFn, likeUserPostMutationFn } from "@/lib/api";
import { ConfirmDialog } from "@/components/resuable/confirm-dialog";

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
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postLoading, setPostLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      await createUserPostMutationFn(username!, { text: postText, image: postImage });
      setPostText("");
      setPostImage(null);
      // Обновить ленту
      const data = await getUserPostsQueryFn(username!);
      setPosts(data.posts || []);
    } finally {
      setPostLoading(false);
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
                <>
                  <Button className="mt-4">Редактировать профиль</Button>
                  <form onSubmit={handleCreatePost} className="w-full flex flex-col gap-2 mt-6 p-4 border rounded bg-gray-50">
                    <textarea
                      className="border rounded p-2 resize-none"
                      rows={3}
                      placeholder="Что нового?"
                      value={postText}
                      onChange={e => setPostText(e.target.value)}
                      disabled={postLoading}
                    />
                    <input type="file" accept="image/*" onChange={handleImageChange} disabled={postLoading} />
                    {postImage && <img src={postImage} alt="preview" className="max-h-40 object-contain rounded" />}
                    <Button type="submit" disabled={postLoading || !postText.trim()} className="self-end">Опубликовать</Button>
                  </form>
                </>
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
                <div className="font-semibold mb-2">Подписчики: {followers.length}</div>
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
      <div className="mt-8 w-full">
        <div className="font-semibold mb-2">Посты:</div>
        {posts.length === 0 && <div className="text-gray-400">Нет постов</div>}
        <div className="flex flex-col gap-4">
          {posts.map(post => {
            const isOwner = currentUser?.user?._id && post.author === currentUser.user._id;
            const isLiked = post.likes && userId ? post.likes.includes(userId) : false;
            return (
              <div key={post._id} className="p-4 border rounded bg-white relative">
                <div className="mb-2 text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
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
                    <button className="text-red-500 ml-2" onClick={() => { setDeleteDialogOpen(true); setDeletePostId(post._id); }}>
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        isLoading={deleteLoading}
        onClose={() => { setDeleteDialogOpen(false); setDeletePostId(null); }}
        onConfirm={handleDeletePost}
        title="Удаление поста"
        description="Вы действительно хотите удалить этот пост? Это действие невозможно отменить."
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};

export default UserProfile; 