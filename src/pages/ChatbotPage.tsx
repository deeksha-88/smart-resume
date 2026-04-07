import { useState, useRef, useEffect } from "react";
import { useResume } from "@/lib/resume-context";
import { Bot, Send, User, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatbotPage = () => {
  const { analysisData, targetRole, resumeText } = useResume();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your AI career assistant. Ask me anything about your resume, job search, interview prep, or career planning. 💼" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setInput("");
    setLoading(true);

    // Build context-aware messages
    const contextMsg = analysisData
      ? `Context: User's target role is "${targetRole}". They scored ${analysisData.overallScore}% match. Matched skills: ${analysisData.matchedSkills.join(", ")}. Missing skills: ${analysisData.missingSkills.join(", ")}.`
      : resumeText
      ? `Context: User has uploaded a resume for "${targetRole}" role.`
      : "";

    const apiMsgs = contextMsg
      ? [{ role: "user" as const, content: contextMsg }, ...allMsgs]
      : allMsgs;

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-resume`;
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ action: "chat", messages: apiMsgs }),
      });

      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let text = "";

      const update = (t: string) => {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && prev.length > 1) return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: t } : m);
          return [...prev, { role: "assistant", content: t }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) { text += c; update(text); }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold gradient-text mb-4 flex items-center gap-2">
        <Bot className="h-5 w-5" /> AI Career Assistant
      </h1>
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-primary/20" : "bg-secondary/20"}`}>
              {m.role === "user" ? <User className="h-4 w-4 text-primary" /> : <Bot className="h-4 w-4 text-secondary" />}
            </div>
            <div className={`glass-card p-4 max-w-[80%] ${m.role === "user" ? "bg-primary/10" : ""}`}>
              <p className="text-foreground text-sm whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Typing...</div>}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Ask anything about your career..." className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        <button onClick={sendMessage} disabled={loading} className="gradient-button px-4 py-3"><Send className="h-5 w-5" /></button>
      </div>
    </div>
  );
};

export default ChatbotPage;
