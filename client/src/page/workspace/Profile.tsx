import { useState } from "react";
import { useAuthContext } from "@/context/auth-provider";
import LogoutDialog from "@/components/asidebar/logout-dialog";
import { Button } from "@/components/ui/button";
import WorkspaceAnalytics from "@/components/workspace/workspace-analytics";

const Profile = () => {
  const { user } = useAuthContext();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  if (!user) return null;

  return (
    <main className="flex flex-1 flex-col py-4 md:pt-3">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Мой профиль</h2>
        </div>
      </div>
      <WorkspaceAnalytics />
      <div className="mt-4 w-full">
        <div className="w-full border rounded-lg p-6 bg-white flex flex-col items-start text-left shadow-sm">
          <div className="flex flex-row items-center gap-6 mb-4">
            <img
              src={user.profilePicture || ''}
              alt="Аватар"
              className="w-24 h-24 rounded-full border"
            />
            <div>
              <div className="text-xl font-semibold mb-1">{user.name}</div>
              <div className="text-gray-500">{user.email}</div>
            </div>
          </div>
        </div>
        <Button variant="default" className="mt-6" onClick={() => setIsLogoutOpen(true)}>
          Выйти из аккаунта
        </Button>
        <LogoutDialog isOpen={isLogoutOpen} setIsOpen={setIsLogoutOpen} />
      </div>
    </main>
  );
};

export default Profile; 