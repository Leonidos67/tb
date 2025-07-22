import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/context/auth-provider";
import CreateWorkspaceDialog from "@/components/workspace/create-workspace-dialog";
import CreateProjectDialog from "@/components/workspace/project/create-project-dialog";
import SocialHeader from "@/components/social-header";
import { SocialSidebarMenu } from "@/components/social-header";

const AppLayout = () => {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex h-screen min-h-screen w-full">
          {/* Левое меню соцсети */}
          <SocialSidebarMenu />
          {/* Основной layout */}
          <div className="flex-1 flex flex-col min-w-0">
            <SocialHeader />
            <div className="px-3 lg:px-20 py-3 flex-1 min-h-0">
              <Outlet />
            </div>
            <CreateWorkspaceDialog />
            <CreateProjectDialog />
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default AppLayout;
