"use client";

import * as React from "react";
import {
  LucideIcon,
  // Settings,
  // Users,
  // CheckCircle,
  // Archive as ArchiveIcon,
  // Flame,
  // Bell,
  // TrendingUp,
  // User,
  // BookOpen,
} from "lucide-react";
import { AnimatedLayoutGrid } from "@/components/ui/motion/AnimatedLayoutGrid";
import { AnimatedUser } from "@/components/ui/motion/AnimatedUser";
import { AnimatedUsers } from "@/components/ui/motion/AnimatedUsers";
import { AnimatedFlame } from "@/components/ui/motion/AnimatedFlame";
import { AnimatedCheckCheck } from "@/components/ui/motion/AnimatedCheckCheck";
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
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  isAnimated?: boolean;
};

export function NavMain() {
  const { user } = useAuthContext();
  const workspaceId = useWorkspaceId();
  const location = useLocation();
  const [isHomeAnimating, setIsHomeAnimating] = React.useState(false);
  const [isProfileAnimating, setIsProfileAnimating] = React.useState(false);
  const [isMembersAnimating, setIsMembersAnimating] = React.useState(false);
  const [isTasksAnimating, setIsTasksAnimating] = React.useState(false);
  const [isCompletedAnimating, setIsCompletedAnimating] = React.useState(false);

  const pathname = location.pathname;
  const isCoach = user?.userRole === "coach";

  const mainItems: ItemType[] = [
    {
      title: "Главная",
      url: `/workspace/${workspaceId}`,
      icon: AnimatedLayoutGrid,
      isAnimated: true,
    },
    {
      title: "Мой профиль",
      url: `/workspace/${workspaceId}/profile`,
      icon: AnimatedUser,
      isAnimated: true,
    },
    // Показываем "Мои спортсмены" только тренерам
    ...(isCoach ? [{
      title: "Мои спортсмены",
      url: `/workspace/${workspaceId}/members`,
      icon: AnimatedUsers,
      isAnimated: true,
    }] : []),
    {
      title: "Все тренировки",
      url: `/workspace/${workspaceId}/tasks`,
      icon: AnimatedFlame,
      isAnimated: true,
    },
    {
      title: "Выполненные",
      url: `/workspace/${workspaceId}/completed`,
      icon: AnimatedCheckCheck,
      isAnimated: true,
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
        {mainItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton 
              isActive={item.url === pathname} 
              asChild
              onMouseEnter={() => {
                if (item.title === "Главная") {
                  setIsHomeAnimating(true);
                } else if (item.title === "Мой профиль") {
                  setIsProfileAnimating(true);
                } else if (item.title === "Мои спортсмены") {
                  setIsMembersAnimating(true);
                } else if (item.title === "Все тренировки") {
                  setIsTasksAnimating(true);
                } else if (item.title === "Выполненные") {
                  setIsCompletedAnimating(true);
                }
              }}
              onMouseLeave={() => {
                if (item.title === "Главная") {
                  setIsHomeAnimating(false);
                } else if (item.title === "Мой профиль") {
                  setIsProfileAnimating(false);
                } else if (item.title === "Мои спортсмены") {
                  setIsMembersAnimating(false);
                } else if (item.title === "Все тренировки") {
                  setIsTasksAnimating(false);
                } else if (item.title === "Выполненные") {
                  setIsCompletedAnimating(false);
                }
              }}
            >
              <Link to={item.url} className="!text-[15px]">
                {item.title === "Главная" && <AnimatedLayoutGrid isAnimating={isHomeAnimating} />}
                {item.title === "Мой профиль" && <AnimatedUser isAnimating={isProfileAnimating} />}
                {item.title === "Мои спортсмены" && <AnimatedUsers isAnimating={isMembersAnimating} />}
                {item.title === "Все тренировки" && <AnimatedFlame isAnimating={isTasksAnimating} />}
                {item.title === "Выполненные" && <AnimatedCheckCheck isAnimating={isCompletedAnimating} />}
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
