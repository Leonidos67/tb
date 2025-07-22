import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Bell } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import useAuth from "@/hooks/api/use-auth";
import { useState } from "react";

const menuItems = [
  { to: "/u/", label: "Лентёа" },
  { to: "/u/users", label: "Пользователи" },
  { to: "/u/articles", label: "Статьи" },
];

export function SocialSidebarMenu() {
  const location = useLocation();
  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-white p-6 gap-4 min-h-svh sticky top-0">
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`font-semibold text-lg px-3 py-2 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${location.pathname === item.to ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground"}`}
          >
            <span className="pl-2">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

const SocialHeader = () => {
  const { data: currentUser } = useAuth();
  const user = currentUser?.user;
  const [search, setSearch] = useState("");

  return (
    <header className="w-full bg-white border-b shadow-sm px-4 py-2 flex items-center gap-4 sticky top-0 z-50">
      <Link to="/u/" className="flex items-center gap-2">
        <Logo />
        <span className="hidden md:flex ml-2 items-center gap-2 self-center font-medium">T-Sync.</span>
        <span className="px-2 py-0.5 rounded-full bg-black text-white text-xs font-semibold">beta</span>
      </Link>
      <form className="flex-1 max-w-md mx-4">
        <Input
          type="text"
          placeholder="Поиск..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full"
        />
      </form>
      <div className="flex items-center gap-3 ml-auto">
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <Bell className="w-6 h-6 text-gray-500" />
        </button>
        {user && (
          <Link to={`/u/users/${user.username}`} className="ml-2 flex items-center gap-2">
            <Avatar className="w-9 h-9">
              <AvatarImage src={user.profilePicture || ''} alt={user.name} />
              <AvatarFallback>{user.name?.[0]}</AvatarFallback>
            </Avatar>
          </Link>
        )}
      </div>
    </header>
  );
};

export default SocialHeader; 