import { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import SiriOrb from "@/components/smoothui/ui/SiriOrb";
import { useLocation, useNavigate } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { Send, Plus, Trash, Check, X } from "lucide-react";
import BottomSheet from "@/components/ui/bottom-sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
 

type RoomOption = { _id: string; name: string; emoji?: string };
type ChatMessage = {
  role: "user" | "model" | "system";
  text: string;
  rooms?: RoomOption[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;

export default function AiAssistant() {
  const { state: sidebarState } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const workspaceId = useWorkspaceId();
  const { data: membersData } = useGetWorkspaceMembers(workspaceId);
  const inputBoxRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [inputBoxHeight, setInputBoxHeight] = useState<number>(0);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [isAttachSheetOpen, setIsAttachSheetOpen] = useState(false);
  const [selectedAthletes, setSelectedAthletes] = useState<Array<{ _id: string; name: string; email: string }>>([]);

  // Inline selection ask button within AI page
  const [inlineAskVisible, setInlineAskVisible] = useState(false);
  const [inlineAskPos, setInlineAskPos] = useState<{ top: number; left: number } | null>(null);
  const [inlineSelectedText, setInlineSelectedText] = useState("");

  

  // Загружаем сообщения из localStorage при инициализации
  useEffect(() => {
    const savedMessages = localStorage.getItem('ai-chat-messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (e) {
        console.error('Failed to parse saved messages:', e);
      }
    }
  }, []);

  // Сохраняем сообщения в localStorage при изменении
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Префилл вопроса из router state (например, из выделенного текста)
  useEffect(() => {
    const state = location.state as { prefillQuestion?: string } | null;
    const prefill = state?.prefillQuestion?.trim();
    if (prefill) {
      setShowInput(true);
      setQuestion(prefill);
      // Очистим state, чтобы не повторялось при навигации назад/вперёд
      navigate(location.pathname, { replace: true, state: null });
      // Фокус на textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  }, [location.state, location.pathname, navigate]);

  // Следим за высотой инпут-блока и синхронизируем правый список
  useEffect(() => {
    if (!inputBoxRef.current) return;
    const el = inputBoxRef.current;
    const update = () => setInputBoxHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [showInput]);

  // Закрываем выпадающее меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.room-dropdown')) {
        setExpandedRoom(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Показать кнопку "Спросить у ИИ" рядом с выделенным текстом на этой странице
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setInlineAskVisible(false);
        setInlineAskPos(null);
        setInlineSelectedText("");
        return;
      }

      const text = selection.toString().trim();
      if (!text) {
        setInlineAskVisible(false);
        setInlineAskPos(null);
        setInlineSelectedText("");
        return;
      }

      // Avoid showing for selection inside the textarea itself
      const anchorNode = selection.anchorNode as Node | null;
      if (anchorNode && textareaRef.current && textareaRef.current.contains(anchorNode as Node)) {
        setInlineAskVisible(false);
        setInlineAskPos(null);
        setInlineSelectedText("");
        return;
      }

      const range = selection.getRangeAt(0).cloneRange();
      let rect = range.getBoundingClientRect();
      if ((!rect || (rect.top === 0 && rect.bottom === 0)) && range.getClientRects().length > 0) {
        rect = range.getClientRects()[0];
      }
      if (!rect) {
        setInlineAskVisible(false);
        setInlineAskPos(null);
        setInlineSelectedText("");
        return;
      }

      setInlineSelectedText(text);
      const offset = 8;
      const tentativeLeft = rect.left + rect.width / 2;
      const estimatedWidth = 160;
      const left = Math.min(Math.max(tentativeLeft - estimatedWidth / 2, 8), window.innerWidth - estimatedWidth - 8);
      const top = Math.min(rect.bottom + offset, window.innerHeight - 48 - 8);
      setInlineAskPos({ top, left });
      setInlineAskVisible(true);
    };

    const hide = () => {
      setInlineAskVisible(false);
      setInlineAskPos(null);
      setInlineSelectedText("");
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest?.('#ai-inline-selection-ask')) return;
      hide();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('scroll', hide, true);
    document.addEventListener('keydown', hide, true);
    document.addEventListener('mousedown', handleMouseDown, true);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('scroll', hide, true);
      document.removeEventListener('keydown', hide, true);
      document.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, []);

  const endpoint = useMemo(() => {
    if (API_BASE) {
      const trimmed = API_BASE.replace(/\/$/, "");
      return `${trimmed}/v1/ai/query`;
    }
    return `/api/v1/ai/query`;
  }, []);

  const ask = async (customMessage?: string) => {
    const trimmed = (customMessage ?? question).trim();
    
    // Если сообщение пустое, но есть прикрепленные спортсмены, генерируем анализ
    if (!trimmed && selectedAthletes.length > 0) {
      const athleteNames = selectedAthletes.map(a => a.name || a.email).join(", ");
      const analysisTitle = selectedAthletes.length === 1 ? "Анализ данных пользователя" : "Анализ данных пользователей";
      const analysisMessage = `${analysisTitle}: ${athleteNames}\n\nКоличество тренировок, активность, прогресс и другая полезная информация:`;
      
      // Добавляем сообщение от пользователя с перечислением выбранных пользователей
      setMessages((prev) => [...prev, { role: "user", text: athleteNames }]);
      if (!customMessage) setQuestion("");
      
      // Добавляем автоматический ответ от ИИ
      setMessages((prev) => [...prev, { 
        role: "model", 
        text: analysisMessage,
        rooms: [{ _id: "members", name: "Участники зоны", emoji: "👥" }]
      }]);
      return;
    }
    
    // Если нет сообщения и нет спортсменов, не отправляем
    if (!trimmed) return;
    
    // Формируем сообщение с информацией о прикрепленных спортсменах
    const finalMessage = trimmed;
    let promptWithAthletes = trimmed;
    if (selectedAthletes.length > 0) {
      const athleteNames = selectedAthletes.map(a => a.name || a.email).join(", ");
      promptWithAthletes = `Пользователи: ${athleteNames}. ${trimmed}`;
    }
    
    // Do not block on missing Gemini key when using backend stub
    setError(null);
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", text: finalMessage }]);
    if (!customMessage) setQuestion("");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          prompt: promptWithAthletes,
          selectedAthletes: selectedAthletes.length > 0 ? selectedAthletes : undefined
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const answer = data?.answer || "";
      const rooms = Array.isArray(data?.rooms) ? (data.rooms as RoomOption[]) : undefined;
      setMessages((prev) => [...prev, { role: "model", text: (answer || "").trim() || "(пустой ответ)", rooms }]);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Неизвестная ошибка";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      // Auto-scroll to bottom of messages container
      requestAnimationFrame(() => {
        const el = messagesContainerRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    }
  };

  // Keep pinned to bottom when messages count changes
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight });
  }, [messages.length]);

  const renderTextWithLinks = (text: string) => {
    const linkPattern = /(https?:\/\/[^\s]+|\/workspace\/[\w\-/]+)/g;
    const elements: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = linkPattern.exec(text)) !== null) {
      const url = match[0];
      const start = match.index;
      if (start > lastIndex) {
        elements.push(text.slice(lastIndex, start));
      }
      elements.push(
        <a key={`${start}-${url}`} href={url} className="underline text-blue-600" onClick={() => {
          // allow client-side routing for internal links
          if (url.startsWith("/")) {
            // default behavior works with react-router <a href> in this app
          }
        }}>
          {url}
        </a>
      );
      lastIndex = start + url.length;
    }
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }
    return elements;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void ask();
    }
  };

  const toggleRoomExpansion = (roomId: string) => {
    setExpandedRoom(expandedRoom === roomId ? null : roomId);
  };

  const handleRoomAction = (action: 'navigate' | 'ask', room: RoomOption) => {
    // Проверяем, является ли это специальной кнопкой "Показать все тренировки зоны"
    if (room._id === "all-zone") {
      // Показываем все тренировки зоны
      void ask("Покажи все тренировки зоны");
      setExpandedRoom(null);
      return;
    }

    if (action === 'navigate') {
      navigate(`/workspace/${workspaceId}/project/${room._id}`);
    } else if (action === 'ask') {
      void ask(`Покажи тренировки в комнате ${room.emoji || ''} ${room.name}`);
    }
    setExpandedRoom(null);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('ai-chat-messages');
  };

  const addAthlete = (athlete: { _id: string; name: string; email: string }) => {
    if (!selectedAthletes.find(a => a._id === athlete._id)) {
      setSelectedAthletes(prev => [...prev, athlete]);
    }
  };

  const removeAthlete = (athleteId: string) => {
    setSelectedAthletes(prev => prev.filter(a => a._id !== athleteId));
  };

  if (!showInput) {
    return (
      <div className="relative w-full h-screen">
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage:
              `radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),` +
              `radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`,
          }}
        />
        <div className="relative z-10 w-full h-full grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-8 xl:col-span-8 lg:col-start-3 xl:col-start-3 flex items-center justify-center">
            <button type="button" onClick={() => setShowInput(true)}>
              <div className="relative">
                <SiriOrb size="292px" />
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <span className="text-white text-sm font-semibold text-center px-6 py-2 bg-black/80 rounded-full backdrop-blur-sm whitespace-nowrap">
                    Задай мне любой вопрос
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative m-0 p-0 ai-page">
             <div
         className="fixed inset-0 z-0"
         style={{
           backgroundImage: `radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),` +
                           `radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`,
         }}
       />
      <div className="w-full h-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chat messages directly in the center column with internal scroll */}
        <div className="lg:col-span-8 xl:col-span-8 lg:col-start-3 xl:col-start-3">
          <div
            ref={messagesContainerRef}
            className="space-y-3 px-3 lg:px-6 py-3 scrollbar"
          >
            {messages.length === 0 && (
              <div className="w-full flex items-center justify-center py-12">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="w-full flex items-center justify-center"
                >
                  <div className="relative siri-orb-container">
                    <SiriOrb size="220px" />
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                         <span className="text-sm font-semibold text-center px-4 py-3 bg-white/90 dark:bg-card/80 text-black dark:text-card-foreground border border-gray-200 dark:border-border rounded-full backdrop-blur-sm whitespace-nowrap siri-orb-text">
                         Я немного тупенькая, но попытаюсь вам помочь)
                       </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
            {messages.length > 0 && (
              <div>
                <AnimatePresence initial={false}>
                  {messages.map((m, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={m.role === "user" ? "text-right" : "text-left"}
                    >
                      <div className={`inline-block rounded px-3 py-2 my-0.5 ai-transition ${
                        m.role === "user" 
                          ? "bg-primary text-primary-foreground ai-message-user" 
                          : "bg-muted ai-message-model"
                      }`}>
                        {m.role === "user" ? m.text : renderTextWithLinks(m.text)}
                      </div>
                      {m.role === "model" && m.rooms && m.rooms.length > 0 && (
                        <div className="mt-2 block">
                          <div className="flex gap-2 flex-wrap" style={{ maxWidth: '500px' }}>
                            {m.rooms.map((room) => (
                              <div key={room._id} className="relative room-dropdown">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="shrink-0" 
                                  onClick={() => toggleRoomExpansion(room._id)}
                                >
                                  <span className="mr-1">{room.emoji}</span>
                                  <span>{room.name}</span>
                                </Button>
                                {expandedRoom === room._id && (
                                                                  <div className="room-dropdown absolute top-full left-0 mt-1 bg-card border border-border rounded-md shadow-lg z-10 min-w-[200px]">
                                  <div className="py-1">
                                    <button
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 ai-hover-effect"
                                      onClick={() => handleRoomAction('navigate', room)}
                                    >
                                      <span>🚪</span>
                                      <span>Перейти в комнату</span>
                                    </button>
                                    <button
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 ai-hover-effect"
                                      onClick={() => handleRoomAction('ask', room)}
                                    >
                                      <span>🤖</span>
                                      <span>Спросить у ИИ</span>
                                    </button>
                                  </div>
                                </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            {error && (
              <div className="text-red-500 text-sm ai-error">{error}</div>
            )}
          </div>
        </div>
      </div>

             {/* Fixed bottom input bar aligned with main content */}
       <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50">
         <div className={`pointer-events-auto bg-card relative z-50 border-t border-border ai-input-container ${sidebarState === "collapsed" ? "md:ml-[var(--sidebar-width-icon)]" : ""}`}>
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
             {/* Empty left column for sidebar - only show when sidebar is expanded */}
             {sidebarState === "expanded" && <div className="hidden lg:block lg:col-span-2"></div>}
                           {/* Wide input area - expand when sidebar is collapsed */}
              <div className={`${sidebarState === "expanded" ? "lg:col-span-8 xl:col-span-8" : "lg:col-span-10 xl:col-span-10"}`}>
                               <div ref={inputBoxRef} className="relative rounded-none border-0 bg-white dark:bg-card shadow-none p-2">
                 {/* Selected athletes row */}
                 {selectedAthletes.length > 0 && (
                   <div className="mb-3">
                     <div className="flex flex-wrap gap-2 mb-2">
                                               {selectedAthletes.map((athlete) => (
                          <div key={athlete._id} className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm border bg-white dark:bg-card text-foreground border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200 shadow-sm ai-attached-user">
                            <span className="truncate font-medium">{athlete.name || athlete.email}</span>
                            <button
                              onClick={() => removeAthlete(athlete._id)}
                              className="ml-1 rounded-full p-1.5 hover:bg-accent hover:text-accent-foreground transition-all duration-200 flex items-center justify-center hover:scale-110 ai-attached-user-remove"
                              title="Удалить спортсмена"
                            >
                              <X className="h-3 w-3 text-foreground" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-md border border-border shadow-sm ai-attached-user-info">
                        💡 Прикрепленные спортсмены будут включены в ваш запрос к ИИ
                      </div>
                   </div>
                 )}
                {/* Горизонтальные пункты с прокруткой и отправкой справа */}
                <div className="mb-2 -mx-2 px-2 flex items-center gap-2">
                  <div className="flex-1 overflow-x-auto">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      {/* Очистить чат — слева от остальных (десктоп) */}
                      <Button variant="outline" size="sm" className="bg-white dark:bg-card text-foreground border-border hover:bg-accent hover:text-accent-foreground hidden md:inline-flex ai-button-outline" onClick={clearChat}>
                        <Trash className="h-4 w-4 mr-1" />
                        Очистить чат
                      </Button>
                      <Button variant="outline" size="sm" className="bg-white dark:bg-card text-foreground border-border hover:bg-accent hover:text-accent-foreground ai-button-outline" onClick={() => void ask("Покажи мой список комнат")}>
                        Мой список комнат
                      </Button>
                      <Button variant="outline" size="sm" className="bg-white dark:bg-card text-foreground border-border hover:bg-accent hover:text-accent-foreground ai-button-outline" onClick={() => void ask("Покажи все комнаты")}>
                        Все комнаты
                      </Button>
                      <Button variant="outline" size="sm" className="bg-white dark:bg-card text-foreground border-border hover:bg-accent hover:text-accent-foreground ai-button-outline" onClick={() => void ask("Сколько у меня актуальных тренировок?")}>
                        Актуальные тренировки
                      </Button>
                      <Button variant="outline" size="sm" className="bg-white dark:bg-card text-foreground border-border hover:bg-accent hover:text-accent-foreground ai-button-outline" onClick={() => void ask("Покажи выполненные тренировки")}>
                        Выполненные тренировки
                      </Button>
                                             <Button variant="outline" size="sm" className="bg-white dark:bg-card text-foreground border-border hover:bg-accent hover:text-accent-foreground ai-button-outline" onClick={() => void ask("Кто участники моей рабочей зоны?")}>
                         Участники зоны
                       </Button>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Button
                      size="sm"
                      disabled={isLoading || (!question.trim() && selectedAthletes.length === 0)}
                      onClick={() => void ask()}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 ai-button-primary"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  className="w-full border border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background resize-none min-h-[104px] max-h-48 px-3 py-3 ai-textarea"
                  ref={textareaRef}
                  value={question}
                  placeholder={selectedAthletes.length > 0 ? "Напишите ваш вопрос или отправьте пустое сообщение для анализа спортсменов..." : "Напишите ваш вопрос..."}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={isMobile ? 3 : 4}
                />
                {/* Мобильные кнопки под инпутом: прикрепить слева, очистить справа */}
                <div className="mt-2 md:hidden">
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white dark:bg-card text-foreground border-border hover:bg-accent hover:text-accent-foreground ai-button-outline ai-transition"
                      onClick={() => setIsAttachSheetOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Прикрепить спортсмена
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white dark:bg-card text-foreground border-border hover:bg-accent hover:text-accent-foreground ai-button-outline ai-transition" onClick={clearChat}>
                      <Trash className="h-4 w-4 mr-1" />
                      Очистить чат
                    </Button>
                  </div>
                </div>
              </div>
            </div>
                         {/* Athletes list aligned to the right */}
             <div className={`hidden lg:flex items-stretch ${sidebarState === "expanded" ? "lg:col-span-2" : "lg:col-span-2"}`}>
                             <div className="rounded-none border-0 bg-white dark:bg-card shadow-none p-0 flex flex-col w-full" style={{ height: inputBoxHeight || undefined }}>
                <div className="flex flex-col w-full h-full p-2">
                  <div className="text-sm font-medium mb-2 text-foreground">Прикрепить спортсмена</div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-0 scrollbar">
                    {(membersData?.members ?? []).map((m) => {
                      const isSelected = selectedAthletes.find(a => a._id === m._id);
                      return (
                        <div key={m._id} className={`flex items-center justify-between gap-2 rounded-md border px-2 py-2 bg-white dark:bg-card text-foreground border-border hover:bg-accent hover:text-accent-foreground ${
                          isSelected ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : ''
                        }`}>
                          <span className="text-sm truncate text-foreground">
                            {m.userId?.name || m.userId?.email}
                          </span>
                          <button 
                            className={`inline-flex items-center justify-center rounded-full p-1 transition-all duration-200 ${
                              isSelected 
                                ? "bg-green-500 text-white hover:bg-green-600" 
                                : "bg-primary text-primary-foreground hover:opacity-90"
                            }`}
                            onClick={() => {
                              if (isSelected) {
                                removeAthlete(m._id);
                              } else {
                                addAthlete({ _id: m._id, name: m.userId?.name || "", email: m.userId?.email || "" });
                              }
                            }}
                          >
                            {isSelected ? <Check className="size-3" /> : <Plus className="size-3" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline selection ask button (AI page) */}
      {inlineAskVisible && inlineAskPos && (
        <div
          id="ai-inline-selection-ask"
          className="fixed z-[60] pointer-events-auto"
          style={{ top: inlineAskPos.top, left: inlineAskPos.left }}
        >
          <Button
            size="sm"
            className="rounded-full shadow-md bg-white dark:bg-card text-foreground border border-border hover:bg-accent hover:text-accent-foreground ai-transition"
            onClick={() => {
              setShowInput(true);
              setQuestion(inlineSelectedText);
              requestAnimationFrame(() => textareaRef.current?.focus());
              setInlineAskVisible(false);
            }}
          >
            Спросить у ИИ
          </Button>
        </div>
      )}

      {/* Мобильный BottomSheet: Прикрепить спортсмена */}
      {isMobile && (
        <BottomSheet
          open={isAttachSheetOpen}
          onOpenChange={setIsAttachSheetOpen}
          title="Прикрепить спортсмена"
          description="Выберите спортсмена из списка"
          className="p-0"
        >
          <div className="space-y-2">
            {(membersData?.members ?? []).length === 0 ? (
              <div className="text-sm text-muted-foreground py-4">Список спортсменов пуст</div>
            ) : (
              <div className="max-h-[50vh] overflow-y-auto space-y-2 scrollbar">
                {(membersData?.members ?? []).map((m) => {
                  const isSelected = selectedAthletes.find(a => a._id === m._id);
                  return (
                    <div key={m._id} className={`flex items-center justify-between gap-2 rounded-md border px-2 py-2 bg-white dark:bg-card text-foreground border-border hover:bg-accent hover:text-accent-foreground ${
                      isSelected ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : ''
                    }`}>
                      <span className="text-sm truncate text-foreground">
                        {m.userId?.name || m.userId?.email}
                      </span>
                      <button 
                        className={`inline-flex items-center justify-center rounded-full p-1 transition-all duration-200 ${
                          isSelected 
                            ? "bg-green-500 text-white hover:bg-green-600" 
                            : "bg-primary text-primary-foreground hover:opacity-90"
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            removeAthlete(m._id);
                          } else {
                            addAthlete({ _id: m._id, name: m.userId?.name || "", email: m.userId?.email || "" });
                          }
                        }}
                      >
                        {isSelected ? <Check className="size-3" /> : <Plus className="size-3" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

