import { createBrowserRouter } from "react-router-dom";
import { QueryProvider } from "@/context/query-provider";
import { ThemeProvider } from "@/context/theme-provider";
import { AuthProvider } from "@/context/auth-provider";
import ProtectedRoute from "./protected.route";
import BaseLayout from "@/layout/base.layout";
import AppLayout from "@/layout/app.layout";

// Auth pages
import SignIn from "@/page/auth/Sign-in";
import SignUp from "@/page/auth/Sign-up";
import GoogleOAuthFailure from "@/page/auth/GoogleOAuthFailure";

// Error pages
import NotFound from "@/page/errors/NotFound";

// User pages
import UsersList from "@/page/users/UsersList";
import Profile from "@/page/users/Profile";

// Workspace pages
import Dashboard from "@/page/workspace/Dashboard";
import Tasks from "@/page/workspace/Tasks";
import Projects from "@/page/workspace/ProjectDetails";
import Members from "@/page/workspace/Members";
import Settings from "@/page/workspace/Settings";
import GeneralSettings from "@/page/workspace/GeneralSettings";
import Notifications from "@/page/workspace/Notifications";
import Usage from "@/page/workspace/Usage";
import UserGuide from "@/page/workspace/UserGuide";
import CompletedTasks from "@/page/workspace/CompletedTasks";

// Payment pages
import PaymentSuccess from "@/page/payment/PaymentSuccess";

// Invite pages
import InviteUser from "@/page/invite/InviteUser";

// AI pages
import Assistant from "@/page/ai/Assistant";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>
            <BaseLayout />
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    ),
    children: [
      {
        index: true,
        element: <SignIn />,
      },
      {
        path: "sign-in",
        element: <SignIn />,
      },
      {
        path: "sign-up",
        element: <SignUp />,
      },
      {
        path: "google-oauth-failure",
        element: <GoogleOAuthFailure />,
      },
      {
        path: "workspace/:workspaceId/google-oauth-callback",
        element: <GoogleOAuthFailure />,
      },
      {
        path: "payment/success",
        element: <PaymentSuccess />,
      },
      {
        path: "invite/:inviteCode",
        element: <InviteUser />,
      },
      {
        path: "ai",
        element: (
          <ProtectedRoute>
            <Assistant />
          </ProtectedRoute>
        ),
      },
      {
        path: "workspace/:workspaceId",
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "tasks",
            element: <Tasks />,
          },
          {
            path: "projects",
            element: <Projects />,
          },
          {
            path: "members",
            element: <Members />,
          },
          {
            path: "settings",
            element: <Settings />,
          },
          {
            path: "general-settings",
            element: <GeneralSettings />,
          },
          {
            path: "notifications",
            element: <Notifications />,
          },
          {
            path: "usage",
            element: <Usage />,
          },
          {
            path: "user-guide",
            element: <UserGuide />,
          },
          {
            path: "completed-tasks",
            element: <CompletedTasks />,
          },
        ],
      },
      {
        path: "users",
        element: (
          <ProtectedRoute>
            <UsersList />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
