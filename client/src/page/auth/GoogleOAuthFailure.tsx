import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const GoogleOAuthFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const status = searchParams.get('status');

  useEffect(() => {
    // If we have a token, save it and redirect to workspace
    if (token && status !== 'failure') {
      localStorage.setItem('authToken', token);
      
      // Extract workspace ID from URL path
      const pathParts = window.location.pathname.split('/');
      const workspaceIndex = pathParts.findIndex(part => part === 'workspace');
      
      if (workspaceIndex !== -1 && pathParts[workspaceIndex + 1]) {
        const workspaceId = pathParts[workspaceIndex + 1];
        navigate(`/workspace/${workspaceId}`);
      } else {
        // If no workspace ID in path, redirect to home
        navigate('/');
      }
    }
  }, [token, status, navigate]);

  // If we have a token, show loading
  if (token && status !== 'failure') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="text-center">
          <h1>Авторизация...</h1>
          <p>Перенаправление в рабочее пространство...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="https://t-sync.ru"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo />
          T-Sync.
        </Link>
        <div className="flex flex-col gap-6"></div>
      </div>
      <Card>
        <CardContent>
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Ошибка входа</h1>
            <p>Мы не смогли зарегистрировать вас в Google. Пожалуйста, попробуйте снова.</p>

            <Button onClick={() => navigate("/")} style={{ marginTop: "20px" }}>
              Вернуться к входу
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleOAuthFailure;
