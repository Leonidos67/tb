import { PermissionType } from "@/constant";
import { UserType, WorkspaceWithMembersType } from "@/types/api.type";
import { useEffect, useMemo, useState } from "react";

const usePermissions = (
  user: UserType | undefined,
  workspace: WorkspaceWithMembersType | undefined
) => {
  const [permissions, setPermissions] = useState<PermissionType[]>([]);

  useEffect(() => {
    if (!user || !workspace) {
      setPermissions([]);
      return;
    }

    const member = workspace.members?.find(
      (member) => member.userId === user._id
    );

    const perms = (member && member.role && Array.isArray(member.role.permissions))
      ? (member.role.permissions as PermissionType[])
      : [];

    setPermissions(perms);
  }, [user, workspace]);

  return useMemo(() => permissions, [permissions]);
};

export default usePermissions;
