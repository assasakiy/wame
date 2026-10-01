import { env } from "@/shared/config/env";
import { TOOLS, type ToolContext } from "@/modules/ai-agent/application/tools";
import type { ToolName } from "@/modules/ai-agent/domain/agents";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface ToolCall {
  id: string;
  function: { name: string; arguments: string };
}

interface LlmMessage {
  role: string;
  content?: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export const llmEnabled = () => Boolean(env.openai.apiKey);

/** OpenAI-compatible chat completion with a tool-calling loop (max 4 rounds). */
export async function runLlm(opts: { system: string; history: ChatTurn[]; tools: ToolName[]; ctx: ToolContext }): Promise<string> {
  const messages: LlmMessage[] = [{ role: "system", content: opts.system }, ...opts.history];
  const toolDefs = opts.tools.map((name) => ({
    type: "function",
    function: { name, description: TOOLS[name].description, parameters: TOOLS[name].parameters },
  }));

  for (let round = 0; round < 4; round++) {
    const res = await fetch(`${env.openai.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${env.openai.apiKey}` },
      body: JSON.stringify({ model: env.openai.model, messages, temperature: 0.3, ...(toolDefs.length ? { tools: toolDefs } : {}) }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`LLM request failed (${res.status})`);
    const data = (await res.json()) as { choices?: { message?: LlmMessage }[] };
    const message = data.choices?.[0]?.message;
    if (!message) throw new Error("LLM returned no message");

    if (!message.tool_calls?.length) return message.content ?? "";
    messages.push(message);
    for (const call of message.tool_calls) {
      const name = call.function.name as ToolName;
      let output: unknown = { error: "Tool not available" };
      if (opts.tools.includes(name)) {
        try {
          output = await TOOLS[name].run(opts.ctx, JSON.parse(call.function.arguments || "{}"));
        } catch (e) {
          output = { error: e instanceof Error ? e.message : String(e) };
        }
      }
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(output).slice(0, 6000) });
    }
  }
  return "Sorry, I could not complete that request.";
}
