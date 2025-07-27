"use client";

import {
  LucideIcon,
  // Settings,
  Users,
  CheckCircle,
  LayoutDashboard,
  // Archive as ArchiveIcon,
  Flame,
  // Bell,
  // TrendingUp,
  User,
  // BookOpen,
} from "lucide-react";
import {
  SidebarGroup,
  // SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
// import { Permissions } from "@/constant";
// import { Separator } from "@/components/ui/separator";

type ItemType = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export function NavMain() {
  const { user } = useAuthContext();
  const workspaceId = useWorkspaceId();
  const location = useLocation();

  const pathname = location.pathname;
  const isCoach = user?.userRole === "coach";

  const mainItems: ItemType[] = [
    {
      title: "Главная",
      url: `/workspace/${workspaceId}`,
      icon: LayoutDashboard,
    },
    {
      title: "Мой профиль",
      url: `/workspace/${workspaceId}/profile`,
      icon: User,
    },
    // Показываем "Мои спортсмены" только тренерам
    ...(isCoach ? [{
      title: "Мои спортсмены",
      url: `/workspace/${workspaceId}/members`,
      icon: Users,
    }] : []),
    {
      title: "Все тренировки",
      url: `/workspace/${workspaceId}/tasks`,
      icon: Flame,
    },
    {
      title: "Выполненные",
      url: `/workspace/${workspaceId}/completed`,
      icon: CheckCircle,
    },
    // {
    //   title: "Моя активность",
    //   url: `/workspace/${workspaceId}/progress`,
    //   icon: TrendingUp,
    // },
    // {
    //   title: "Архив",
    //   url: `/workspace/${workspaceId}/archive`,
    //   icon: ArchiveIcon,
    // },
  ];
  // const bottomItems: ItemType[] = [
  //   {
  //     title: "Уведомления",
  //     url: `/workspace/${workspaceId}/notifications`,
  //     icon: Bell,
  //   },
  //   {
  //     title: "Руководство по использованию",
  //     url: `/workspace/${workspaceId}/usage`,
  //     icon: BookOpen,
  //   },
  //   ...(canManageSettings
  //     ? [
  //         {
  //           title: "Настройки",
  //           url: `/workspace/${workspaceId}/settings`,
  //           icon: Settings,
  //         },
  //       ]
  //     : []),
  // ];
  return (
    <SidebarGroup className="h-auto">
      <SidebarMenu>
        {mainItems.slice(0, 3).map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton isActive={item.url === pathname} asChild>
              <Link to={item.url} className="!text-[15px]">
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        {/* <Separator className="my-2" />
        <SidebarGroupLabel>Тренировки</SidebarGroupLabel> */}
        {mainItems.slice(3).map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton isActive={item.url === pathname} asChild>
              <Link to={item.url} className="!text-[15px]">
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        {/* <Separator className="my-2" /> */}
        {/* <SidebarGroupLabel>Система</SidebarGroupLabel> */}
        {/* {bottomItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton isActive={item.url === pathname} asChild>
              <Link to={item.url} className="!text-[15px]">
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))} */}
      </SidebarMenu>
    </SidebarGroup>
  );
}
