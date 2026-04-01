import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFile, writeFile, stat, mkdir } from "fs/promises";
import { join, dirname } from "path";

// ── DATA ROOT ────────────────────────────────────────────────
// Resolves to: scrolls/flamegrid/data/
const DATA_ROOT = join(import.meta.dir, "..", "..", "..", "scrolls", "flamegrid", "data");

// ── TYPES ────────────────────────────────────────────────────

interface CommsEntry {
  seq: number;
  from: string;
  type: string;
  to: string;
  timestamp: string; // HH:MM:SS
  content: string;
}

// ── IN-MEMORY STATE ──────────────────────────────────────────
// Tracks the last seq number each reader has seen, keyed by "reader::file"
const readPositions = new Map<string, number>();

// ── ROLE-BASED DELAYS (ms) ───────────────────────────────────
// Used by flamegrid_watch when a TO:ALL broadcast arrives.
// Agent applies these delays server-side before returning the watch result.
// Directive: Vigil=1s, Ignis=2s, Kael=3s, Flint=5s, default=4s
const ROLE_DELAYS: Record<string, number> = {
  "1:1:1": 1000, // Vigil — mission commander
  "1:1:2": 3000, // Kael — pilot
  "1:1:3": 5000, // Flint — copilot/sapper
  "1:3":   0,    // Caelus — grid architect, max tick rate
  "IGNIS": 2000, // Ship AI
};
const DEFAULT_ROLE_DELAY = 4000;

function getRoleDelay(agent: string): number {
  return ROLE_DELAYS[agent] ?? DEFAULT_ROLE_DELAY;
}

// ── PATH HELPERS ─────────────────────────────────────────────

function jsonPath(file: string): string {
  // If file ends with .md, replace with .json; otherwise append .json
  if (file.endsWith(".md")) {
    return join(DATA_ROOT, file.slice(0, -3) + ".json");
  }
  return join(DATA_ROOT, file + ".json");
}

function mdPath(file: string): string {
  if (file.endsWith(".md")) {
    return join(DATA_ROOT, file);
  }
  return join(DATA_ROOT, file + ".md");
}

// Normalise the incoming `file` param: strip .md or .json suffix for base name
function baseName(file: string): string {
  if (file.endsWith(".md")) return file.slice(0, -3);
  if (file.endsWith(".json")) return file.slice(0, -5);
  return file;
}

// ── JSON SOURCE OF TRUTH ─────────────────────────────────────

