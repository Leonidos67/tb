import { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import SiriOrb from "@/components/smoothui/ui/SiriOrb";
import { useNavigate } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
 

type RoomOption = { _id: string; name: string; emoji?: string };
type ChatMessage = {
  role: "user" | "model" | "system";
  text: string;
  rooms?: RoomOption[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;

export default function AiAssistant() {
  const navigate = useNavigate();
  const workspaceId = useWorkspaceId();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);

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

  const endpoint = useMemo(() => {
    if (API_BASE) {
      const trimmed = API_BASE.replace(/\/$/, "");
      return `${trimmed}/v1/ai/query`;
    }
    return `/api/v1/ai/query`;
  }, []);

  const ask = async (customMessage?: string) => {
    const trimmed = (customMessage ?? question).trim();
    if (!trimmed) return;
    // Do not block on missing Gemini key when using backend stub
    setError(null);
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    if (!customMessage) setQuestion("");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ prompt: trimmed }),
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
      // Auto-scroll
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  };

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

  if (!showInput) {
    return (
      <div className="relative w-full h-[calc(100svh-140px)]">
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
    <div className="min-h-[100svh] h-[100svh] w-full overflow-hidden relative m-0 p-0">
      <div
        className="fixed inset-0 z-0"
      />
      <div className="w-full h-full overflow-hidden relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chat (left) */}
        <div className="lg:col-span-8 xl:col-span-8 lg:col-start-3 xl:col-start-3 min-h-0">
          <Card className="w-full flex flex-col bg-transparent border-none shadow-none">
            <CardContent className="flex flex-col gap-0 p-0">
              <ScrollArea ref={scrollRef}>
                <div className="space-y-3 px-3 lg:px-6 py-3">
                  {messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="w-full flex items-center justify-center py-16"
                    >
                      <div className="relative">
                        <SiriOrb size="220px" />
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                          <span className="text-white text-sm font-semibold text-center px-4 py-1.5 bg-black/80 rounded-full backdrop-blur-sm whitespace-nowrap">
                            Я немного тупенькая, но попытаюсь вам помочь)
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
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
                        <div className={`inline-block rounded px-3 py-2 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
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
                                  <div className="room-dropdown absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-10 min-w-[200px]">
                                    <div className="py-1">
                                      <button
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                        onClick={() => handleRoomAction('navigate', room)}
                                      >
                                        <span>🚪</span>
                                        <span>Перейти в комнату</span>
                                      </button>
                                      <button
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
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
              </ScrollArea>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              {/* Actions above input */}
              <div className="px-3 lg:px-6 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="destructive" onClick={clearChat}>
                    Очистить чат
                  </Button>
                  <Button variant="secondary">
                    Быстрые действия
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white" onClick={() => void ask("Покажи мой список комнат")}>Мой список комнат</Button>
                  <Button variant="outline" size="sm" className="bg-white" onClick={() => void ask("Покажи все комнаты")}>Все комнаты</Button>
                  <Button variant="outline" size="sm" className="bg-white" onClick={() => void ask("Сколько у меня актуальных тренировок?")}>Актуальные тренировки</Button>
                  <Button variant="outline" size="sm" className="bg-white" onClick={() => void ask("Покажи выполненные тренировки")}>Выполненные тренировки</Button>
                  <Button variant="outline" size="sm" className="bg-white" onClick={() => void ask("Кто участники моей рабочей зоны?")}>Участники зоны</Button>
                </div>
              </div>

              {/* Input - not fixed */}
              <div className="px-3 lg:px-20 py-3">
                <div className="flex items-end gap-2 w-full">
                  <Textarea
                    className="flex-1"
                    value={question}
                    placeholder="Напишите ваш вопрос..."
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={3}
                  />
                  <Button disabled={isLoading} onClick={() => void ask()} className="shrink-0">
                    {isLoading ? "Загрузка..." : "Спросить"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right column removed to place actions above input */}
      </div>
    </div>
  );
}


