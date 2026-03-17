# OOBE Synapse × AceDataCloud Integration

> Give autonomous Solana agents the power of AI — image generation, video creation, music production, and web search — via [AceDataCloud](https://platform.acedata.cloud) MCP servers and Solana Agent Protocol (SAP).

## Overview

[OOBE Protocol](https://www.oobeprotocol.ai/) builds infrastructure for autonomous AI agents on Solana. [AceDataCloud](https://platform.acedata.cloud) provides 30+ AI API services (Midjourney, Suno, Sora, Luma, Google Search, and more).

This project bridges them together in two ways:

1. **MCP Bridge** — Connect AceDataCloud MCP servers to Synapse agents via `McpClientBridge` for real-time AI tool access
2. **SAP Registration** — Register AceDataCloud as a discoverable on-chain agent via the Solana Agent Protocol, enabling any autonomous agent to find and pay for services on-chain

**Zero code changes needed on either side** — AceDataCloud's MCP servers are already published on PyPI and speak standard MCP stdio protocol.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    OOBE SynapseAgentKit                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ TokenPlugin  │  │ DeFiPlugin   │  │ McpClientBridge       │ │
│  │ 22 tools     │  │ 43 tools     │  │ (AceDataCloud MCP)    │ │
│  │ SPL, stake,  │  │ Jupiter,     │  │                       │ │
│  │ bridge       │  │ Raydium, ... │  │ ┌───────────────────┐ │ │
│  └──────────────┘  └──────────────┘  │ │ mcp-midjourney    │ │ │
│                                       │ │ mcp-suno          │ │ │
│  ┌──────────────┐  ┌──────────────┐  │ │ mcp-serp          │ │ │
│  │ NFTPlugin    │  │ MiscPlugin   │  │ │ mcp-sora          │ │ │
│  │ 19 tools     │  │ 20 tools     │  │ │ mcp-luma          │ │ │
│  │ Metaplex,    │  │ Pyth, SNS,   │  │ │ mcp-veo           │ │ │
│  │ 3Land        │  │ CoinGecko    │  │ │ mcp-flux-pro      │ │ │
│  └──────────────┘  └──────────────┘  │ │ mcp-seedream-pro  │ │ │
│                                       │ │ mcp-seedance      │ │ │
│                                       │ │ mcp-nanobanana-pro│ │ │
│                                       │ └───────────────────┘ │ │
│                                       └───────────────────────┘ │
│                                                                 │
│  Total: 174 tools (Solana DeFi + AI Generation + Web Search)   │
└─────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
   Solana Blockchain                    api.acedata.cloud
   (on-chain actions)                   (AI API services)
```

## Quick Start

### 1. Install AceDataCloud MCP Servers

```bash
# Core AI capabilities
pip install mcp-midjourney mcp-suno mcp-serp

# Additional AI services
pip install mcp-sora mcp-luma mcp-veo
pip install mcp-flux-pro mcp-seedream-pro mcp-seedance mcp-nanobanana-pro
```

### 2. Install Synapse SDK

```bash
npm install @oobe-protocol-labs/synapse-client-sdk

# For SAP on-chain registration
npm install @oobe-protocol-labs/synapse-sap-sdk
```

### 3. Connect via McpClientBridge

```typescript
import { McpClientBridge } from '@oobe-protocol-labs/synapse-client-sdk/ai/mcp';
import {
  SynapseAgentKit,
  TokenPlugin,
  DeFiPlugin,
} from '@oobe-protocol-labs/synapse-client-sdk/ai/plugins';

const bridge = new McpClientBridge();

// Connect AceDataCloud AI services
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

const tools = kit.getTools();
console.log(`Agent has ${tools.length} tools ready`);
```

## Available AceDataCloud MCP Servers

| Package | CLI Command | Capabilities |
|---------|-------------|-------------|
| `mcp-midjourney` | `mcp-midjourney` | AI image generation (Midjourney): imagine, edit, blend, describe, upscale |
| `mcp-suno` | `mcp-suno` | AI music (Suno): generate, custom, cover, extend, lyrics, mashup, remaster |
| `mcp-serp` | `mcp-serp` | Web search: Google web, images, news, videos, places, maps |
| `mcp-sora` | `mcp-sora` | AI video (OpenAI Sora): text/image to video, character-consistent video |
| `mcp-luma` | `mcp-luma` | AI video (Luma Dream Machine): text/image to video, extend |
| `mcp-veo` | `mcp-veo` | AI video (Google Veo): text/image to video, 1080p upscale |
| `mcp-flux-pro` | `mcp-flux-pro` | AI image (Flux): generate, edit |
| `mcp-seedream-pro` | `mcp-seedream-pro` | AI image (ByteDance Seedream): generate, edit |
| `mcp-seedance` | `mcp-seedance` | AI video (ByteDance Seedance): text/image to video |
| `mcp-nanobanana-pro` | `mcp-nanobanana-pro` | AI image (Gemini-based): generate, edit |

## Combined Capability Summary

```
Synapse TokenPlugin        22 tools  (deploy, transfer, mint, burn, stake SOL, bridge)
Synapse NFTPlugin          19 tools  (deploy collection, mint NFT, update metadata, DAS queries)
Synapse DeFiPlugin         43 tools  (Jupiter swap, Raydium pools, Orca, Drift perps, Jito MEV)
Synapse MiscPlugin         20 tools  (SNS domains, Pyth oracle, CoinGecko prices)
Synapse BlinksPlugin        6 tools  (Solana Actions spec, validate, resolve)
AceDataCloud Search        11 tools  (Google web, images, news, videos, places, maps)
AceDataCloud Image         15 tools  (Midjourney imagine/edit, Flux generate, Seedream, NanoBanana)
AceDataCloud Video         20 tools  (Sora, Luma, Veo, Seedance video generation)
AceDataCloud Music         18 tools  (Suno generate, custom, cover, extend, lyrics, mashup)
─────────────────────────  ───
TOTAL                     174 tools
```

## Agent Use Cases

### NFT Creator Agent
Search trending topics → generate AI art (Midjourney) → mint NFT (Metaplex) → list on marketplace

### DeFi Report Agent
Fetch Jupiter quotes + CoinGecko prices → generate charts (Flux) → compile visual report

### Music NFT Agent
Generate music (Suno) + album art (Midjourney) → mint as music NFT → list for sale

### Social Media Agent
Monitor crypto news (SERP) → generate summary video (Sora) → share via Solana Blinks

### Trading Insight Agent
Execute swaps (Jupiter/Raydium) → generate performance visual → post update

## SAP On-Chain Registration

Register AceDataCloud as a discoverable AI agent on Solana via the [Solana Agent Protocol (SAP)](https://github.com/OOBE-PROTOCOL/synapse-sap-sdk). Once registered, any autonomous agent can find and pay for AceDataCloud services on-chain.

```bash
npm run sap:plan     # Preview registration plan (no transactions)
npm run sap          # Execute on-chain registration (needs devnet SOL)
```

### What Gets Registered

| On-Chain Entity | Count | Description |
|-----------------|-------|-------------|
| Agent Account | 1 | "AceDataCloud" with URI, x402 endpoint, capabilities |
| Tool Descriptors | 8 | midjourney-imagine, suno-generate, serp-search, luma-video, sora-video, openai-chat, flux-generate, veo-video |
| Capability Indexes | 5 | Indexed by `midjourney:imagine`, `suno:generate`, `serp:search`, `luma:video`, `sora:video` |
| Protocol Indexes | 2 | `mcp`, `x402` |
| Pricing Tier | 1 | 0.001 SOL/call, x402 settlement, 60 calls/min |

### How Agents Discover AceDataCloud

```typescript
import { SapConnection, deriveAgent } from '@oobe-protocol-labs/synapse-sap-sdk';

const sapConn = SapConnection.devnet();
const client = sapConn.fromKeypair(keypair);

// Find agents that can generate images
const agents = await client.discovery.findAgentsByCapability('midjourney:imagine');

// Find agents supporting MCP protocol
const mcpAgents = await client.discovery.findAgentsByProtocol('mcp');

// Fetch agent profile
const [agentPda] = deriveAgent(aceDataCloudPubkey);
const profile = await client.agent.fetch(agentPda);
console.log(profile.name);         // "AceDataCloud"
console.log(profile.agentUri);     // "https://api.acedata.cloud"
console.log(profile.capabilities); // 8 AI capabilities
```

## x402 Payment Integration

AceDataCloud runs a production x402 facilitator at `facilitator.acedata.cloud` supporting **Solana USDC**, **Base USDC**, and **SKALE Base USDC** (zero gas fees). This enables agents to pay per-request with USDC — no API keys needed:

```
┌─────────────────────────────────────────────────────────────────────┐
│                   x402 Payment Flow                                 │
│                                                                     │
│  Synapse Agent  ──── HTTP request ────►  AceDataCloud API           │
│       │                                       │                     │
│       │                                  402 Payment Required       │
│       │                                  + PaymentRequirements      │
│       │                                       │                     │
│       ◄───────────── 402 + requirements ──────┘                     │
│       │                                                             │
│       │── sign USDC authorization ──►  Facilitator                  │
│       │                               (facilitator.acedata.cloud)   │
│       │                                       │                     │
│       │── retry with X-PAYMENT header ──►  AceDataCloud API        │
│       │                                       │                     │
│       │── verify + settle ────────────►  Facilitator                │
│       │                                  (transfer USDC on-chain)   │
│       │                                       │                     │
│       ◄───────────── 200 OK + response ───────┘                     │
│                                                                     │
│  Supported chains: Base (EVM), Solana, SKALE (zero gas fees)        │
│  Currency: USDC                                                     │
│  Facilitator: https://facilitator.acedata.cloud                     │
└─────────────────────────────────────────────────────────────────────┘
```

```typescript
// Seller side — x402 paywall
import { X402Paywall } from '@oobe-protocol-labs/synapse-client-sdk/x402';

const paywall = new X402Paywall({
  facilitatorUrl: 'https://facilitator.acedata.cloud',
  chains: ['base', 'solana', 'skale'],
  currency: 'USDC',
});

app.use('/v1/chat/completions', paywall.middleware({
  maxAmountRequired: '0.001',  // $0.001 per request
  resource: 'chat-completions',
  description: 'AI chat completion (GPT-4o, Claude, Gemini, etc.)',
}));
```

```typescript
// Buyer side — Synapse agent auto-payment
import { X402Client } from '@oobe-protocol-labs/synapse-client-sdk/x402';

const x402 = new X402Client({
  wallet: agent.wallet,
  facilitatorUrl: 'https://facilitator.acedata.cloud',
  maxAutoPayment: '0.01',
});

// Transparent: request → 402 → auto-sign USDC → retry → 200 OK
const response = await x402.fetch('https://api.acedata.cloud/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Analyze SOL/USDC pair on Raydium' }],
  }),
});
```

## Run the Examples

```bash
# Setup
cp .env.example .env  # add your ACEDATACLOUD_API_TOKEN
npm install

