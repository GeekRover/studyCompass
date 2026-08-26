export interface GrokChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GrokCompletionOptions {
  messages: GrokChatMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" | "text" };
}

export function isGrokConfigured(): boolean {
  const apiKey = (process.env.GROK_API_KEY ?? process.env.XAI_API_KEY ?? "").trim();
  return apiKey.length > 0;
}

export function getGrokModelName(): string {
  return process.env.GROK_MODEL || "grok-2-latest";
}

export function getGrokBaseUrl(): string {
  return (process.env.GROK_BASE_URL || "https://api.x.ai/v1").replace(/\/+$/, "");
}

/**
 * Executes a chat completion request against the xAI Grok API.
 */
export async function callGrokChatCompletion(options: GrokCompletionOptions): Promise<string> {
  const apiKey = (process.env.GROK_API_KEY ?? process.env.XAI_API_KEY ?? "").trim();

  if (!apiKey) {
    throw new Error("GROK_API_KEY is not configured in environment variables.");
  }

  const baseUrl = getGrokBaseUrl();
  const model = getGrokModelName();
  const endpoint = `${baseUrl}/chat/completions`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const payload: Record<string, unknown> = {
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.4,
      max_tokens: options.maxTokens ?? 2048
    };

    if (options.responseFormat) {
      payload.response_format = options.responseFormat;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      let errorMessage = `Grok API error: HTTP ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = `Grok API error: ${errorJson.error.message}`;
        }
      } catch {
        if (errorText) {
          errorMessage = `Grok API error: ${errorText}`;
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const messageContent = data?.choices?.[0]?.message?.content;

    if (typeof messageContent !== "string") {
      throw new Error("Invalid response format received from Grok API.");
    }

    return messageContent;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extracts and parses JSON from a Grok response that may contain Markdown code blocks.
 */
export function extractJsonFromGrokResponse<T>(content: string): T {
  let cleaned = content.trim();

  // Strip markdown code fences if present (e.g. ```json ... ``` or ``` ...)
  if (cleaned.startsWith("```")) {
    const lines = cleaned.split("\n");
    if (lines[0].startsWith("```")) {
      lines.shift();
    }
    if (lines.length > 0 && lines[lines.length - 1].trim().endsWith("```")) {
      lines.pop();
    }
    cleaned = lines.join("\n").trim();
  }

  // Attempt standard JSON parse
  return JSON.parse(cleaned) as T;
}
