/**
 * OOBE Synapse × AceDataCloud — Live MCP Bridge Image Generation
 *
 * Uses OOBE's McpClientBridge to connect to AceDataCloud's mcp-midjourney
 * server, then calls the midjourney_imagine tool through the MCP protocol
 * to generate a real image.
 *
 * This is the actual integration path: Synapse SDK → MCP protocol → AceDataCloud.
 *
 * Run:
 *   npm run imagine
 */

import { config } from "dotenv";
config();

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { McpClientBridge } = require("@oobe-protocol-labs/synapse-client-sdk/ai/mcp");

const TOKEN = process.env.ACEDATACLOUD_API_TOKEN;

if (!TOKEN) {
  console.error("Missing ACEDATACLOUD_API_TOKEN in .env");
  process.exit(1);
}

async function main() {
  const prompt =
    process.argv[2] ||
    "A Solana-themed robot artist painting on a digital canvas, cyberpunk style, neon purple and green, futuristic art studio --ar 16:9 --v 6.1";

  console.log("=".repeat(70));
  console.log("  OOBE Synapse × AceDataCloud — MCP Bridge Live Run");
  console.log("=".repeat(70));
  console.log();

  // ─── Step 1: Create the bridge ───
  const bridge = new McpClientBridge();
  console.log("  [1/5] Created McpClientBridge (Synapse SDK)");

  // ─── Step 2: Connect to AceDataCloud MCP server via stdio ───
  console.log("  [2/5] Connecting to mcp-midjourney via stdio...");
  await bridge.connect({
    id: "acedata-midjourney",
    name: "AceDataCloud Midjourney",
    transport: "stdio",
    command: "mcp-midjourney",
    args: ["--transport", "stdio"],
    env: { ACEDATACLOUD_API_TOKEN: TOKEN },
    timeout: 300_000,  // 5min — Midjourney generation takes 30-120s
  });

  const status = bridge.getStatus("acedata-midjourney");
  console.log(`         Status: ${status}`);

  // ─── Step 3: List available tools ───
  const tools = bridge.getServerTools("acedata-midjourney");
  console.log(
    `  [3/5] Discovered ${tools.length} tools from mcp-midjourney:`,
  );
  for (const tool of tools) {
    console.log(`         - ${tool.name}`);
  }
  console.log();

  // ─── Step 4: Call midjourney_imagine via the bridge ───
  console.log(`  [4/5] Calling midjourney_imagine via MCP bridge...`);
  console.log(`         Prompt: "${prompt}"`);
  console.log(`         (this takes 30-90s)`);
  console.log();

  const start = Date.now();

  const result = await bridge.callTool("acedata-midjourney", "midjourney_imagine", {
    prompt,
    mode: "fast",
    timeout: 480,
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  // ─── Step 5: Show result ───
  console.log(`  [5/5] Result (${elapsed}s):`);
  console.log("-".repeat(70));

  // MCP tool results come back as content array
  if (result?.content) {
    for (const item of result.content) {
      if (item.type === "text") {
        try {
          const data = JSON.parse(item.text);
          console.log(`  Success:     ${data.success}`);
          console.log(`  Task ID:     ${data.task_id}`);
          console.log(`  Image ID:    ${data.image_id}`);
          console.log(`  Size:        ${data.raw_image_width}×${data.raw_image_height}`);
          console.log(`  Image URL:   ${data.image_url}`);
          if (data.actions?.length) {
            console.log(`  Actions:     ${data.actions.join(", ")}`);
          }
        } catch {
          console.log(`  ${item.text}`);
        }
      } else if (item.type === "image") {
        console.log(`  [Image data received, mime: ${item.mimeType}]`);
      }
    }
  } else {
    console.log("  Raw result:", JSON.stringify(result, null, 2));
  }

  console.log();
  console.log("  Flow: Synapse McpClientBridge → stdio → mcp-midjourney → api.acedata.cloud");
  console.log();

  // ─── Cleanup ───
  await bridge.disconnectAll();
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