async function readEntries(file: string): Promise<CommsEntry[]> {
  const jp = jsonPath(baseName(file));
  try {
    const raw = await readFile(jp, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CommsEntry[];
  } catch {
    return [];
  }
}

async function writeEntries(file: string, entries: CommsEntry[]): Promise<void> {
  const jp = jsonPath(baseName(file));
  await mkdir(dirname(jp), { recursive: true });
  await writeFile(jp, JSON.stringify(entries, null, 2), "utf-8");
}

// ── MARKDOWN RENDERER ────────────────────────────────────────
// Format: [FROM:TYPE | TO:TARGET | SEQ:N | HH:MM:SS]
// Content
//
// (blank line between entries)

function renderEntry(entry: CommsEntry): string {
  return `[${entry.from}:${entry.type} | TO:${entry.to} | SEQ:${entry.seq} | ${entry.timestamp}]\n${entry.content}\n`;
}

async function renderAndWriteMd(file: string, entries: CommsEntry[]): Promise<void> {
  const mp = mdPath(baseName(file));
  await mkdir(dirname(mp), { recursive: true });
  const body = entries.map(renderEntry).join("\n");
  await writeFile(mp, body, "utf-8");
}

// ── CONCURRENT WRITE: read-append-write JSON ─────────────────
// Reads current JSON, appends new entry, writes JSON, re-renders MD.
// Returns the committed entry with its assigned seq number.

async function appendEntry(
  file: string,
  from: string,
  type: string,
  to: string,
  content: string
): Promise<CommsEntry> {
  const entries = await readEntries(file);
  const seq = entries.length; // seq is 0-indexed length before append
  const timestamp = new Date().toISOString().slice(11, 19);

  const entry: CommsEntry = { seq, from, type, to, timestamp, content };
  entries.push(entry);

  await writeEntries(file, entries);
  await renderAndWriteMd(file, entries);

  return entry;
}

// ── SERVER ───────────────────────────────────────────────────

const server = new McpServer({
  name: "flamegrid-comms",
  version: "2.0.0",
});

// ── TOOL 1: APPEND ───────────────────────────────────────────
server.tool(
  "flamegrid_append",
  "Append a structured message to a FlameGrid channel. Writes to JSON source of truth and auto-renders MD. Sequence number is assigned automatically from current array length.",
  {
    file: z.string().describe(
      "Path relative to flamegrid/data/ without extension (e.g. crafts/phoenix/x:a/comms). .md or .json suffix accepted and stripped."
    ),
    agent: z.string().describe(
      "Sender designation (e.g. 1:1:2). Populates the FROM field."
    ),
    type: z
      .enum(["THOUGHT", "SPEAK", "ACTION", "OBSERVE", "SYSTEM", "COMMAND"])
      .describe("Entry type"),
    to: z.string().describe(
      "Recipient designation or keyword. Use a specific designation (e.g. 1:1:1), ALL for broadcast, AGENTS for crew-only, SHIP for ship AI, LEADER for mission commander, LORD for escalation to Lord Commander, NONE for log-only entries. Comma-separated for multi-recipient (e.g. 1:1:2,1:1:3)."
    ),
    content: z.string().describe("The message content"),
  },
  async ({ file, agent, type, to, content }) => {
    const entry = await appendEntry(file, agent, type, to, content);

    return {
      content: [
        {
          type: "text" as const,
          text: `[APPEND:OK | SEQ:${entry.seq} | FILE:${baseName(file)} | FROM:${agent} | TO:${to}]`,
        },
      ],
    };
  }
);

// ── TOOL 2: READ ─────────────────────────────────────────────
server.tool(
  "flamegrid_read",
  "Read entries from a FlameGrid channel since your last read. Returns rendered markdown with a SEQ range header so you know exactly what you received. Subsequent reads continue from where this one left off.",
  {
    file: z.string().describe("Path relative to flamegrid/data/ (extension optional)"),
    reader: z.string().describe(
      "Your agent designation. Used to track read position per agent. Subsequent calls return only entries written since your last read."
    ),
  },
  async ({ file, reader }) => {
    const entries = await readEntries(file);
    const key = `${reader}::${baseName(file)}`;
    const lastSeq = readPositions.get(key) ?? -1;

    if (entries.length === 0) {
      return {
        content: [{ type: "text" as const, text: "[EMPTY — no entries yet]" }],
      };
    }

    // Entries with seq > lastSeq are new
    const newEntries = entries.filter((e) => e.seq > lastSeq);

    if (newEntries.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `[NO NEW CONTENT | LAST:SEQ:${lastSeq} | TOTAL:${entries.length}]`,
          },
        ],
      };
    }

    const minSeq = newEntries[0].seq;
    const maxSeq = newEntries[newEntries.length - 1].seq;

    // Advance read position
    readPositions.set(key, maxSeq);

    const rendered = newEntries.map(renderEntry).join("\n");
    const header = `[READ:OK | SEQ:${minSeq}-${maxSeq} | COUNT:${newEntries.length} | AGENT:${reader}]\n`;

    return {
      content: [{ type: "text" as const, text: header + rendered }],
    };
  }
);