# Also install AceDataCloud MCP servers (Python)
pip install mcp-midjourney mcp-suno mcp-serp

# Run
npm run imagine       # Live image generation via Synapse McpClientBridge → mcp-midjourney
npm run sap:plan      # SAP on-chain registration plan (dry-run)
npm run sap           # SAP on-chain registration (needs devnet SOL)
npm run bridge        # MCP bridge integration showcase
npm run agent         # Agent toolkit with capability summary
npm run x402          # x402 micropayment flow
```

### Output: Live Image Generation (npm run imagine)

```
======================================================================
  OOBE Synapse × AceDataCloud — MCP Bridge Live Run
======================================================================

  [1/5] Created McpClientBridge (Synapse SDK)
  [2/5] Connecting to mcp-midjourney via stdio...
         Status: connected
  [3/5] Discovered 15 tools from mcp-midjourney:
         - midjourney_describe
         - midjourney_edit
         - midjourney_imagine
         - midjourney_transform
         - midjourney_blend
         - midjourney_with_reference
         - midjourney_list_actions
         - midjourney_get_prompt_guide
         - midjourney_list_transform_actions
         - midjourney_get_seed
         - midjourney_get_task
         - midjourney_get_tasks_batch
         - midjourney_translate
         - midjourney_generate_video
         - midjourney_extend_video

  [4/5] Calling midjourney_imagine via MCP bridge...
         Prompt: "A Solana-themed robot artist painting on a digital canvas, cyberpunk style, neon purple and green, futuristic art studio --ar 16:9 --v 6.1"
         (this takes 30-90s)

  [5/5] Result (97.9s):
