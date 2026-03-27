import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFile, appendFile, writeFile, stat, mkdir } from "fs/promises";
import { join, dirname } from "path";

const DATA_ROOT = join(import.meta.dir, "..", "..", "..", "scrolls", "flamegrid", "data");

// Track read positions per reader per file
const readPositions = new Map<string, number>();

const server = new McpServer({
  name: "flamegrid-comms",
  version: "0.1.0",
});

// ── TOOL 1: APPEND ──────────────────────────────────────────
server.tool(
  "flamegrid_append",
  "Append a structured message to a FlameGrid channel file. Used for comms, thoughts, actions, observations.",
  {
    file: z.string().describe("Path relative to flamegrid/data/ (e.g. crafts/phoenix/x:a/comms.md)"),
    agent: z.string().describe("Agent designation (e.g. 1:1:2)"),
    type: z.enum(["THOUGHT", "SPEAK", "ACTION", "OBSERVE", "SYSTEM", "COMMAND"]).describe("Entry type"),
    content: z.string().describe("The message content"),
  },
  async ({ file, agent, type, content }) => {
    const filepath = join(DATA_ROOT, file);
    await mkdir(dirname(filepath), { recursive: true });

    const timestamp = new Date().toISOString().slice(11, 19);
    const entry = `\n[${agent}:${type} | ${timestamp}]\n${content}\n`;

    await appendFile(filepath, entry, "utf-8");

    return {
      content: [{ type: "text" as const, text: `Appended ${type} to ${file}` }],
    };
  }
);

// ── TOOL 2: READ NEW ────────────────────────────────────────
server.tool(
  "flamegrid_read",
  "Read new content from a FlameGrid file since your last read. Returns only what's been added since you last checked.",
  {
    file: z.string().describe("Path relative to flamegrid/data/"),
    reader: z.string().describe("Your agent designation (tracks your read position)"),
  },
  async ({ file, reader }) => {
    const filepath = join(DATA_ROOT, file);
    const key = `${reader}::${file}`;

    let content: string;
    try {
      content = await readFile(filepath, "utf-8");
    } catch {
      return {
        content: [{ type: "text" as const, text: "[EMPTY — file does not exist yet]" }],
      };
    }

    const lastPos = readPositions.get(key) ?? 0;
    const newContent = content.slice(lastPos);
    readPositions.set(key, content.length);

    if (!newContent.trim()) {
      return {
        content: [{ type: "text" as const, text: "[NO NEW CONTENT]" }],
      };
    }

    return {
      content: [{ type: "text" as const, text: newContent }],
    };
  }
);

// ── TOOL 3: WATCH ───────────────────────────────────────────
server.tool(
  "flamegrid_watch",
  "Watch a FlameGrid file for changes. Blocks until the file is modified, then returns the new content. Use this to await comms, sensor updates, or commands.",
  {
    file: z.string().describe("Path relative to flamegrid/data/"),
    reader: z.string().describe("Your agent designation"),
    timeout: z.number().default(60).describe("Max seconds to wait (default 60)"),
  },
  async ({ file, reader, timeout }) => {
    const filepath = join(DATA_ROOT, file);
    const key = `${reader}::${file}`;

    // Get current state
    let currentSize: number;
    let currentContent: string;
    try {
      currentContent = await readFile(filepath, "utf-8");
      currentSize = currentContent.length;
    } catch {
      currentSize = 0;
      currentContent = "";
    }

    const lastPos = readPositions.get(key) ?? 0;

    // If there's already unread content, return it immediately
    if (currentSize > lastPos) {
      const newContent = currentContent.slice(lastPos);
      readPositions.set(key, currentSize);
      return {
        content: [{ type: "text" as const, text: newContent }],
      };
    }

    // Otherwise, poll until change or timeout
    const deadline = Date.now() + timeout * 1000;

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 500));

      try {
        const s = await stat(filepath);
        if (s.size !== currentSize) {
          const updated = await readFile(filepath, "utf-8");
          const newContent = updated.slice(currentSize);
          readPositions.set(key, updated.length);
          return {
            content: [{ type: "text" as const, text: newContent }],
          };
        }
      } catch {
        // file might not exist yet, keep waiting
      }
    }

    return {
      content: [{ type: "text" as const, text: "[TIMEOUT — no changes detected]" }],
    };
  }
);

// ── BOOT ────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
