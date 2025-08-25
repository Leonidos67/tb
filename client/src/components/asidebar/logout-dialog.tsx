import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import useAuth from "@/hooks/api/use-auth";

const LogoutDialog = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Redirect to login page
    window.location.href = "/";
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите выйти из аккаунта?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout}>
            Выйти
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutDialog;