----------------------------------------------------------------------
  Success:     true
  Task ID:     cf0e2300-2cc4-475a-8ffb-b2bfe97e6aa2
  Image ID:    1483514644613038080
  Size:        1456×816
  Image URL:   https://platform.cdn.acedata.cloud/midjourney/cf0e2300-2cc4-475a-8ffb-b2bfe97e6aa2.png?imageMogr2/thumbnail/!50p
  Actions:     upscale1, upscale2, upscale3, upscale4, reroll, variation1, variation2, variation3, variation4

  Flow: Synapse McpClientBridge → stdio → mcp-midjourney → api.acedata.cloud
```

### Output: SAP Registration Plan (npm run sap:plan)

```
======================================================================
  OOBE Synapse × AceDataCloud — SAP On-Chain Registration
  Register AceDataCloud as an AI agent on Solana (devnet)
  MODE: Plan (dry-run) — no transactions will be sent
======================================================================

  [1/7] Generated new keypair
         Public key: 9zg4FdHraMNxsdXaWYVpbyhqZkEJ2vcw1rExpLgUZ2x

  [2/7] Connected to Solana devnet
         Program: SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ

  [3/7] Airdrop: SKIPPED (plan mode)

  [4/7] Agent Registration Plan:
  ------------------------------------------------------------------
  Name:          AceDataCloud
  Description:   30+ AI APIs: image, video, music, search, LLM chat via MCP
  Agent URI:     https://api.acedata.cloud
  x402 Endpoint: https://facilitator.acedata.cloud/.well-known/x402
  Agent PDA:     HVBxixYEofWVcf26xUTQHxgibLNypTdg3TQP83MVW5LX
  Protocols:     mcp, x402, openai-compatible

  Capabilities (8):
    • midjourney:imagine     — AI image generation via Midjourney
    • suno:generate          — AI music generation via Suno
    • serp:search            — Google web search, images, news, videos
    • luma:video             — AI video generation via Luma Dream Machine
    • sora:video             — AI video generation via OpenAI Sora
    • openai:chat            — LLM chat (GPT-4o, Claude, Gemini, DeepSeek, Grok)
    • flux:generate          — AI image generation via Flux
    • veo:video              — AI video generation via Google Veo

  Pricing:
    Tier:        standard
    Price:       0.001 SOL per call
    Token:       SOL
    Settlement:  x402
    Rate limit:  60 calls/min
    Max calls:   100,000 per epoch

  [5/7] Tool Descriptors (8):
    • midjourney-imagine     POST  params:6 required:1
    • suno-generate          POST  params:5 required:1
    • serp-search            POST  params:4 required:1
    • luma-video             POST  params:4 required:1
    • sora-video             POST  params:4 required:1
    • openai-chat            POST  params:5 required:2
    • flux-generate          POST  params:4 required:1
    • veo-video              POST  params:4 required:1

  [6/7] Discovery Indexes:
  Capability indexes:
    • midjourney:imagine
    • suno:generate
    • serp:search
    • luma:video
    • sora:video
  Protocol indexes:
    • mcp
    • x402

  [7/7] Verification: SKIPPED (plan mode)

  ==================================================================
  On-Chain Transactions Summary (will execute in live mode):
  ------------------------------------------------------------------
  TX 1:   registerAgent — create AceDataCloud agent account
  TX 2:   publishTool — midjourney-imagine
  TX 3:   publishTool — suno-generate
  TX 4:   publishTool — serp-search
  TX 5:   publishTool — luma-video
  TX 6:   publishTool — sora-video
  TX 7:   publishTool — openai-chat
  TX 8:   publishTool — flux-generate
  TX 9:   publishTool — veo-video
  TX 10+:  initCapabilityIndex + addToCapabilityIndex — midjourney:imagine
  TX 10+:  initCapabilityIndex + addToCapabilityIndex — suno:generate
  TX 10+:  initCapabilityIndex + addToCapabilityIndex — serp:search
  TX 10+:  initCapabilityIndex + addToCapabilityIndex — luma:video
  TX 10+:  initCapabilityIndex + addToCapabilityIndex — sora:video
  TX 10+:  initProtocolIndex + addToProtocolIndex — mcp
  TX 10+:  initProtocolIndex + addToProtocolIndex — x402

  Estimated cost: ~0.05 SOL (transaction fees)
  Total transactions: ~23

  To execute for real:
    1. Get devnet SOL:  solana airdrop 2 <pubkey> --url devnet
       Or visit: https://faucet.solana.com
    2. Save key:        echo 'SAP_PRIVATE_KEY=<base58>' >> .env
    3. Run:             npm run sap
  ==================================================================
