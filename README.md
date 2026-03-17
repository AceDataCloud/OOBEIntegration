# OOBE Synapse × AceDataCloud Integration

> Give autonomous Solana agents the power of AI — image generation, video creation, music production, and web search — via [AceDataCloud](https://platform.acedata.cloud) MCP servers.

## Overview

[OOBE Protocol](https://www.oobeprotocol.ai/) builds infrastructure for autonomous AI agents on Solana. [AceDataCloud](https://platform.acedata.cloud) provides 30+ AI API services (Midjourney, Suno, Sora, Luma, Google Search, and more).

This project bridges them together so OOBE agents can access AceDataCloud's AI capabilities through the [Synapse SDK](https://github.com/OOBE-PROTOCOL/synapse-client-sdk)'s `McpClientBridge`.

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

## x402 Payment Integration

AceDataCloud runs a production x402 facilitator at `facilitator.acedata.cloud` supporting **Solana USDC** and **Base USDC**. This enables agents to pay per-request with USDC — no API keys needed:

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
│  Supported chains: Base (EVM), Solana                               │
│  Currency: USDC                                                     │
│  Facilitator: https://facilitator.acedata.cloud                     │
└─────────────────────────────────────────────────────────────────────┘
```

```typescript
// Seller side — x402 paywall
import { X402Paywall } from '@oobe-protocol-labs/synapse-client-sdk/x402';

const paywall = new X402Paywall({
  facilitatorUrl: 'https://facilitator.acedata.cloud',
  chains: ['base', 'solana'],
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
npm run bridge        # MCP bridge integration showcase
npm run agent         # Agent toolkit with capability summary
npm run x402          # x402 micropayment flow
```

<details>
<summary><strong>Output: Live Image Generation (npm run imagine)</strong></summary>

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

</details>

<details>
<summary><strong>Output: MCP Bridge (npm run bridge)</strong></summary>

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

</details>

<details>
<summary><strong>Output: Agent Toolkit (npm run agent)</strong></summary>

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

</details>

<details>
<summary><strong>Output: x402 Payment Flow (npm run x402)</strong></summary>

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
│  Supported chains: Base (EVM), Solana                               │
│  Currency: USDC                                                     │
│  Facilitator: https://facilitator.acedata.cloud                     │
└─────────────────────────────────────────────────────────────────────┘

Integration Value:
  AceDataCloud Facilitator: https://facilitator.acedata.cloud
  Supported Chains:         Base (EVM) + Solana
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

</details>

## Get an AceDataCloud API Token

1. Visit [platform.acedata.cloud](https://platform.acedata.cloud)
2. Create an account
3. Go to API Keys → Create New Key
4. Set `ACEDATACLOUD_API_TOKEN` in your `.env`

## Links

- **AceDataCloud**: [platform.acedata.cloud](https://platform.acedata.cloud) | [API Docs](https://docs.acedata.cloud)
- **OOBE Protocol**: [oobeprotocol.ai](https://www.oobeprotocol.ai) | [Synapse Gateway](https://synapse.oobeprotocol.ai)
- **Synapse SDK**: [GitHub](https://github.com/OOBE-PROTOCOL/synapse-client-sdk) | [npm](https://www.npmjs.com/package/@oobe-protocol-labs/synapse-client-sdk)
- **SAP Program**: `SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ` (Solana Mainnet)

## License

MIT
