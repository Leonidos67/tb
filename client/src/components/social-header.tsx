import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Bell, Menu, ArrowLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import useAuth from "@/hooks/api/use-auth";
import { useState, useEffect, useRef } from "react";
import { searchUsersQueryFn } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface SearchUser {
  _id: string;
  name: string;
  username: string;
  profilePicture: string | null;
  userRole?: "coach" | "athlete" | null;
}

const menuItems = [
  { to: "/u/", label: "Лента" },
  { to: "/u/users", label: "Пользователи" },
  { to: "/u/articles", label: "Статьи" },
];

export function SocialSidebarMenu() {
  const location = useLocation();
  const { data: currentUser } = useAuth();
  const user = currentUser?.user;
  
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-white p-4 sm:p-6 gap-3 sm:gap-4 min-h-svh sticky top-0">
      <nav className="flex flex-col gap-1.5 sm:gap-2">
        {/* Мой профиль - динамическая ссылка */}
        {user && (
          <Link
            to={`/u/users/${user.username}`}
            className={`rounded-full font-semibold text-base sm:text-lg px-2 sm:px-3 py-1.5 sm:py-2 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${location.pathname === `/u/users/${user.username}` ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground"}`}
          >
            <span className="pl-1 sm:pl-2">Мой профиль</span>
          </Link>
        )}
        
        {/* Остальные пункты меню */}
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`rounded-full font-semibold text-base sm:text-lg px-2 sm:px-3 py-1.5 sm:py-2 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${location.pathname === item.to ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground"}`}
          >
            <span className="pl-1 sm:pl-2">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

// Мобильное меню
export function MobileMenu() {
  const location = useLocation();
  const { data: currentUser } = useAuth();
  const user = currentUser?.user;
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-left flex items-center gap-2">
            <Logo />
            <span className="font-medium">T-Sync.</span>
            <span className="px-2 py-0.5 rounded-full bg-black text-white text-xs font-semibold">beta</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col p-4 gap-2">
          {/* Мой профиль - динамическая ссылка */}
          {user && (
            <Link
              to={`/u/users/${user.username}`}
              onClick={handleItemClick}
              className={`rounded-lg font-semibold text-base px-4 py-3 transition hover:bg-gray-100 ${location.pathname === `/u/users/${user.username}` ? "bg-gray-100 text-gray-900" : "text-gray-700"}`}
            >
              Мой профиль
            </Link>
          )}
          
          {/* Остальные пункты меню */}
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={handleItemClick}
              className={`rounded-lg font-semibold text-base px-4 py-3 transition hover:bg-gray-100 ${location.pathname === item.to ? "bg-gray-100 text-gray-900" : "text-gray-700"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

const SocialHeader = () => {
  const { data: currentUser } = useAuth();
  const user = currentUser?.user;
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchUsersQueryFn(query);
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (search.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(search);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  const handleSearchInputFocus = () => {
    setIsSearchOpen(true);
  };

  const handleSearchInputBlur = () => {
    // Не закрываем окно при потере фокуса, чтобы пользователь мог кликнуть на результат
  };

  const handleUserClick = () => {
    setIsSearchOpen(false);
    setSearch("");
    setSearchResults([]);
  };

  // Закрытие при клике вне поиска
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isSearchOpen]);

  return (
    <header className="w-full bg-white border-b shadow-sm px-2 sm:px-4 py-2 flex items-center gap-2 sm:gap-4 sticky top-0 z-50">
      {/* Мобильное меню */}
      <MobileMenu />
      
      {/* Иконка поворота и логотип */}
      <div className="flex items-center gap-2 relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded hover:bg-gray-100 transition-colors" aria-label="Платформа">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <a
                href={user?.currentWorkspace?._id ? `/workspace/${user.currentWorkspace._id}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full !cursor-pointer"
              >
                Перейти на платформу
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link to="/u/" className="flex items-center gap-0 sm:gap-1">
          <Logo />
          <span className="hidden sm:flex ml-1 sm:ml-2 items-center gap-1 sm:gap-2 self-center font-medium text-sm sm:text-base">T-Sync.</span>
          <span className="px-1 sm:px-2 py-0.5 rounded-full bg-black text-white text-xs font-semibold">beta</span>
        </Link>
      </div>
      
      {/* Контейнер поиска */}
      <div ref={searchContainerRef} className="flex-1 max-w-xs sm:max-w-md mx-0 sm:mx-2 relative">
        <Input
          type="text"
          placeholder="Поиск..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={handleSearchInputFocus}
          onBlur={handleSearchInputBlur}
          className="w-full text-sm sm:text-base"
        />
        
        {/* Выпадающий список результатов */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="max-h-80 sm:max-h-96 overflow-y-auto">
              {/* Заголовок */}
              <div className="p-3 sm:p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Поиск людей</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Начните вводить имя пользователя для поиска</p>
              </div>
              
              {isSearching ? (
                <div className="p-3 sm:p-4 text-left text-gray-500 text-sm">
                  Поиск...
                </div>
              ) : searchResults.length === 0 && search.trim() ? (
                <div className="p-3 sm:p-4 text-left text-gray-500 text-sm">
                  Пользователи не найдены
                </div>
              ) : searchResults.length > 0 ? (
                <div className="p-1 sm:p-2">
                  {searchResults.map((user) => (
                    <Link
                      key={user._id}
                      to={`/u/users/${user.username}`}
                      onClick={handleUserClick}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                        <AvatarImage src={user.profilePicture || ''} alt={user.name} />
                        <AvatarFallback className="text-sm">{user.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="font-semibold truncate text-sm sm:text-base">{user.name}</span>
                          {user.userRole === "coach" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="text-xs sm:text-sm cursor-help">🏋️‍♂️</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Тренер</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 font-mono">@{user.username}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        <button className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100">
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
        </button>
        {user && (
          <Link to={`/u/users/${user.username}`} className="ml-1 sm:ml-2 flex items-center gap-1 sm:gap-2">
            <Avatar className="w-7 h-7 sm:w-9 sm:h-9">
              <AvatarImage src={user.profilePicture || ''} alt={user.name} />
              <AvatarFallback className="text-xs sm:text-sm">{user.name?.[0]}</AvatarFallback>
            </Avatar>
          </Link>
        )}
      </div>
    </header>
  );
};

export default SocialHeader; 