/**
 * OOBE Synapse × AceDataCloud — Agent Toolkit
 *
 * Shows realistic agent scenarios: autonomous Solana agents that can
 * trade on DEXs AND generate AI content, all in one toolkit.
 *
 * Run:
 *   npm run agent
 */

import { config } from "dotenv";
config();

const NFT_CREATOR_AGENT = `
import { SynapseClient } from '@oobe-protocol-labs/synapse-client-sdk';
import {
  SynapseAgentKit,
  TokenPlugin,
  NFTPlugin,
  DeFiPlugin,
  MiscPlugin,
} from '@oobe-protocol-labs/synapse-client-sdk/ai/plugins';
import { McpClientBridge } from '@oobe-protocol-labs/synapse-client-sdk/ai/mcp';
import { SynapseMcpServer } from '@oobe-protocol-labs/synapse-client-sdk/ai/mcp';

const bridge = new McpClientBridge();

// Add AceDataCloud AI capabilities via MCP
await bridge.connect({
  id: 'acedata-serp',
  name: 'Web Search',
  transport: 'stdio',
  command: 'mcp-serp',
  args: ['--transport', 'stdio'],
  env: { ACEDATACLOUD_API_TOKEN: process.env.ACEDATACLOUD_API_TOKEN! },
  toolPrefix: 'search_',
});

await bridge.connect({
  id: 'acedata-midjourney',
  name: 'Image Generation',
  transport: 'stdio',
  command: 'mcp-midjourney',
  args: ['--transport', 'stdio'],
  env: { ACEDATACLOUD_API_TOKEN: process.env.ACEDATACLOUD_API_TOKEN! },
  toolPrefix: 'image_',
});

await bridge.connect({
  id: 'acedata-suno',
  name: 'Music Generation',
  transport: 'stdio',
  command: 'mcp-suno',
  args: ['--transport', 'stdio'],
  env: { ACEDATACLOUD_API_TOKEN: process.env.ACEDATACLOUD_API_TOKEN! },
  toolPrefix: 'music_',
});

// Combine everything into one toolkit
const kit = new SynapseAgentKit({ rpcUrl: process.env.RPC_URL! })
  .use(TokenPlugin)       // SPL tokens, staking, bridging (22 tools)
  .use(NFTPlugin)         // Metaplex NFT, 3Land, DAS (19 tools)
  .use(DeFiPlugin)        // Jupiter, Raydium, Orca, etc. (43 tools)
  .use(MiscPlugin)        // SNS, Pyth, CoinGecko (20 tools)
  .use(bridge.toPlugin()); // AceDataCloud AI tools (50+ tools)

console.log(kit.summary());
// → { plugins: 6, protocols: 23+, tools: 154+, resources: [...] }

// Export options:
const langchainTools = kit.getTools();           // LangChain StructuredTool[]
const vercelTools    = kit.getVercelAITools();    // Vercel AI SDK tools
const mcpDescriptors = kit.getMcpToolDescriptors(); // MCP format

// Or expose as MCP server for Claude Desktop, Cursor, etc:
const mcpServer = new SynapseMcpServer(kit, {
  name: 'nft-creator-agent',
  version: '1.0.0',
});
await mcpServer.start();           // stdio transport
// await mcpServer.startSse({ port: 3001 }); // SSE transport
`;

const DEFI_REPORT_AGENT = `
const kit = new SynapseAgentKit({ rpcUrl })
  .use(DeFiPlugin)         // Jupiter quotes, Raydium pools, Orca
  .use(MiscPlugin)         // CoinGecko prices, Pyth oracle
  .use(bridge.toPlugin()); // AceDataCloud: search + image gen

// Agent workflow (driven by LLM):
// 1. search_google_search({ query: "solana defi trends this week" })
// 2. defi_jupiter_getQuote({ inputMint: "SOL", outputMint: "USDC", amount: "1000000000" })
// 3. misc_coingecko_getPrice({ ids: "solana,bonk,jupiter" })
// 4. image_imagine({ prompt: "infographic: SOL price chart, modern clean design" })
// → Agent produces a visual DeFi report with real data + AI-generated graphics
`;