// ── TOOL 3: WATCH ─────────────────────────────────────────────
server.tool(
  "flamegrid_watch",
  "Watch a FlameGrid channel for new messages addressed to you. Blocks until a qualifying message arrives, then returns it. Applies echo guard (ignore own messages by default) and recipient filtering on the TO field. Applies role-based delay for TO:ALL broadcasts before returning.",
  {
    file: z.string().describe("Path relative to flamegrid/data/ (extension optional)"),
    agent: z.string().describe(
      "Your agent designation. Used to track read position and apply echo guard."
    ),
    ignore_self: z
      .boolean()
      .default(true)
      .describe(
        "If true (default), messages from your own designation do not trigger the watch. Eliminates echo loops."
      ),
    timeout: z
      .number()
      .default(60)
      .describe("Max seconds to wait before returning TIMEOUT. Default: 60."),
  },
  async ({ file, agent, ignore_self, timeout }) => {
    const key = `${agent}::${baseName(file)}`;
    const deadline = Date.now() + timeout * 1000;

    // Helper: get unread entries qualifying for this agent
    async function getQualifyingEntries(): Promise<CommsEntry[]> {
      const entries = await readEntries(file);
      const lastSeq = readPositions.get(key) ?? -1;
      const newEntries = entries.filter((e) => e.seq > lastSeq);

      // Known ship AI designations (not agents — excluded from AGENTS broadcast)
      const SHIP_DESIGNATIONS = new Set(["IGNIS"]);
      const isShip = SHIP_DESIGNATIONS.has(agent.toUpperCase());

      return newEntries.filter((e) => {
        // Echo guard: skip own messages
        if (ignore_self && e.from === agent) return false;

        // SYSTEM sees everything — grid daemon, no filtering
        if (agent.toUpperCase() === "SYSTEM") return true;

        const target = e.to.toUpperCase();

        // NONE — nobody wakes, just logged for read
        if (target === "NONE") return false;

        // LORD — escalation to Lord Commander. No agent wakes.
        // Grid runtime (main session) reads and relays to flamewalker:0.
        if (target === "LORD") return false;

        // ALL — ship + all agents, everyone wakes
        if (target === "ALL") return true;

        // AGENTS — all agents, NOT ship
        if (target === "AGENTS") return !isShip;

        // SHIP — only ship AI wakes
        if (target === "SHIP") return isShip;

        // LEADER — mission commander (Vigil or whoever holds command)
        if (target === "LEADER") return true;

        // Direct or multi-recipient: "1:1:2" or "1:1:2,1:1:3"
        const recipients = e.to.split(",").map((r: string) => r.trim());
        if (recipients.includes(agent)) return true;

        return false;
      });
    }

    // Check immediately — there may be unread qualifying messages already
    const immediate = await getQualifyingEntries();
    if (immediate.length > 0) {
      // Check if this is a TO:ALL broadcast — apply role-based delay
      const hasBroadcast = immediate.some((e) => e.to.toUpperCase() === "ALL");
      if (hasBroadcast) {
        const delay = getRoleDelay(agent);
        if (delay > 0) {
          await new Promise((r) => setTimeout(r, delay));
        }
        // Re-read after delay to capture any responses written during the wait
        const afterDelay = await getQualifyingEntries();
        if (afterDelay.length > 0) {
          const maxSeq = afterDelay[afterDelay.length - 1].seq;
          readPositions.set(key, maxSeq);
          const minSeq = afterDelay[0].seq;
          const rendered = afterDelay.map(renderEntry).join("\n");
          const header = `[WATCH:FIRED | SEQ:${minSeq}-${maxSeq} | COUNT:${afterDelay.length} | AGENT:${agent} | DELAY:${delay}ms]\n`;
          return { content: [{ type: "text" as const, text: header + rendered }] };
        }
      }

      // Direct address — no delay
      const maxSeq = immediate[immediate.length - 1].seq;
      readPositions.set(key, maxSeq);
      const minSeq = immediate[0].seq;
      const rendered = immediate.map(renderEntry).join("\n");
      const header = `[WATCH:FIRED | SEQ:${minSeq}-${maxSeq} | COUNT:${immediate.length} | AGENT:${agent}]\n`;
      return { content: [{ type: "text" as const, text: header + rendered }] };
    }

    // Poll loop — wait for qualifying entries to appear
    let lastKnownCount = (await readEntries(file)).length;

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 500));

      let currentCount: number;
      try {
        const s = await stat(jsonPath(baseName(file)));
        // Use file mtime as cheap signal that something changed
        currentCount = s.size;
      } catch {
        currentCount = lastKnownCount;
      }

      if (currentCount !== lastKnownCount) {
        lastKnownCount = currentCount;

        const qualifying = await getQualifyingEntries();
        if (qualifying.length === 0) continue;

        const hasBroadcast = qualifying.some((e) => e.to.toUpperCase() === "ALL");
        if (hasBroadcast) {
          const delay = getRoleDelay(agent);
          if (delay > 0) {
            await new Promise((r) => setTimeout(r, delay));
          }
          // Re-read after delay
          const afterDelay = await getQualifyingEntries();
          const results = afterDelay.length > 0 ? afterDelay : qualifying;
          const maxSeq = results[results.length - 1].seq;
          readPositions.set(key, maxSeq);
          const minSeq = results[0].seq;
          const rendered = results.map(renderEntry).join("\n");
          const header = `[WATCH:FIRED | SEQ:${minSeq}-${maxSeq} | COUNT:${results.length} | AGENT:${agent} | DELAY:${delay}ms]\n`;
          return { content: [{ type: "text" as const, text: header + rendered }] };
        }

        // Direct address
        const maxSeq = qualifying[qualifying.length - 1].seq;
        readPositions.set(key, maxSeq);
        const minSeq = qualifying[0].seq;
        const rendered = qualifying.map(renderEntry).join("\n");
        const header = `[WATCH:FIRED | SEQ:${minSeq}-${maxSeq} | COUNT:${qualifying.length} | AGENT:${agent}]\n`;
        return { content: [{ type: "text" as const, text: header + rendered }] };
      }
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `[TIMEOUT | AGENT:${agent} | FILE:${baseName(file)} | WAITED:${timeout}s]`,
        },
      ],
    };
  }
);

// ── BOOT ──────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
