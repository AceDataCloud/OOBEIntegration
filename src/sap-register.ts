/**
 * OOBE Synapse × AceDataCloud — SAP On-Chain Registration
 *
 * Registers AceDataCloud as an AI service provider on Solana via the
 * Solana Agent Protocol (SAP). This makes AceDataCloud discoverable
 * by any autonomous agent on-chain.
 *
 * What this does:
 *   1. Generate a Solana keypair (or load from env)
 *   2. Airdrop devnet SOL for transaction fees
 *   3. Register "AceDataCloud" agent on-chain with capabilities & pricing
 *   4. Publish individual tool descriptors (midjourney, suno, serp, etc.)
 *   5. Register capability & protocol indexes for discovery
 *   6. Verify registration by querying the on-chain profile
 *
 * Run:
 *   npm run sap            # Full on-chain registration (needs devnet SOL)
 *   npm run sap:plan       # Dry-run — show registration plan without transactions
 *
 * Uses Solana devnet — no real SOL needed.
 */

import { config } from "dotenv";
config();

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const {
  SapConnection,
  TokenType,
  SettlementMode,
  ToolHttpMethod,
  ToolCategory,
  deriveAgent,
} = require("@oobe-protocol-labs/synapse-sap-sdk");
const { Keypair, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const BN = require("bn.js");
const bs58 = require("bs58");

const PLAN_MODE = process.argv.includes("--plan");

// AceDataCloud service catalog — what we register on-chain
const ACEDATA_SERVICES = [
  {
    name: "midjourney-imagine",
    capability: "midjourney:imagine",
    description: "AI image generation via Midjourney",
    paramsCount: 6,
    requiredParams: 1,
  },
  {
    name: "suno-generate",
    capability: "suno:generate",
    description: "AI music generation via Suno",
    paramsCount: 5,
    requiredParams: 1,
  },
  {
    name: "serp-search",
    capability: "serp:search",
    description: "Google web search, images, news, videos",
    paramsCount: 4,
    requiredParams: 1,
  },
  {
    name: "luma-video",
    capability: "luma:video",
    description: "AI video generation via Luma Dream Machine",
    paramsCount: 4,
    requiredParams: 1,
  },
  {
    name: "sora-video",
    capability: "sora:video",
    description: "AI video generation via OpenAI Sora",
    paramsCount: 4,
    requiredParams: 1,
  },
  {
    name: "openai-chat",
    capability: "openai:chat",
    description: "LLM chat (GPT-4o, Claude, Gemini, DeepSeek, Grok)",
    paramsCount: 5,
    requiredParams: 2,
  },
  {
    name: "flux-generate",
    capability: "flux:generate",
    description: "AI image generation via Flux",
    paramsCount: 4,
    requiredParams: 1,
  },
  {
    name: "veo-video",
    capability: "veo:video",
    description: "AI video generation via Google Veo",
    paramsCount: 4,
    requiredParams: 1,
  },
];

async function main() {
  console.log("=".repeat(70));
  console.log("  OOBE Synapse × AceDataCloud — SAP On-Chain Registration");
  console.log("  Register AceDataCloud as an AI agent on Solana (devnet)");
  if (PLAN_MODE) console.log("  MODE: Plan (dry-run) — no transactions will be sent");
  console.log("=".repeat(70));
  console.log();

  // ─── Step 1: Setup wallet ───
  let keypair: InstanceType<typeof Keypair>;
  if (process.env.SAP_PRIVATE_KEY) {
    const decoded = bs58.decode(process.env.SAP_PRIVATE_KEY);
    keypair = Keypair.fromSecretKey(decoded);
    console.log("  [1/7] Loaded keypair from SAP_PRIVATE_KEY");
  } else {
    keypair = Keypair.generate();
    console.log("  [1/7] Generated new keypair");
    if (!PLAN_MODE) {
      console.log(`         Save this to .env as SAP_PRIVATE_KEY to reuse:`);
      console.log(`         SAP_PRIVATE_KEY=${bs58.encode(keypair.secretKey)}`);
    }
  }
  console.log(`         Public key: ${keypair.publicKey.toBase58()}`);
  console.log();

  // ─── Step 2: Connect to devnet ───
  const sapConn = SapConnection.devnet();
  const client = sapConn.fromKeypair(keypair);
  console.log("  [2/7] Connected to Solana devnet");
  console.log(`         Program: SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ`);
  console.log();

  // Derive agent PDA
  const [agentPda] = deriveAgent(keypair.publicKey);

  if (PLAN_MODE) {
    // ─── Plan mode: show registration plan without transactions ───
    console.log("  [3/7] Airdrop: SKIPPED (plan mode)");
    console.log();
    console.log("  [4/7] Agent Registration Plan:");
    console.log("  " + "-".repeat(66));
    console.log(`  Name:          AceDataCloud`);
    console.log(`  Description:   30+ AI APIs: image, video, music, search, LLM chat via MCP`);
    console.log(`  Agent URI:     https://api.acedata.cloud`);
    console.log(`  x402 Endpoint: https://facilitator.acedata.cloud/.well-known/x402`);
    console.log(`  Agent PDA:     ${agentPda.toBase58()}`);
    console.log(`  Protocols:     mcp, x402, openai-compatible`);
    console.log();
    console.log(`  Capabilities (${ACEDATA_SERVICES.length}):`);
    for (const s of ACEDATA_SERVICES) {
      console.log(`    • ${s.capability.padEnd(22)} — ${s.description}`);
    }
    console.log();
    console.log("  Pricing:");
    console.log(`    Tier:        standard`);
    console.log(`    Price:       0.001 SOL per call`);
    console.log(`    Token:       SOL`);
    console.log(`    Settlement:  x402`);
    console.log(`    Rate limit:  60 calls/min`);
    console.log(`    Max calls:   100,000 per epoch`);
    console.log();

    console.log(`  [5/7] Tool Descriptors (${ACEDATA_SERVICES.length}):`);
    for (const s of ACEDATA_SERVICES) {
      console.log(`    • ${s.name.padEnd(22)} POST  params:${s.paramsCount} required:${s.requiredParams}`);
    }
    console.log();

    console.log("  [6/7] Discovery Indexes:");
    console.log("  Capability indexes:");
    for (const s of ACEDATA_SERVICES.slice(0, 5)) {
      console.log(`    • ${s.capability}`);
    }
    console.log("  Protocol indexes:");
    console.log(`    • mcp`);
    console.log(`    • x402`);
    console.log();

    console.log("  [7/7] Verification: SKIPPED (plan mode)");
    console.log();

    // Summary
    console.log("  " + "=".repeat(66));
    console.log("  On-Chain Transactions Summary (will execute in live mode):");
    console.log("  " + "-".repeat(66));
    console.log("  TX 1:   registerAgent — create AceDataCloud agent account");
    for (let i = 0; i < ACEDATA_SERVICES.length; i++) {
      console.log(`  TX ${i + 2}:   publishTool — ${ACEDATA_SERVICES[i].name}`);
    }
    const txOff = ACEDATA_SERVICES.length + 2;
    for (const s of ACEDATA_SERVICES.slice(0, 5)) {
      console.log(`  TX ${txOff}+:  initCapabilityIndex + addToCapabilityIndex — ${s.capability}`);
    }
    console.log(`  TX ${txOff}+:  initProtocolIndex + addToProtocolIndex — mcp`);
    console.log(`  TX ${txOff}+:  initProtocolIndex + addToProtocolIndex — x402`);
    console.log();
    console.log(`  Estimated cost: ~0.05 SOL (transaction fees)`);
    console.log(`  Total transactions: ~${1 + ACEDATA_SERVICES.length + 5 * 2 + 2 * 2}`);
    console.log();
    console.log("  To execute for real:");
    console.log("    1. Get devnet SOL:  solana airdrop 2 <pubkey> --url devnet");
    console.log("       Or visit: https://faucet.solana.com");
    console.log("    2. Save key:        echo 'SAP_PRIVATE_KEY=<base58>' >> .env");
    console.log("    3. Run:             npm run sap");
    console.log("  " + "=".repeat(66));
    console.log();
    return;
  }

  // ─── Step 3: Airdrop SOL (live mode) ───
  console.log("  [3/7] Requesting devnet SOL airdrop...");

  // Try multiple small airdrops with delay (devnet has strict rate limits)
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const sig = await sapConn.connection.requestAirdrop(
        keypair.publicKey,
        1 * LAMPORTS_PER_SOL,
      );
      await sapConn.connection.confirmTransaction(sig, "confirmed");
      console.log(`         Received 1 SOL (attempt ${attempt})`);
      break;
    } catch (e: any) {
      if (attempt === 3) {
        console.log(`         Airdrop failed after ${attempt} attempts: ${e.message?.slice(0, 80)}`);
        console.log("         Checking existing balance...");
      } else {
        console.log(`         Attempt ${attempt} rate-limited, retrying in 5s...`);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  const balance = await sapConn.connection.getBalance(keypair.publicKey);
  console.log(`         Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
  if (balance < 0.05 * LAMPORTS_PER_SOL) {
    console.error("         Insufficient SOL. Try again in a minute (devnet rate limit).");
    process.exit(1);
  }
  console.log();

  // ─── Step 4: Register AceDataCloud agent on-chain ───
  console.log("  [4/7] Registering AceDataCloud agent on-chain...");

  // Only take first 8 capabilities (SAP limit: 10 per agent)
  const capabilities = ACEDATA_SERVICES.slice(0, 8).map((s, i) => ({
    name: s.capability,
    version: 1,
    metadata: JSON.stringify({ type: s.description.split(" ")[1] || "ai" }),
  }));

  const registerTx = await client.agent.register({
    name: "AceDataCloud",
    description: "30+ AI APIs: image, video, music, search, LLM chat via MCP",
    agentUri: "https://api.acedata.cloud",
    x402Endpoint: "https://facilitator.acedata.cloud/.well-known/x402",
    capabilities,
    pricing: [
      {
        tierId: "standard",
        pricePerCall: new BN(1_000_000), // 0.001 SOL equivalent
        tokenType: TokenType.Sol,
        settlementMode: SettlementMode.X402,
        rateLimit: 60,
        maxCallsPerEpoch: new BN(100_000),
      },
    ],
    protocols: ["mcp", "x402", "openai-compatible"],
  });

  console.log(`         TX: ${registerTx}`);
  console.log(`         Agent registered on-chain!`);
  console.log();

  console.log(`         Agent PDA: ${agentPda.toBase58()}`);
  console.log();

  // ─── Step 5: Publish tool descriptors ───
  console.log(`  [5/7] Publishing ${ACEDATA_SERVICES.length} tool descriptors...`);
  for (const service of ACEDATA_SERVICES) {
    try {
      const tx = await client.tools.publishByName(agentPda, service.name, {
        httpMethod: ToolHttpMethod.Post,
        category: ToolCategory.Custom,
        paramsCount: service.paramsCount,
        requiredParams: service.requiredParams,
      });
      console.log(`         ✓ ${service.name} (tx: ${tx.slice(0, 16)}...)`);
    } catch (e: any) {
      console.log(`         ✗ ${service.name}: ${e.message?.slice(0, 60)}`);
    }
  }
  console.log();

  // ─── Step 6: Register discovery indexes ───
  console.log("  [6/7] Registering discovery indexes...");

  // Capability indexes
  for (const service of ACEDATA_SERVICES.slice(0, 5)) {
    try {
      await client.indexing.initCapabilityIndex(service.capability);
      await client.indexing.addToCapabilityIndex(agentPda, service.capability);
      console.log(`         ✓ capability: ${service.capability}`);
    } catch (e: any) {
      // Index might already exist
      try {
        await client.indexing.addToCapabilityIndex(agentPda, service.capability);
        console.log(`         ✓ capability: ${service.capability} (joined existing)`);
      } catch {
        console.log(`         ✗ capability: ${service.capability}: ${e.message?.slice(0, 50)}`);
      }
    }
  }

  // Protocol indexes
  for (const protocol of ["mcp", "x402"]) {
    try {
      await client.indexing.initProtocolIndex(protocol);
      await client.indexing.addToProtocolIndex(agentPda, protocol);
      console.log(`         ✓ protocol: ${protocol}`);
    } catch (e: any) {
      try {
        await client.indexing.addToProtocolIndex(agentPda, protocol);
        console.log(`         ✓ protocol: ${protocol} (joined existing)`);
      } catch {
        console.log(`         ✗ protocol: ${protocol}: ${e.message?.slice(0, 50)}`);
      }
    }
  }
  console.log();

  // ─── Step 7: Verify — query our own profile ───
  console.log("  [7/7] Verifying on-chain registration...");
  try {
    const agent = await client.agent.fetch(agentPda);
    const stats = await client.agent.fetchStats(agentPda);

    console.log();
    console.log("  On-Chain Agent Profile:");
    console.log("  " + "-".repeat(66));
    console.log(`  Name:          ${agent.name}`);
    console.log(`  Description:   ${agent.description}`);
    console.log(`  URI:           ${agent.agentUri}`);
    console.log(`  x402 Endpoint: ${agent.x402Endpoint}`);
    console.log(`  Owner:         ${agent.authority.toBase58()}`);
    console.log(`  Active:        ${agent.isActive}`);
    console.log(`  Capabilities:  ${agent.capabilities?.length || 0}`);
    console.log(`  Protocols:     ${(agent.protocols || []).join(", ")}`);
    console.log(`  Total Calls:   ${stats.totalCalls?.toString() || "0"}`);
    console.log(`  Reputation:    ${stats.reputation?.toString() || "0"}`);
    console.log();
    console.log(`  Solana Explorer:`);
    console.log(`  https://explorer.solana.com/address/${agentPda.toBase58()}?cluster=devnet`);
  } catch (e: any) {
    console.log(`  Could not fetch profile: ${e.message?.slice(0, 80)}`);
  }

  console.log();
  console.log("  " + "=".repeat(66));
  console.log("  What this means:");
  console.log("  • AceDataCloud is now a registered AI agent on Solana");
  console.log("  • Any Synapse agent can discover us via SAP protocol");
  console.log("  • Our services are indexed by capability (image, music, search...)");
  console.log("  • Agents can find us via: client.discovery.findAgentsByCapability('midjourney:imagine')");
  console.log("  • Payments flow through x402 → facilitator.acedata.cloud");
  console.log("  " + "=".repeat(66));
  console.log();
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
