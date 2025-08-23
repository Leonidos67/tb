import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AuthProvider } from "@/context/auth-provider";
import Asidebar from "@/components/asidebar/asidebar";
import CreateWorkspaceDialog from "@/components/workspace/create-workspace-dialog";
import CreateProjectDialog from "@/components/workspace/project/create-project-dialog";
import Header from "@/components/header";
import AiFab from "@/components/ai/ai-fab";
import SelectionAsk from "@/components/ai/selection-ask";

const AppLayout = () => {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex h-screen min-h-screen w-full bg-background main-content">
          <Asidebar />
          <SidebarInset className="overflow-x-hidden flex-1 bg-background relative main-content">
            <div className="w-full h-full bg-background relative z-10 pointer-events-auto main-content">
              <Header />
              <div className="px-3 lg:px-20 py-0 bg-background relative z-10 pointer-events-auto min-h-0 main-content">
                <Outlet />
              </div>
              <CreateWorkspaceDialog />
              <CreateProjectDialog />
              <AiFab />
              <SelectionAsk />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default AppLayout;
