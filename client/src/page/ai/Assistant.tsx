import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import SiriOrb from "@/components/smoothui/ui/SiriOrb";

type ChatMessage = {
  role: "user" | "model" | "system";
  text: string;
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const GEMINI_ENDPOINT_BASE = import.meta.env.VITE_GEMINI_API_URL as string | undefined;
const MODEL_ID = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || "gemini-2.0-flash";

export default function AiAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showInput, setShowInput] = useState(false);

  const endpoint = useMemo(() => {
    const base = GEMINI_ENDPOINT_BASE || "https://generativelanguage.googleapis.com/v1beta/models";
    return `${base}/${MODEL_ID}:generateContent?key=${GEMINI_API_KEY ?? ""}`;
  }, []);

  const ask = async (customMessage?: string) => {
    const trimmed = (customMessage ?? question).trim();
    if (!trimmed) return;
    if (!GEMINI_API_KEY) {
      setError("Отсутствует VITE_GEMINI_API_KEY. Добавьте ключ в .env");
      return;
    }
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
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: trimmed }],
              role: "user",
            },
          ],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const candidate = data?.candidates?.[0];
      const parts: Array<{ text?: string }> = candidate?.content?.parts || [];
      const answer = parts.map((p) => p.text || "").join("\n").trim();
      setMessages((prev) => [...prev, { role: "model", text: answer || "(пустой ответ)" }]);
    } catch (e: any) {
      setError(e?.message || "Неизвестная ошибка");
    } finally {
      setIsLoading(false);
      // Auto-scroll
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void ask();
    }
  };

  if (!showInput) {
    return (
      <div className="flex w-full h-[calc(100vh-140px)] items-center justify-center">
        <button type="button" onClick={() => setShowInput(true)}>
          <SiriOrb size="292px" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full p-4">
      <Card className="w-full max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
        <CardHeader>
          <CardTitle>AI ассистент</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 h-full">
          <ScrollArea className="flex-1 rounded border p-3" ref={scrollRef as any}>
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground">Задайте вопрос ниже. Нажмите Enter для отправки, Shift+Enter для переноса строки.</div>
              )}
              {messages.map((m, idx) => (
                <div key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div className={`inline-block rounded px-3 py-2 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto">
            <Textarea
              value={question}
              placeholder="Напишите ваш вопрос..."
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
            />
            <div className="flex items-center justify-end">
              <Button disabled={isLoading} onClick={() => void ask()}>
                {isLoading ? "Загрузка..." : "Спросить"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