const MUSIC_NFT_AGENT = `
const kit = new SynapseAgentKit({ rpcUrl })
  .use(TokenPlugin)
  .use(NFTPlugin)
  .use(bridge.toPlugin()); // AceDataCloud: suno + midjourney

// Agent workflow:
// 1. music_generate_music({ prompt: "upbeat lo-fi chill hop for studying" })
//    → Returns audio URL
// 2. image_imagine({ prompt: "album cover art, lo-fi aesthetic, cozy room" })
//    → Returns image URL
// 3. nft_deployCollection({ name: "AI Music Collection", symbol: "AIMC" })
//    → Creates on-chain collection
// 4. nft_mintNFT({ name: "Chill Study Beat #1", uri: metadataUri })
//    → Mints the music + art as an NFT
`;

async function main() {
  console.log("=".repeat(70));
  console.log("  OOBE Synapse × AceDataCloud — Agent Toolkit");
  console.log(
    "  Solana On-Chain + AI Generation = Full-Stack Autonomous Agents",
  );
  console.log("=".repeat(70));
  console.log();

  console.log("Scenario 1: NFT Creator Agent");
  console.log("-".repeat(70));
  console.log(NFT_CREATOR_AGENT);

  console.log("Scenario 2: DeFi Report Agent");
  console.log("-".repeat(70));
  console.log(DEFI_REPORT_AGENT);

  console.log("Scenario 3: Music NFT Agent");
  console.log("-".repeat(70));
  console.log(MUSIC_NFT_AGENT);

  // --- Capability summary ---
  console.log("=".repeat(70));
  console.log("  Combined Capability Summary");
  console.log("=".repeat(70));
  console.log();

  const capabilities = [
    {
      source: "Synapse TokenPlugin",
      count: 22,
      examples: "deploy, transfer, mint, burn, stake SOL, bridge",
    },
    {
      source: "Synapse NFTPlugin",
      count: 19,
      examples: "deploy collection, mint NFT, update metadata, DAS queries",
    },
    {
      source: "Synapse DeFiPlugin",
      count: 43,
      examples: "Jupiter swap, Raydium pools, Orca, Drift perps, Jito MEV",
    },
    {
      source: "Synapse MiscPlugin",
      count: 20,
      examples: "SNS domains, Pyth oracle, CoinGecko prices",
    },
    {
      source: "Synapse BlinksPlugin",
      count: 6,
      examples: "Solana Actions spec, validate, resolve",
    },
    {
      source: "AceDataCloud Search",
      count: 11,
      examples: "Google web, images, news, videos, places, maps",
    },
    {
      source: "AceDataCloud Image",
      count: 15,
      examples: "Midjourney imagine/edit, Flux generate, Seedream, NanoBanana",
    },
    {
      source: "AceDataCloud Video",
      count: 20,
      examples: "Sora, Luma, Veo, Seedance video generation",
    },
    {
      source: "AceDataCloud Music",
      count: 18,
      examples: "Suno generate, custom, cover, extend, lyrics, mashup",
    },
  ];

  let total = 0;
  for (const cap of capabilities) {
    total += cap.count;
    console.log(
      `  ${cap.source.padEnd(25)} ${String(cap.count).padStart(3)} tools  (${cap.examples})`,
    );
  }
  console.log(`  ${"─".repeat(25)} ${"─".repeat(3)}`);
  console.log(`  ${"TOTAL".padEnd(25)} ${String(total).padStart(3)} tools`);
  console.log();
  console.log(
    "  One agent. One toolkit. Solana DeFi + AI generation + web search.",
  );
  console.log();
}

main().catch(console.error);
