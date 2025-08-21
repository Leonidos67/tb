"use client";

import * as React from "react";
import {
  LucideIcon,
} from "lucide-react";
import { AnimatedLayoutGrid } from "@/components/ui/motion/AnimatedLayoutGrid";
import { AnimatedUser } from "@/components/ui/motion/AnimatedUser";
import { AnimatedUsers } from "@/components/ui/motion/AnimatedUsers";
import { AnimatedFlame } from "@/components/ui/motion/AnimatedFlame";
import { AnimatedCheckCheck } from "@/components/ui/motion/AnimatedCheckCheck";
import { AnimatedBolt } from "@/components/ui/motion/AnimatedBolt";
import { AnimatedSwatchBook } from "@/components/ui/motion/AnimatedSwatchBook";
import { AnimatedWand } from "@/components/ui/motion/AnimatedWand";
import { cn } from "@/lib/utils";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";

type ItemType = {
  title: string;
  url: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  isAnimated?: boolean;
};

type NavMainProps = {
  compact?: boolean;
  onItemClick?: () => void;
};

export function NavMain({ compact = false, onItemClick }: NavMainProps) {
  const { user } = useAuthContext();
  const workspaceId = useWorkspaceId();
  const location = useLocation();
  const { open } = useSidebar();
  const [isHomeAnimating, setIsHomeAnimating] = React.useState(false);
  const [isProfileAnimating, setIsProfileAnimating] = React.useState(false);
  const [isMembersAnimating, setIsMembersAnimating] = React.useState(false);
  const [isTasksAnimating, setIsTasksAnimating] = React.useState(false);
  const [isCompletedAnimating, setIsCompletedAnimating] = React.useState(false);
  const [isSettingsAnimating, setIsSettingsAnimating] = React.useState(false);
  const [isUserGuideAnimating, setIsUserGuideAnimating] = React.useState(false);
  const [isAiAnimating, setIsAiAnimating] = React.useState(false);

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
      title: "Мои данные",
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
    {
      title: "ИИ-ассистент",
      url: `/workspace/${workspaceId}/ai`,
      icon: AnimatedWand,
      isAnimated: true,
    },

  ];
  return (
    <SidebarGroup className={cn("h-auto", compact && "!p-0") }>
      <SidebarMenu className={cn("transition-transform duration-200", !open ? '-translate-x-2' : '')}>
        {mainItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton 
              isActive={item.url === pathname} 
              asChild
              onMouseEnter={() => {
                if (item.title === "Главная") {
                  setIsHomeAnimating(true);
                } else if (item.title === "Мои данные") {
                  setIsProfileAnimating(true);
                } else if (item.title === "Мои спортсмены") {
                  setIsMembersAnimating(true);
                } else if (item.title === "Все тренировки") {
                  setIsTasksAnimating(true);
                } else if (item.title === "Выполненные") {
                  setIsCompletedAnimating(true);
                } else if (item.title === "ИИ-ассистент") {
                  setIsAiAnimating(true);
                }
              }}
              onMouseLeave={() => {
                if (item.title === "Главная") {
                  setIsHomeAnimating(false);
                } else if (item.title === "Мои данные") {
                  setIsProfileAnimating(false);
                } else if (item.title === "Мои спортсмены") {
                  setIsMembersAnimating(false);
                } else if (item.title === "Все тренировки") {
                  setIsTasksAnimating(false);
                } else if (item.title === "Выполненные") {
                  setIsCompletedAnimating(false);
                } else if (item.title === "ИИ-ассистент") {
                  setIsAiAnimating(false);
                }
              }}
            >
              <Link to={item.url} className="!text-[15px]" onClick={onItemClick}>
                {item.title === "Главная" && <AnimatedLayoutGrid isAnimating={isHomeAnimating} />}
                {item.title === "Мои данные" && <AnimatedUser isAnimating={isProfileAnimating} />}
                {item.title === "Мои спортсмены" && <AnimatedUsers isAnimating={isMembersAnimating} />}
                {item.title === "Все тренировки" && <AnimatedFlame isAnimating={isTasksAnimating} />}
                {item.title === "Выполненные" && <AnimatedCheckCheck isAnimating={isCompletedAnimating} />}
                {item.title === "ИИ-ассистент" && <AnimatedWand className="text-slate-500" isAnimating={isAiAnimating} />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        
        {/* Пункты системы */}
        <SidebarMenuItem>
          <SidebarMenuButton 
            isActive={pathname.includes("/user-guide")} 
            asChild
            onMouseEnter={() => setIsUserGuideAnimating(true)}
            onMouseLeave={() => setIsUserGuideAnimating(false)}
          >
            <Link to={`/workspace/${workspaceId}/user-guide`} className="!text-[15px]" onClick={onItemClick}>
              <AnimatedSwatchBook isAnimating={isUserGuideAnimating} />
              <span>Руководство</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarMenuButton 
            isActive={pathname.includes("/general-settings")} 
            asChild
            onMouseEnter={() => setIsSettingsAnimating(true)}
            onMouseLeave={() => setIsSettingsAnimating(false)}
          >
            <Link to={`/workspace/${workspaceId}/general-settings`} className="!text-[15px]" onClick={onItemClick}>
              <AnimatedBolt isAnimating={isSettingsAnimating} />
              <span>Настройки</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
