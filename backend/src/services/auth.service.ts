import { UserModel } from "../models/user.model";
import { WorkspaceModel } from "../models/workspace.model";
import { MemberModel } from "../models/member.model";
import { AccountModel } from "../models/account.model";
import { RolesEnum } from "../enums/role.enum";
import { NotFoundException, BadRequestException } from "../utils/appError";
import { ProviderEnum } from "../enums/account-provider.enum";
import { hashPassword } from "../utils/bcrypt";
import mongoose from "mongoose";

export const loginOrCreateAccountService = async (data: {
  provider: string;
  displayName: string;
  providerId: string;
  picture?: string;
  email?: string;
}) => {
  const { providerId, provider, displayName, email, picture } = data;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    console.log("Started Session...");

    let user = await UserModel.findOne({ email }).session(session);

    if (!user) {
      // Create a new user if it doesn't exist
      user = new UserModel({
        email,
        name: displayName,
        profilePicture: picture || null,
      });
      await user.save({ session });

      const account = new AccountModel({
        userId: user._id,
        provider: provider,
        providerId: providerId,
      });
      await account.save({ session });

      // 3. Create a new workspace for the new user
      const workspace = new WorkspaceModel({
        name: `Мое первое рабочее пространство`,
        description: `Данная зона создана пользователем ${user.name}`,
        owner: user._id,
      });
      await workspace.save({ session });

      const ownerRole = await RoleModel.findOne({
        name: Roles.OWNER,
      }).session(session);

      if (!ownerRole) {
        throw new NotFoundException("Роль владельца не найдена");
      }

      const member = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
        joinedAt: new Date(),
      });
      await member.save({ session });

      user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
      await user.save({ session });
    }
    await session.commitTransaction();
    session.endSession();
    console.log("End Session...");

    return { user };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
};

export const registerUserService = async (userData: {
  name: string;
  email: string;
  password: string;
}) => {
  const session = await UserModel.startSession();
  session.startTransaction();

  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new BadRequestException("Данный адрес электронной почты уже существует");
    }

    // Create user
    const user = new UserModel({
      name: userData.name,
      email: userData.email,
      password: await hashPassword(userData.password),
    });

    await user.save({ session });

    // Create workspace
    const workspace = new WorkspaceModel({
      name: `${userData.name} Workspace`,
      description: "Default workspace",
      owner: user._id,
    });

    await workspace.save({ session });

    // Add user as member with OWNER role
    const member = new MemberModel({
      user: user._id,
      workspace: workspace._id,
      role: RolesEnum.OWNER,
    });

    await member.save({ session });

    // Update user with current workspace
    user.currentWorkspace = workspace._id;
    await user.save({ session });

    await session.commitTransaction();
    return { userId: user._id, workspaceId: workspace._id };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const createOrUpdateGoogleUser = async (profile: any) => {
  const session = await UserModel.startSession();
  session.startTransaction();

  try {
    const email = profile.emails[0].value;
    let user = await UserModel.findOne({ email });

    if (!user) {
      // Create new user
      user = new UserModel({
        name: profile.displayName,
        email: email,
        profilePicture: profile.photos?.[0]?.value,
        isActive: true,
      });

      await user.save({ session });

      // Create workspace
      const workspace = new WorkspaceModel({
        name: `${profile.displayName} Workspace`,
        description: "Default workspace",
        owner: user._id,
      });

      await workspace.save({ session });

      // Add user as member with OWNER role
      const member = new MemberModel({
        user: user._id,
        workspace: workspace._id,
        role: RolesEnum.OWNER,
      });

      await member.save({ session });

      // Update user with current workspace
      user.currentWorkspace = workspace._id;
      await user.save({ session });

      await session.commitTransaction();
      return { user, workspaceId: workspace._id };
    } else {
      // Update existing user
      user.name = profile.displayName;
      if (profile.photos?.[0]?.value) {
        user.profilePicture = profile.photos[0].value;
      }
      await user.save({ session });

      await session.commitTransaction();
      return { user, workspaceId: user.currentWorkspace };
    }
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const verifyUserService = async ({
  email,
  password,
  provider = ProviderEnum.EMAIL,
}: {
  email: string;
  password: string;
  provider?: string;
}) => {
  const account = await AccountModel.findOne({ provider, providerId: email });
  if (!account) {
    throw new NotFoundException("Неверный адрес электронной почты или пароль");
  }

  const user = await UserModel.findById(account.userId);

  if (!user) {
    throw new NotFoundException("Пользователь не найден");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedException("Неверный адрес электронной почты или пароль");
  }

  return user.omitPassword();
};

export const updateUserRoleService = async (userId: string, userRole: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundException("Пользователь не найден");
  }

  user.userRole = userRole;
  await user.save();

  return user;
};
