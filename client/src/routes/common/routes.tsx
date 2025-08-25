import GoogleOAuthFailure from "@/page/auth/GoogleOAuthFailure";
import SignIn from "@/page/auth/Sign-in";
import SignUp from "@/page/auth/Sign-up";
import WorkspaceDashboard from "@/page/workspace/Dashboard";
import Members from "@/page/workspace/Members";
import ProjectDetails from "@/page/workspace/ProjectDetails";
import Settings from "@/page/workspace/Settings";
import GeneralSettings from "@/page/workspace/GeneralSettings";
import Notifications from "@/page/workspace/Notifications";
import UserGuide from "@/page/workspace/UserGuide";
import Tasks from "@/page/workspace/Tasks";
import Profile from "@/page/workspace/Profile";
import Usage from "@/page/workspace/Usage";
import CompletedTasks from "@/page/workspace/CompletedTasks";
import CreateWebsite from "@/page/website/CreateWebsite";
import { AUTH_ROUTES, BASE_ROUTE, PROTECTED_ROUTES } from "./routePaths";
import InviteUser from "@/page/invite/InviteUser";
import UsersListPage from "@/page/users/UsersList";
import UserProfile from "@/page/users/Profile";
import SocialMainPage from "@/page/users/index";
import PublicWebsitePage from "@/page/website/PublicWebsite";
import AiAssistant from "@/page/ai/Assistant";
import PaymentSuccess from "@/page/payment/PaymentSuccess";

export const authenticationRoutePaths = [
  { path: AUTH_ROUTES.SIGN_IN, element: <SignIn /> },
  { path: AUTH_ROUTES.SIGN_UP, element: <SignUp /> },
  { path: AUTH_ROUTES.GOOGLE_OAUTH_CALLBACK, element: <GoogleOAuthFailure /> },
];

export const protectedRoutePaths = [
  { path: PROTECTED_ROUTES.WORKSPACE, element: <WorkspaceDashboard /> },
  { path: PROTECTED_ROUTES.TASKS, element: <Tasks /> },
  { path: PROTECTED_ROUTES.MEMBERS, element: <Members /> },
  { path: PROTECTED_ROUTES.SETTINGS, element: <Settings /> },
  { path: PROTECTED_ROUTES.GENERAL_SETTINGS, element: <GeneralSettings /> },
  { path: PROTECTED_ROUTES.NOTIFICATIONS, element: <Notifications /> },
  { path: PROTECTED_ROUTES.USER_GUIDE, element: <UserGuide /> },
  { path: PROTECTED_ROUTES.PROJECT_DETAILS, element: <ProjectDetails /> },
  { path: PROTECTED_ROUTES.PROFILE, element: <Profile /> },
  { path: PROTECTED_ROUTES.REQUISITES, element: <Profile /> },
  { path: PROTECTED_ROUTES.USAGE, element: <Usage /> },
  { path: PROTECTED_ROUTES.COMPLETED, element: <CompletedTasks /> },
  { path: PROTECTED_ROUTES.CREATE_WEBSITE, element: <CreateWebsite /> },
  { path: PROTECTED_ROUTES.AI, element: <AiAssistant /> },
];

export const baseRoutePaths = [
  { path: BASE_ROUTE.INVITE_URL, element: <InviteUser /> },
  { path: BASE_ROUTE.PAYMENT_SUCCESS, element: <PaymentSuccess /> },
  { path: "/u/", element: <SocialMainPage /> },
  { path: "/u/users", element: <UsersListPage /> },
  { path: "/u/users/:username", element: <UserProfile /> },
  { path: "/web/:username", element: <PublicWebsitePage /> },
];