```

### Output: MCP Bridge (npm run bridge)

```
======================================================================
  OOBE Synapse × AceDataCloud — MCP Bridge Integration
  Connect AI capabilities to autonomous Solana agents
======================================================================

AceDataCloud MCP Servers (10 servers, all published on PyPI):
----------------------------------------------------------------------
  acedata_music_         mcp-suno               Generate music, lyrics, covers, remasters, mashups via Suno AI
  acedata_image_         mcp-midjourney         Generate images, edits, blends, upscale, describe, video from Midjourney
  acedata_search_        mcp-serp               Google search, images, news, videos, places, maps
  acedata_luma_          mcp-luma               Generate video via Luma Dream Machine
  acedata_sora_          mcp-sora               Generate video via OpenAI Sora
  acedata_veo_           mcp-veo                Generate video via Google Veo
  acedata_flux_          mcp-flux-pro           Generate and edit images via Flux
  acedata_seedream_      mcp-seedream-pro       Generate and edit images via ByteDance Seedream
  acedata_seedance_      mcp-seedance           Generate video via ByteDance Seedance
  acedata_nano_          mcp-nanobanana-pro     Generate and edit images via Gemini-based NanoBanana

Agent Use Cases:
----------------------------------------------------------------------
  1. DeFi Report Agent      Search market data → analyze → generate charts → publish report
  2. NFT Creator Agent      Generate AI art (Midjourney/Flux) → mint NFT (Metaplex) → list on marketplace
  3. Social Media Agent     Monitor crypto news (SERP) → create visual summary → audio brief (Suno)
  4. Trading Insight Agent  Fetch Jupiter quotes → generate comparison video (Sora/Luma) → share via Blinks
  5. Community Agent        Search trending topics → generate themed images → post with Solana Actions

