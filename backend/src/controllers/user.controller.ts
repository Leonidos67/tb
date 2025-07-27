import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { getCurrentUserService } from "../services/user.service";
import UserModel, { FollowerModel, PostModel } from "../models/user.model";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { user } = await getCurrentUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User fetch successfully",
      user,
    });
  }
);

export const onboardingUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { answer } = req.body;
    if (!answer) {
      return res.status(400).json({ message: "Answer is required" });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isNewUser = false;
    user.onboardingAnswer = answer;
    await user.save();
    return res.status(200).json({ message: "Onboarding complete" });
  }
);

export const updateProfilePictureController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { profilePicture } = req.body;
    if (!profilePicture) {
      return res.status(400).json({ message: "profilePicture is required" });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.profilePicture = profilePicture;
    await user.save();
    return res.status(200).json({ message: "Profile picture updated", profilePicture });
  }
);

export const setUsernameController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "username is required" });
    }
    // Проверка на уникальность
    const existing = await UserModel.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "Username уже занят" });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.username = username.toLowerCase().trim();
    await user.save();
    return res.status(200).json({ message: "Username установлен", username: user.username });
  }
);

export const getPublicUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ message: "username is required" });
    }
    const user = await UserModel.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      name: user.name,
      username: user.username,
      profilePicture: user.profilePicture,
      userRole: user.userRole, // Добавляем информацию о роли
      // email: user.email, // если нужно показывать email
    });
  }
);

// Получить подписчиков пользователя
export const getFollowersController = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;
  const user = await UserModel.findOne({ username: username.toLowerCase().trim() });
  if (!user) return res.status(404).json({ message: "User not found" });
  const followers = await FollowerModel.find({ following: user._id }).populate({ path: "follower", select: "username name profilePicture userRole" });
  return res.status(200).json({ followers: followers.map((f: any) => f.follower) });
});

// Получить на кого подписан пользователь
export const getFollowingController = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;
  const user = await UserModel.findOne({ username: username.toLowerCase().trim() });
  if (!user) return res.status(404).json({ message: "User not found" });
  const following = await FollowerModel.find({ follower: user._id }).populate({ path: "following", select: "username name profilePicture userRole" });
  return res.status(200).json({ following: following.map((f: any) => f.following) });
});

// Подписаться на пользователя
export const followUserController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { username } = req.params;
  const userToFollow = await UserModel.findOne({ username: username.toLowerCase().trim() });
  if (!userToFollow) return res.status(404).json({ message: "User not found" });
  if ((userToFollow._id as any).equals(userId)) return res.status(400).json({ message: "Нельзя подписаться на себя" });
  const exists = await FollowerModel.findOne({ follower: userId, following: userToFollow._id });
  if (exists) return res.status(409).json({ message: "Вы уже подписаны" });
  await FollowerModel.create({ follower: userId, following: userToFollow._id });
  return res.status(200).json({ message: "Вы подписались" });
});

// Отписаться от пользователя
export const unfollowUserController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { username } = req.params;
  const userToUnfollow = await UserModel.findOne({ username: username.toLowerCase().trim() });
  if (!userToUnfollow) return res.status(404).json({ message: "User not found" });
  await FollowerModel.deleteOne({ follower: userId, following: userToUnfollow._id });
  return res.status(200).json({ message: "Вы отписались" });
});

export const getAllUsersController = asyncHandler(async (req: Request, res: Response) => {
  const users = await UserModel.find({}, "name username profilePicture");
  return res.status(200).json({ users });
});

// Поиск пользователей по имени
export const searchUsersController = asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.query;
  
  if (!query || typeof query !== 'string') {
    return res.status(200).json({ users: [] });
  }

  const users = await UserModel.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { username: { $regex: query, $options: 'i' } }
    ]
  }, "name username profilePicture userRole").limit(10);

  return res.status(200).json({ users });
});

// Получить посты пользователя
export const getUserPostsController = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;
  const user = await UserModel.findOne({ username: username.toLowerCase().trim() });
  if (!user) return res.status(404).json({ message: "User not found" });
  const posts = await PostModel.find({ author: user._id }).sort({ createdAt: -1 });
  return res.status(200).json({ posts });
});

// Создать пост
export const createPostController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { text, image } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ message: "Текст обязателен" });
  }
  const post = await PostModel.create({ author: userId, text, image });
  return res.status(201).json({ post });
});

// Удалить пост
export const deletePostController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { postId } = req.params;
  const post = await PostModel.findById(postId);
  if (!post) return res.status(404).json({ message: "Пост не найден" });
  if (!post.author.equals(userId)) return res.status(403).json({ message: "Нет прав на удаление" });
  await post.deleteOne();
  return res.status(200).json({ message: "Пост удалён" });
});

// Лайк/дизлайк поста
export const likePostController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { postId } = req.params;
  const post = await PostModel.findById(postId);
  if (!post) return res.status(404).json({ message: "Пост не найден" });
  const liked = post.likes.some((id: any) => id.equals(userId));
  if (liked) {
    post.likes = post.likes.filter((id: any) => !id.equals(userId));
  } else {
    post.likes.push(userId);
  }
  await post.save();
  return res.status(200).json({ liked: !liked, likesCount: post.likes.length });
});

// Лента новостей (все посты)
export const getFeedController = asyncHandler(async (req: Request, res: Response) => {
  const posts = await PostModel.find({})
    .sort({ createdAt: -1 })
    .populate("author", "username name profilePicture userRole");
  return res.status(200).json({ posts });
});
