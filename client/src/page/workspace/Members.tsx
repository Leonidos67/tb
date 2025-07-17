import { Separator } from "@/components/ui/separator";
import InviteMember from "@/components/workspace/member/invite-member";
import AllMembers from "@/components/workspace/member/all-members";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";

export default function Members() {
  return (
    <div className="w-full h-full flex-col space-y-8 pt-3">
      <WorkspaceHeader />
      <Separator className="my-4 " />
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Участники</h2>
          <p className="text-muted-foreground">
            Участники рабочей области могут просматривать все проекты и задачи рабочей области 
            и присоединяться к ним, а также создавать новые задачи в рабочей области.
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <InviteMember />
      <Separator className="my-4 !h-[0.5px]" />
      <AllMembers />
    </div>
  );
}