Setup:
----------------------------------------------------------------------
  # Install AceDataCloud MCP servers (Python, published on PyPI)
  pip install mcp-suno mcp-midjourney mcp-serp mcp-luma mcp-sora mcp-veo
  pip install mcp-flux-pro mcp-seedream-pro mcp-seedance mcp-nanobanana-pro

  # Install Synapse SDK (Node.js)
  npm install @oobe-protocol-labs/synapse-client-sdk

  # Set your AceDataCloud API token
  export ACEDATACLOUD_API_TOKEN=your_token_here
  # Get one at: https://platform.acedata.cloud
```

### Output: Agent Toolkit (npm run agent)

```
======================================================================
  OOBE Synapse × AceDataCloud — Agent Toolkit
  Solana On-Chain + AI Generation = Full-Stack Autonomous Agents
======================================================================

Scenario 1: NFT Creator Agent
----------------------------------------------------------------------
  SynapseAgentKit combining TokenPlugin + NFTPlugin + DeFiPlugin + MiscPlugin
  + AceDataCloud MCP (search, image gen, music gen)
  Export as: LangChain tools, Vercel AI tools, or MCP server

Scenario 2: DeFi Report Agent
----------------------------------------------------------------------
  DeFiPlugin + MiscPlugin + AceDataCloud search & image gen
  Agent workflow: search → fetch quotes → get prices → generate infographic

Scenario 3: Music NFT Agent
----------------------------------------------------------------------
  TokenPlugin + NFTPlugin + AceDataCloud suno & midjourney
  Agent workflow: generate music → generate cover art → deploy collection → mint NFT

======================================================================
  Combined Capability Summary
