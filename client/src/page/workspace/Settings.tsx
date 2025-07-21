import { Separator } from "@/components/ui/separator";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";
import EditWorkspaceForm from "@/components/workspace/edit-workspace-form";
import DeleteWorkspaceCard from "@/components/workspace/settings/delete-workspace-card";
import { Permissions } from "@/constant";
import withPermission from "@/hoc/with-permission";

const Settings = () => {
  return (
    <main className="flex flex-1 flex-col py-4 md:pt-3">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Настройки</h2>
        </div>
      </div>
      <WorkspaceHeader />
      <Separator className="my-4" />
      <div className="w-full py-3">
        <div className="flex flex-col pt-0.5 px-0 ">
          <div className="pt-2">
            <EditWorkspaceForm />
          </div>
          <div className="pt-2">
            <DeleteWorkspaceCard />
          </div>
        </div>
      </div>
    </main>
  );
};

const SettingsWithPermission = withPermission(
  Settings,
  Permissions.MANAGE_WORKSPACE_SETTINGS
);

export default SettingsWithPermission;
