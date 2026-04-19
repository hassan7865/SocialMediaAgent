import { useMutation } from "@tanstack/react-query";
import { api, API_URL } from "@/lib/api";

interface GeneratePostRequest {
  prompt: string;
  platform: string;
}

interface GeneratePostResponseBody {
  content: string;
}

/** Normalize SSE newlines (CRLF breaks parsers that only look for \n\n). */
function normalizeSseText(s: string): string {
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * Split SSE events on blank lines, parse each `data:` JSON line.
 * Returns unconsumed tail (incomplete event).
 */
function consumeSseBuffer(
  buffer: string,
  onDelta: (text: string) => void,
): { rest: string } {
  const normalized = normalizeSseText(buffer);
  let carry = normalized;
  let idx: number;
  while ((idx = carry.indexOf("\n\n")) !== -1) {
    const block = carry.slice(0, idx);
    carry = carry.slice(idx + 2);
    for (const line of block.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trimStart();
      if (!payload) continue;
      let data: { text?: string; error?: string; done?: boolean };
      try {
        data = JSON.parse(payload) as { text?: string; error?: string; done?: boolean };
      } catch {
        continue;
      }
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.text) {
        onDelta(data.text);
      }
    }
  }
  return { rest: carry };
}

function isAbortError(e: unknown): boolean {
  if (e instanceof DOMException && e.name === "AbortError") return true;
  return e instanceof Error && e.name === "AbortError";
}

export async function streamAIGeneratePost(
  body: GeneratePostRequest,
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const url = `${API_URL}/api/ai/generate-stream`;

  const post = () =>
    fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify(body),
      signal,
    });

  let res: Response;
  try {
    res = await post();
    if (res.status === 401) {
      await fetch(`${API_URL}/api/auth/refresh`, { method: "POST", credentials: "include" });
      res = await post();
    }
  } catch (e) {
    if (signal?.aborted || isAbortError(e)) return;
    throw e;
  }

  if (!res.ok) {
    let detail = "";
    try {
      const j = (await res.json()) as { detail?: unknown };
      detail = typeof j?.detail === "string" ? j.detail : "";
    } catch {
      detail = await res.text();
    }
    throw new Error(detail || `Generation failed (${res.status})`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("No response body from AI stream");
  }

  const decoder = new TextDecoder();
  let raw = "";

  try {
    while (true) {
      if (signal?.aborted) break;
      const { done, value } = await reader.read();
      if (value) {
        raw += decoder.decode(value, { stream: true });
        const { rest } = consumeSseBuffer(raw, onDelta);
        raw = rest;
      }
      if (done) {
        raw += decoder.decode();
        const { rest } = consumeSseBuffer(raw, onDelta);
        raw = rest;
        break;
      }
    }
  } catch (e) {
    if (signal?.aborted || isAbortError(e)) return;
    throw e;
  }

  if (signal?.aborted) return;

  // Flush last event if server omitted trailing \n\n or used CRLF-only boundaries
  if (raw.trim()) {
    consumeSseBuffer(`${raw}\n\n`, onDelta);
  }
}

/** Non-streaming fallback; FastAPI returns `{ "content": "..." }` (not wrapped in ApiResponse). */
export async function generatePostNonStreaming(body: GeneratePostRequest): Promise<string> {
  const response = await api.post<GeneratePostResponseBody>("/api/ai/generate", body);
  const c = response.data?.content;
  return typeof c === "string" ? c : "";
}

export function useAIGeneratePost() {
  return useMutation({
    mutationFn: (data: GeneratePostRequest) => generatePostNonStreaming(data),
  });
}