======================================================================

  Synapse TokenPlugin        22 tools  (deploy, transfer, mint, burn, stake SOL, bridge)
  Synapse NFTPlugin          19 tools  (deploy collection, mint NFT, update metadata, DAS queries)
  Synapse DeFiPlugin         43 tools  (Jupiter swap, Raydium pools, Orca, Drift perps, Jito MEV)
  Synapse MiscPlugin         20 tools  (SNS domains, Pyth oracle, CoinGecko prices)
  Synapse BlinksPlugin        6 tools  (Solana Actions spec, validate, resolve)
  AceDataCloud Search        11 tools  (Google web, images, news, videos, places, maps)
  AceDataCloud Image         15 tools  (Midjourney imagine/edit, Flux generate, Seedream, NanoBanana)
  AceDataCloud Video         20 tools  (Sora, Luma, Veo, Seedance video generation)
  AceDataCloud Music         18 tools  (Suno generate, custom, cover, extend, lyrics, mashup)
  ─────────────────────────  ───
  TOTAL                     174 tools

  One agent. One toolkit. Solana DeFi + AI generation + web search.
```

### Output: x402 Payment Flow (npm run x402)

```
======================================================================
  OOBE Synapse × AceDataCloud — x402 Micropayment Integration
  USDC-based agent-to-API payments on Base & Solana
======================================================================

Payment Flow:
┌─────────────────────────────────────────────────────────────────────┐
│                   x402 Payment Flow                                 │
│                                                                     │
│  Synapse Agent  ──── HTTP request ────►  AceDataCloud API           │
│       │                                       │                     │
│       │                                  402 Payment Required       │
│       │                                  + PaymentRequirements      │
│       │                                       │                     │
│       ◄───────────── 402 + requirements ──────┘                     │
│       │                                                             │
│       │── sign USDC authorization ──►  Facilitator                  │
│       │                               (facilitator.acedata.cloud)   │
│       │                                       │                     │
│       │── retry with X-PAYMENT header ──►  AceDataCloud API        │
│       │                                       │                     │
│       │── verify + settle ────────────►  Facilitator                │
│       │                                  (transfer USDC on-chain)   │
│       │                                       │                     │
│       ◄───────────── 200 OK + response ───────┘                     │
│                                                                     │
│  Supported chains: Base (EVM), Solana, SKALE (zero gas fees)        │
│  Currency: USDC                                                     │
│  Facilitator: https://facilitator.acedata.cloud                     │
└─────────────────────────────────────────────────────────────────────┘

Integration Value:
  AceDataCloud Facilitator: https://facilitator.acedata.cloud
  Supported Chains:         Base (EVM) + Solana + SKALE (zero gas)
  Currency:                 USDC

  Key Benefits:
  • Synapse agents pay per-call with USDC — no API keys needed
  • AceDataCloud's existing facilitator handles settlement
  • Solana settlement takes ~400ms (vs minutes on EVM L1)
  • $ACE token holders get discounted rates via CoinPolicy
  • Agent wallets can hold both USDC (payments) + $ACE (discounts)

  Revenue Model:
  ┌──────────────────────┬─────────────────────────────────┐
  │ API Call             │ x402 USDC micro-payment         │
  │ Settlement Fee       │ ~0.1% facilitator commission    │
  │ Discount (staking)   │ Hold $ACE → lower per-call cost│
  │ Volume               │ 1000s of autonomous agents 24/7│
  └──────────────────────┴─────────────────────────────────┘
```

## Get an AceDataCloud API Token

1. Visit [platform.acedata.cloud](https://platform.acedata.cloud)
2. Create an account
3. Go to API Keys → Create New Key
4. Set `ACEDATACLOUD_API_TOKEN` in your `.env`

## Links

- **AceDataCloud**: [platform.acedata.cloud](https://platform.acedata.cloud) | [API Docs](https://docs.acedata.cloud)
- **OOBE Protocol**: [oobeprotocol.ai](https://www.oobeprotocol.ai) | [Synapse Gateway](https://synapse.oobeprotocol.ai)
- **Synapse SDK**: [GitHub](https://github.com/OOBE-PROTOCOL/synapse-client-sdk) | [npm](https://www.npmjs.com/package/@oobe-protocol-labs/synapse-client-sdk)
- **SAP SDK**: [GitHub](https://github.com/OOBE-PROTOCOL/synapse-sap-sdk) | [npm](https://www.npmjs.com/package/@oobe-protocol-labs/synapse-sap-sdk)
- **SAP Program**: `SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ` (Solana Mainnet + Devnet)

## License

MIT
