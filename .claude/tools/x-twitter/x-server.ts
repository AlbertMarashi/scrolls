import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// --- Load credentials from .secrets/x-twitter.env ---

const ENV_PATH = resolve(import.meta.dirname, "../../../.secrets/x-twitter.env");

function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  try {
    const content = readFileSync(ENV_PATH, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [k, ...rest] = trimmed.split("=");
        env[k] = rest.join("=");
      }
    }
  } catch (e) {
    console.error(`[x-twitter] Failed to load ${ENV_PATH}: ${e}`);
  }
  return env;
}

const secrets = loadEnv();

// --- OAuth 1.0a signing (from openclaw extension) ---

const BASE_URL = "https://api.x.com/2";

function pct(s: string): string {
  return encodeURIComponent(s).replace(
    /[!'()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

function oauthHeader(
  method: string,
  url: string,
  queryParams: Record<string, string> = {}
): string {
  const oauth: Record<string, string> = {
    oauth_consumer_key: secrets.X_CONSUMER_KEY,
    oauth_nonce:
      Math.random().toString(36).slice(2) + Date.now().toString(36),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: secrets.X_ACCESS_TOKEN,
    oauth_version: "1.0",
  };

  const allParams = { ...queryParams, ...oauth };
  const paramStr = Object.keys(allParams)
    .sort()
    .map((k) => `${pct(k)}=${pct(allParams[k])}`)
    .join("&");

  const base = `${method.toUpperCase()}&${pct(url)}&${pct(paramStr)}`;
  const signingKey = `${pct(secrets.X_CONSUMER_SECRET)}&${pct(secrets.X_ACCESS_SECRET)}`;
  const sig = createHmac("sha1", signingKey).update(base).digest("base64");
  oauth.oauth_signature = sig;

  return (
    "OAuth " +
    Object.keys(oauth)
      .sort()
      .map((k) => `${pct(k)}="${pct(oauth[k])}"`)
      .join(", ")
  );
}

async function xRequest(
  method: string,
  endpoint: string,
  query: Record<string, string> = {},
  body?: object
): Promise<{ ok: boolean; status: number; data?: unknown; error?: string }> {
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  const url = `${BASE_URL}/${cleanEndpoint}`;

  const qs = new URLSearchParams(query).toString();
  const fullUrl = qs ? `${url}?${qs}` : url;

  const auth = oauthHeader(method, url, query);

  const headers: Record<string, string> = { Authorization: auth };
  if (body) headers["Content-Type"] = "application/json";

  try {
    const res = await fetch(fullUrl, {
      method: method.toUpperCase(),
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data: unknown;
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: typeof data === "string" ? data : JSON.stringify(data),
        data,
      };
    }

    return { ok: true, status: res.status, data };
  } catch (e: unknown) {
    return { ok: false, status: 0, error: String(e) };
  }
}

// --- MCP Server ---

const server = new McpServer({
  name: "x-twitter",
  version: "1.0.0",
});

server.tool(
  "x_api",
  `Call the X (Twitter) API v2. OAuth 1.0a is handled automatically.

Examples:
- Search recent tweets:  method=GET  endpoint=/tweets/search/recent  query={"query":"from:elonmusk","max_results":"10","tweet.fields":"created_at,public_metrics,author_id","expansions":"author_id","user.fields":"name,username"}
- Get tweet by ID:       method=GET  endpoint=/tweets/TWEET_ID       query={"tweet.fields":"created_at,public_metrics,conversation_id,author_id","expansions":"author_id","user.fields":"name,username"}
- Get user by username:  method=GET  endpoint=/users/by/username/USERNAME  query={"user.fields":"created_at,description,public_metrics"}
- Get user timeline:     method=GET  endpoint=/users/USER_ID/tweets  query={"max_results":"10","tweet.fields":"created_at,public_metrics"}
- Get my profile:        method=GET  endpoint=/users/me              query={"user.fields":"id,name,username,public_metrics"}
- Post a tweet:          method=POST endpoint=/tweets                body={"text":"hello"}
- Reply to tweet:        method=POST endpoint=/tweets                body={"text":"reply","reply":{"in_reply_to_tweet_id":"123"}}
- Like a tweet:          method=POST endpoint=/users/1749280974909943808/likes  body={"tweet_id":"123"}
- Retweet:               method=POST endpoint=/users/1749280974909943808/retweets  body={"tweet_id":"123"}
- Read a thread:         method=GET  endpoint=/tweets/search/recent  query={"query":"conversation_id:CONV_ID","tweet.fields":"created_at,author_id","expansions":"author_id","user.fields":"name,username","max_results":"100"}

Search query operators: from:user, to:user, #hashtag, "exact phrase", lang:en, -is:retweet, is:reply, has:media, has:links, conversation_id:ID

@Autosynthdev user ID: 1749280974909943808
Tweet character limit: 280 (free tier)`,
  {
    method: z.enum(["GET", "POST", "PUT", "DELETE"]).describe("HTTP method"),
    endpoint: z
      .string()
      .describe("API path relative to /2, e.g. /tweets/search/recent"),
    query: z
      .record(z.string())
      .optional()
      .describe("Query string parameters"),
    body: z
      .record(z.unknown())
      .optional()
      .describe("JSON request body (for POST/PUT)"),
  },
  async ({ method, endpoint, query, body }) => {
    const result = await xRequest(method, endpoint, query ?? {}, body);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// Start
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[x-twitter] MCP server running on stdio");
