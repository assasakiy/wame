"use client";

import { Bot, SendHorizonal, User } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { useApiAction } from "@/shared/hooks/useApiAction";
import { cn } from "@/shared/utils/format";

interface Turn {
  role: string;
  content: string;
}

export interface AgentOption {
  type: string;
  label: string;
  description: string;
  suggestions: string[];
}

export function AgentChat({ agents, initial }: { agents: AgentOption[]; initial: Record<string, Turn[]> }) {
  const { run, loading, error } = useApiAction();
  const [agent, setAgent] = useState(agents[0].type);
  const [chats, setChats] = useState(initial);
  const [input, setInput] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const current = agents.find((a) => a.type === agent) ?? agents[0];
  const turns = chats[agent] ?? [];

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns.length, loading]);

  async function send(text: string) {
    if (!text.trim()) return;
    setChats((c) => ({ ...c, [agent]: [...(c[agent] ?? []), { role: "user", content: text }] }));
    setInput("");
    const res = await run<{ reply: string }>("/api/ai/chat", "POST", { agent, message: text }, { refresh: false });
    if (res) setChats((c) => ({ ...c, [agent]: [...(c[agent] ?? []), { role: "assistant", content: res.reply }] }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <div className="flex flex-col">
      <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 pt-3">
        {agents.map((a) => (
          <button
            key={a.type}
            onClick={() => setAgent(a.type)}
            className={cn("whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-medium", a.type === agent ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:text-slate-800")}
          >
            {a.label}
          </button>
        ))}
      </div>
      <p className="px-5 pt-3 text-xs text-slate-500">{current.description}</p>

      <div className="h-96 space-y-3 overflow-y-auto px-5 py-4">
        {!turns.length && (
          <div className="flex flex-wrap gap-2">
            {current.suggestions.map((s) => (
              <button key={s} onClick={() => void send(s)} className="rounded-full border border-slate-200 px-3 py-1.5 text-left text-xs text-slate-600 hover:border-emerald-400 hover:text-emerald-700">{s}</button>
            ))}
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className={cn("flex gap-2", t.role === "user" && "flex-row-reverse")}>
            <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", t.role === "user" ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-700")}>
              {t.role === "user" ? <User size={14} /> : <Bot size={14} />}
            </span>
            <div className={cn("max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm", t.role === "user" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-800")}>{t.content}</div>
          </div>
        ))}
        {loading && <p className="text-xs text-slate-500">Agent is working with its tools…</p>}
        <div ref={bottom} />
      </div>

      {error && <div className="px-5 pb-3"><Alert tone="error">{error}</Alert></div>}
      <form onSubmit={submit} className="flex gap-2 border-t border-slate-100 p-4">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Ask the ${current.label}…`} maxLength={2000} />
        <Button type="submit" disabled={loading || !input.trim()} aria-label="Send"><SendHorizonal size={16} /></Button>
      </form>
    </div>
  );
}
