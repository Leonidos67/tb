import { ErrorCodeEnum } from "../enums/error-code.enum";
import { Roles, RoleType } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import WorkspaceModel from "../models/workspace.model";
import UserModel from "../models/user.model";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError";

export const getMemberRoleInWorkspace = async (
  userId: string,
  workspaceId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const member = await MemberModel.findOne({
    userId,
    workspaceId,
  }).populate("role");

  if (!member) {
    throw new UnauthorizedException(
      "You are not a member of this workspace",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED
    );
  }

  let roleName = member.role?.name as RoleType | undefined;

  // Fallback: если у участника не установлена роль или значение невалидно, даём роль MEMBER
  if (!roleName || !Object.prototype.hasOwnProperty.call(Roles, roleName)) {
    roleName = Roles.MEMBER;
  }

  return { role: roleName };
};

export const joinWorkspaceByInviteService = async (
  userId: string,
  inviteCode: string
) => {
  // Find workspace by invite code
  const workspace = await WorkspaceModel.findOne({ inviteCode }).exec();
  if (!workspace) {
    throw new NotFoundException("Invalid invite code or workspace not found");
  }

  // Check if user is already a member
  const existingMember = await MemberModel.findOne({
    userId,
    workspaceId: workspace._id,
  }).exec();

  if (existingMember) {
    throw new BadRequestException("You are already a member of this workspace");
  }

  const role = await RoleModel.findOne({ name: Roles.MEMBER });

  if (!role) {
    throw new NotFoundException("Role not found");
  }

  // Add user to workspace as a member
  const newMember = new MemberModel({
    userId,
    workspaceId: workspace._id,
    role: role._id,
  });
  await newMember.save();

  // Устанавливаем роль пользователя как "athlete" для тех, кто приходит по приглашению
  await UserModel.findByIdAndUpdate(userId, {
    userRole: "athlete",
    isNewUser: false, // Убираем флаг нового пользователя
  });

  return { workspaceId: workspace._id, role: role.name };
};
