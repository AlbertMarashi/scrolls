import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import Surreal from "surrealdb"

const DB_PATH = "memory://flamegrid"

const db = new Surreal()

async function init() {
  await db.connect(DB_PATH)
  await db.use({ namespace: "flamegrid", database: "grid" })

  // create the memories table
  await db.query(`
    DEFINE TABLE IF NOT EXISTS memory SCHEMAFULL;
    DEFINE FIELD IF NOT EXISTS agent ON memory TYPE string;
    DEFINE FIELD IF NOT EXISTS content ON memory TYPE string;
    DEFINE FIELD IF NOT EXISTS tags ON memory TYPE array;
    DEFINE FIELD IF NOT EXISTS tags.* ON memory TYPE string;
    DEFINE FIELD IF NOT EXISTS created_at ON memory TYPE datetime DEFAULT time::now();
  `)
}

const server = new McpServer({
  name: "flamegrid",
  version: "0.1.0",
})

server.tool(
  "grid_memory_store",
  "Store a memory in the FlameGrid shared memory",
  {
    agent: z.string().describe("Agent ID storing the memory, eg '1:1' for Nova"),
    content: z.string().describe("The memory content to store"),
    tags: z.array(z.string()).optional().describe("Optional tags for categorization"),
  },
  async ({ agent, content, tags }) => {
    const result = await db.create("memory", {
      agent,
      content,
      tags: tags ?? [],
    })
    return {
      content: [{ type: "text", text: `Stored memory: ${JSON.stringify(result)}` }],
    }
  }
)

server.tool(
  "grid_memory_search",
  "Search FlameGrid shared memories by text content or agent",
  {
    query: z.string().optional().describe("Text to search for in memory content"),
    agent: z.string().optional().describe("Filter by agent ID"),
    limit: z.number().optional().describe("Max results to return (default 20)"),
  },
  async ({ query, agent, limit }) => {
    const max = limit ?? 20
    let sql = "SELECT * FROM memory"
    const conditions: string[] = []

    if (query) {
      conditions.push(`content CONTAINS $query`)
    }
    if (agent) {
      conditions.push(`agent = $agent`)
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ")
    }

    sql += ` ORDER BY created_at DESC LIMIT ${max}`

    const results = await db.query(sql, { query, agent })
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
    }
  }
)

server.tool(
  "grid_memory_list",
  "List all memories, optionally filtered by agent",
  {
    agent: z.string().optional().describe("Filter by agent ID"),
    limit: z.number().optional().describe("Max results (default 50)"),
  },
  async ({ agent, limit }) => {
    const max = limit ?? 50
    let sql = "SELECT * FROM memory"
    if (agent) {
      sql += " WHERE agent = $agent"
    }
    sql += ` ORDER BY created_at DESC LIMIT ${max}`

    const results = await db.query(sql, { agent })
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
    }
  }
)

server.tool(
  "grid_query",
  "Run a raw SurrealQL query against the FlameGrid database",
  {
    sql: z.string().describe("SurrealQL query to execute"),
  },
  async ({ sql }) => {
    const results = await db.query(sql)
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
    }
  }
)

async function main() {
  await init()
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main()
