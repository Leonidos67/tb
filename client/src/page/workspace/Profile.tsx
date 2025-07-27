import { useState, useRef } from "react";
import { useAuthContext } from "@/context/auth-provider";
import LogoutDialog from "@/components/asidebar/logout-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { updateProfilePictureMutationFn, setUsernameMutationFn } from "@/lib/api";
import { CopyIcon, Pencil, ChevronDown, ExternalLink, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

const PROFILE_BASE_URL = window.location.origin + "/u/users/";

const Profile = () => {
  const { user, refetchAuth } = useAuthContext();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editUsername, setEditUsername] = useState(username);
  const [editLoading, setEditLoading] = useState(false);
  const [editStatus, setEditStatus] = useState<string | null>(null);
  const [showInfoOpen, setShowInfoOpen] = useState(false);

  if (!user) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      // Преобразуем файл в base64 строку
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await updateProfilePictureMutationFn(base64);
        await refetchAuth();
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setLoading(false);
      // Можно добавить обработку ошибок
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername.trim()) return;
    setEditLoading(true);
    setEditStatus(null);
    try {
      await setUsernameMutationFn(editUsername.trim());
      setUsername(editUsername.trim().toLowerCase());
      setEditStatus("success");
      await refetchAuth();
      setEditOpen(false);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { status?: number } }).response === "object" &&
        (err as { response?: { status?: number } }).response?.status === 409
      ) {
        setEditStatus("taken");
      } else {
        setEditStatus("error");
      }
    } finally {
      setEditLoading(false);
    }
  };

  const profileUrl = `${PROFILE_BASE_URL}${username}`;

  return (
    <main className="flex flex-1 flex-col py-4 md:pt-3">
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Мой профиль</h2>
        <div className="flex gap-2 items-center">
          {username && (
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(profileUrl, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Открыть публичный профиль</span>
              <span className="sm:hidden">Профиль</span>
            </Button>
          )}
          {!username ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => { setEditUsername(""); setEditOpen(true); }}
              className="flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Создать публичный профиль</span>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <span className="hidden sm:inline">Еще</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="!cursor-pointer" onClick={() => setShowInfoOpen(true)}>
                  <Info className="w-4 h-4 mr-2" />
                  <span>Посмотреть мои данные</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="!cursor-pointer" onClick={() => window.open(profileUrl, '_blank')}>
                  <Pencil className="w-4 h-4 mr-2" />
                  <span>Редактировать публичный профиль</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактирование публичного профиля</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditProfile} className="flex flex-col gap-3 mt-2">
              <label className="font-medium">Ваш никнейм</label>
              <input
                type="text"
                value={editUsername}
                onChange={e => { setEditUsername(e.target.value); setEditStatus(null); }}
                className="border rounded px-2 py-1.5"
                placeholder=""
                disabled={editLoading}
              />
              {editStatus === "taken" && (
                <span className="text-red-500 text-sm">Этот никнейм уже занят</span>
              )}
              {editStatus === "error" && (
                <span className="text-red-500 text-sm">Ошибка при сохранении</span>
              )}
              <DialogFooter>
                <Button type="submit" disabled={editLoading || !editUsername.trim()}>
                  {editLoading ? "Сохранение..." : "Сохранить"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={showInfoOpen} onOpenChange={setShowInfoOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ваши данные</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-2">
              <div>
                <span className="font-medium">Ваш никнейм </span>
                <span className="text-blue-600">{username ? `@${username}` : '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Ссылка на профиль: </span>
                <a
                  href={profileUrl}
                  className="text-blue-500 underline break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profileUrl}
                </a>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(profileUrl);
                    toast({
                      title: "Уведомление",
                      description: "Ссылка на профиль скопирована",
                      variant: "success",
                    });
                  }}
                >
                  <CopyIcon className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <span className="font-medium">Дата регистрации: </span>
                <span>{user?.createdAt ? format(new Date(user.createdAt), 'dd.MM.yyyy') : '—'}</span>
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-2"
              >
                <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                  Показать больше
                </a>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="w-full">
        <div className="w-full border rounded-lg p-6 bg-white flex flex-col items-start text-left shadow-sm">
          <div className="flex flex-row items-center gap-6 mb-4">
            <div className="relative group">
              <Avatar className="w-24 h-24 cursor-pointer" onClick={handleAvatarClick}>
                <AvatarImage src={user.profilePicture || ''} alt={user.name} />
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="absolute left-1/2 -translate-x-1/2 bottom-0 mt-2 z-10"
                onClick={handleAvatarClick}
                disabled={loading}
              >
                {loading ? "Загрузка..." : "Изменить фото"}
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>
            <div>
              <div className="text-xl font-semibold mb-1 flex items-center gap-2">
                {user.name}
                {user.userRole === "coach" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-2xl cursor-help">🏋️‍♂️</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Этот эмодзи присваивается только тренерам</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="text-gray-500">{user.email}</div>
              {/* username section */}
              <div className="mt-4 w-full flex flex-row items-start justify-between gap-4">
                <div className="flex-1"></div>
              </div>
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