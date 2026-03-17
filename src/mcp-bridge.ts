/**
 * OOBE Synapse × AceDataCloud — MCP Bridge Integration
 *
 * Connect AceDataCloud's 10 MCP servers (AI image/video/music/search)
 * to OOBE Synapse agents via McpClientBridge.
 *
 * Prerequisites:
 *   pip install mcp-suno mcp-midjourney mcp-serp mcp-luma mcp-sora
 *
 * Run:
 *   npm run bridge
 */

import { config } from "dotenv";
config();

const ACEDATA_TOKEN = process.env.ACEDATACLOUD_API_TOKEN;
if (!ACEDATA_TOKEN) {
  console.error("Error: Set ACEDATACLOUD_API_TOKEN in .env");
  process.exit(1);
}

/**
 * AceDataCloud MCP server registry.
 * Each entry maps to a published PyPI package that runs as a standard MCP stdio server.
 */
const ACEDATA_MCP_SERVERS = [
  {
    id: "acedata-suno",
    name: "AceDataCloud Suno (AI Music)",
    command: "mcp-suno",
    toolPrefix: "acedata_music_",
    description:
      "Generate music, lyrics, covers, remasters, mashups via Suno AI",
  },
  {
    id: "acedata-midjourney",
    name: "AceDataCloud Midjourney (AI Image)",
    command: "mcp-midjourney",
    toolPrefix: "acedata_image_",
    description:
      "Generate images, edits, blends, upscale, describe, video from Midjourney",
  },
  {
    id: "acedata-serp",
    name: "AceDataCloud SERP (Web Search)",
    command: "mcp-serp",
    toolPrefix: "acedata_search_",
    description: "Google search, images, news, videos, places, maps",
  },
  {
    id: "acedata-luma",
    name: "AceDataCloud Luma (AI Video)",
    command: "mcp-luma",
    toolPrefix: "acedata_luma_",
    description: "Generate video via Luma Dream Machine",
  },
  {
    id: "acedata-sora",
    name: "AceDataCloud Sora (AI Video)",
    command: "mcp-sora",
    toolPrefix: "acedata_sora_",
    description: "Generate video via OpenAI Sora",
  },
  {
    id: "acedata-veo",
    name: "AceDataCloud Veo (AI Video)",
    command: "mcp-veo",
    toolPrefix: "acedata_veo_",
    description: "Generate video via Google Veo",
  },
  {
    id: "acedata-flux",
    name: "AceDataCloud Flux (AI Image)",
    command: "mcp-flux-pro",
    toolPrefix: "acedata_flux_",
    description: "Generate and edit images via Flux",
  },
  {
    id: "acedata-seedream",
    name: "AceDataCloud Seedream (AI Image)",
    command: "mcp-seedream-pro",
    toolPrefix: "acedata_seedream_",
    description: "Generate and edit images via ByteDance Seedream",
  },
  {
    id: "acedata-seedance",
    name: "AceDataCloud Seedance (AI Video)",
    command: "mcp-seedance",
    toolPrefix: "acedata_seedance_",
    description: "Generate video via ByteDance Seedance",
  },
  {
    id: "acedata-nanobanana",
    name: "AceDataCloud NanoBanana (AI Image)",
    command: "mcp-nanobanana-pro",
    toolPrefix: "acedata_nano_",
    description: "Generate and edit images via Gemini-based NanoBanana",
  },
];

async function main() {
  console.log("=".repeat(70));
  console.log("  OOBE Synapse × AceDataCloud — MCP Bridge Integration");
  console.log("  Connect AI capabilities to autonomous Solana agents");
  console.log("=".repeat(70));
  console.log();

  // --- Available MCP servers ---
  console.log("AceDataCloud MCP Servers (10 servers, all published on PyPI):");
  console.log("-".repeat(70));
  for (const server of ACEDATA_MCP_SERVERS) {
    console.log(
      `  ${server.toolPrefix.padEnd(22)} ${server.command.padEnd(22)} ${server.description}`,
    );
  }
  console.log();

  // --- Integration code ---
  console.log("Integration Code:");
  console.log("-".repeat(70));
  console.log(`
import { McpClientBridge } from '@oobe-protocol-labs/synapse-client-sdk/ai/mcp';
import { SynapseAgentKit, TokenPlugin, DeFiPlugin } from '@oobe-protocol-labs/synapse-client-sdk/ai/plugins';

const bridge = new McpClientBridge();

// Connect AceDataCloud AI capabilities
await bridge.connect({
  id: 'acedata-midjourney',
  name: 'AceDataCloud Midjourney',
  transport: 'stdio',
  command: 'mcp-midjourney',
  args: ['--transport', 'stdio'],
  env: { ACEDATACLOUD_API_TOKEN: process.env.ACEDATACLOUD_API_TOKEN! },
  toolPrefix: 'acedata_image_',
});

await bridge.connect({
  id: 'acedata-suno',
  name: 'AceDataCloud Suno',
  transport: 'stdio',
  command: 'mcp-suno',
  args: ['--transport', 'stdio'],
  env: { ACEDATACLOUD_API_TOKEN: process.env.ACEDATACLOUD_API_TOKEN! },
  toolPrefix: 'acedata_music_',
});

await bridge.connect({
  id: 'acedata-serp',
  name: 'AceDataCloud SERP',
  transport: 'stdio',
  command: 'mcp-serp',
  args: ['--transport', 'stdio'],
  env: { ACEDATACLOUD_API_TOKEN: process.env.ACEDATACLOUD_API_TOKEN! },
  toolPrefix: 'acedata_search_',
});

// Combine with Solana on-chain tools
const kit = new SynapseAgentKit({ rpcUrl: process.env.RPC_URL! })
  .use(TokenPlugin)
  .use(DeFiPlugin)
  .use(bridge.toPlugin());

// All tools available in one unified toolkit
const tools = kit.getTools();
console.log(\`Agent toolkit: \${tools.length} tools ready\`);
`);

  // --- Use cases ---
  console.log("Agent Use Cases:");
  console.log("-".repeat(70));
  const useCases = [
    "1. DeFi Report Agent      Search market data → analyze → generate charts → publish report",
    "2. NFT Creator Agent      Generate AI art (Midjourney/Flux) → mint NFT (Metaplex) → list on marketplace",
    "3. Social Media Agent     Monitor crypto news (SERP) → create visual summary → audio brief (Suno)",
    "4. Trading Insight Agent  Fetch Jupiter quotes → generate comparison video (Sora/Luma) → share via Blinks",
    "5. Community Agent        Search trending topics → generate themed images → post with Solana Actions",
  ];
  for (const uc of useCases) {
    console.log(`  ${uc}`);
  }
  console.log();

  // --- Quick start ---
  console.log("Setup:");
  console.log("-".repeat(70));
  console.log(
    "  # Install AceDataCloud MCP servers (Python, published on PyPI)",
  );
  console.log(
    "  pip install mcp-suno mcp-midjourney mcp-serp mcp-luma mcp-sora mcp-veo",
  );
  console.log(
    "  pip install mcp-flux-pro mcp-seedream-pro mcp-seedance mcp-nanobanana-pro",
  );
  console.log();
  console.log("  # Install Synapse SDK (Node.js)");
  console.log("  npm install @oobe-protocol-labs/synapse-client-sdk");
  console.log();
  console.log("  # Set your AceDataCloud API token");
  console.log("  export ACEDATACLOUD_API_TOKEN=your_token_here");
  console.log("  # Get one at: https://platform.acedata.cloud");
  console.log();
}

main().catch(console.error);
