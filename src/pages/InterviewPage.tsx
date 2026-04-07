import { useState, useRef, useEffect } from "react";
import { useResume } from "@/lib/resume-context";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Send, User, Bot, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const InterviewPage = () => {
  const { analysisData, targetRole } = useResume();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (!analysisData) {
    return (
      <div className="p-8 text-center animate-fade-in">
        <div className="glass-card p-12 max-w-md mx-auto">
          <p className="text-muted-foreground mb-4">No analysis data yet.</p>
          <button onClick={() => navigate("/upload")} className="gradient-button px-6 py-2">Upload Resume</button>
        </div>
      </div>
    );
  }

  const streamResponse = async (msgs: Message[]) => {
    setLoading(true);
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-resume`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      body: JSON.stringify({ action: "interview", targetRole, messages: msgs }),
    });

    if (!resp.ok || !resp.body) { setLoading(false); return; }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let assistantText = "";

    const updateAssistant = (text: string) => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: text } : m);
        return [...prev, { role: "assistant", content: text }];
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
          if (c) { assistantText += c; updateAssistant(assistantText); }
        } catch {}
      }
    }
    setLoading(false);
  };

  const startInterview = async () => {
    setStarted(true);
    const init: Message[] = [{ role: "user", content: `Start mock interview for ${targetRole}. Ask me the first question.` }];
    setMessages(init);
    await streamResponse(init);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const newMsgs: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMsgs);
    setInput("");
    await streamResponse(newMsgs);
  };

  if (!started) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto animate-fade-in">
        <div className="glass-card p-12 text-center">
          <MessageSquare className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold gradient-text mb-2">Mock Interview</h1>
          <p className="text-muted-foreground mb-6">Practice with an AI interviewer for <strong className="text-foreground">{targetRole}</strong></p>
          <button onClick={startInterview} className="gradient-button px-8 py-3 text-lg">Start Interview</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold gradient-text mb-4">Mock Interview — {targetRole}</h1>
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
        {loading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Thinking...</div>}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type your answer..." className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        <button onClick={sendMessage} disabled={loading} className="gradient-button px-4 py-3"><Send className="h-5 w-5" /></button>
      </div>
    </div>
  );
};

export default InterviewPage;
