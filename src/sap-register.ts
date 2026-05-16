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
 *   npm run sap                    # Full registration on devnet (free SOL via airdrop)
 *   npm run sap -- --mainnet       # Full registration on MAINNET (needs real SOL ~0.05)
 *   npm run sap:plan               # Dry-run — show registration plan without transactions
 *   npm run sap:mainnet            # Full registration on MAINNET (shortcut)
 *
 * Devnet is the default. Use --mainnet for production (Synapse Explorer visibility).
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
const MAINNET_MODE = process.argv.includes("--mainnet");
const NETWORK_LABEL = MAINNET_MODE ? "mainnet-beta" : "devnet";

// AceDataCloud service catalog — what we register on-chain
// Each service maps to a real API endpoint on api.acedata.cloud
const ACEDATA_SERVICES = [
  {
    name: "midjourney-imagine",
    capability: "midjourney:imagine",
    description: "AI image generation via Midjourney",
    endpoint: "/midjourney/imagine",
    paramsCount: 6,
    requiredParams: 1,
  },
  {
    name: "suno-generate",
    capability: "suno:generate",
    description: "AI music generation via Suno",
    endpoint: "/suno/audios",
    paramsCount: 5,
    requiredParams: 1,
  },
  {
    name: "serp-search",
    capability: "serp:search",
    description: "Google web search, images, news, videos",
    endpoint: "/serp/google",
    paramsCount: 4,
    requiredParams: 1,
  },
  {
    name: "luma-video",
    capability: "luma:video",
    description: "AI video generation via Luma Dream Machine",
    endpoint: "/luma/tasks",
    paramsCount: 4,
    requiredParams: 1,
  },
  {
    name: "sora-video",
    capability: "sora:video",
    description: "AI video generation via OpenAI Sora",
    endpoint: "/sora/videos",
    paramsCount: 4,
    requiredParams: 1,
  },
  {
    name: "openai-chat",
    capability: "openai:chat",
    description: "LLM chat (GPT-4o, Claude, Gemini, Kimi, Grok)",
    endpoint: "/v1/chat/completions",
    paramsCount: 5,
    requiredParams: 2,
  },
  {
    name: "flux-generate",
    capability: "flux:generate",
    description: "AI image generation via Flux",
    endpoint: "/flux/images",
    paramsCount: 4,
    requiredParams: 1,
  },
  {
    name: "veo-video",
    capability: "veo:video",
    description: "AI video generation via Google Veo",
    endpoint: "/veo/videos",
    paramsCount: 4,
    requiredParams: 1,
  },
];

async function main() {
  console.log("=".repeat(70));
  console.log("  OOBE Synapse × AceDataCloud — SAP On-Chain Registration");
  console.log(
    `  Register AceDataCloud as an AI agent on Solana (${NETWORK_LABEL})`,
  );
  if (PLAN_MODE)
    console.log("  MODE: Plan (dry-run) — no transactions will be sent");
  if (MAINNET_MODE) console.log("  MODE: MAINNET — real SOL will be spent!");
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

  // ─── Step 2: Connect to network ───
  const sapConn = MAINNET_MODE
    ? SapConnection.mainnet()
    : SapConnection.devnet();
  const client = sapConn.fromKeypair(keypair);
  console.log(`  [2/7] Connected to Solana ${NETWORK_LABEL}`);
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
    console.log(
      `  Description:   30+ AI APIs: image, video, music, search, LLM chat via MCP`,
    );
    console.log(`  Agent URI:     https://api.acedata.cloud`);
    console.log(
      `  x402 Endpoint: https://facilitator.acedata.cloud/.well-known/x402`,
    );
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
      console.log(
        `    • ${s.name.padEnd(22)} POST  params:${s.paramsCount} required:${s.requiredParams}`,
      );
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
      console.log(
        `  TX ${txOff}+:  initCapabilityIndex + addToCapabilityIndex — ${s.capability}`,
      );
    }
    console.log(
      `  TX ${txOff}+:  initProtocolIndex + addToProtocolIndex — mcp`,
    );
    console.log(
      `  TX ${txOff}+:  initProtocolIndex + addToProtocolIndex — x402`,
    );
    console.log();
    console.log(`  Estimated cost: ~0.05 SOL (transaction fees)`);
    console.log(
      `  Total transactions: ~${1 + ACEDATA_SERVICES.length + 5 * 2 + 2 * 2}`,
    );
    console.log();
    console.log("  To execute for real:");
    console.log(
      "    1. Get devnet SOL:  solana airdrop 2 <pubkey> --url devnet",
    );
    console.log("       Or visit: https://faucet.solana.com");
    console.log(
      "    2. Save key:        echo 'SAP_PRIVATE_KEY=<base58>' >> .env",
    );
    console.log("    3. Run:             npm run sap");
    console.log("  " + "=".repeat(66));
    console.log();
    return;
  }

  // ─── Step 3: Fund wallet ───
  if (MAINNET_MODE) {
    console.log(
      "  [3/7] Checking mainnet SOL balance (no airdrop on mainnet)...",
    );
  } else {
    console.log("  [3/7] Requesting devnet SOL airdrop...");
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
          console.log(
            `         Airdrop failed after ${attempt} attempts: ${e.message?.slice(0, 80)}`,
          );
          console.log("         Checking existing balance...");
        } else {
          console.log(
            `         Attempt ${attempt} rate-limited, retrying in 5s...`,
          );
          await new Promise((r) => setTimeout(r, 5000));
        }
      }
    }
  }

  const balance = await sapConn.connection.getBalance(keypair.publicKey);
  console.log(
    `         Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`,
  );
  if (balance < 0.05 * LAMPORTS_PER_SOL) {
    if (MAINNET_MODE) {
      console.error(
        `         Insufficient SOL on mainnet. Send at least 0.05 SOL to:`,
      );
      console.error(`         ${keypair.publicKey.toBase58()}`);
    } else {
      console.error(
        "         Insufficient SOL. Try again in a minute (devnet rate limit).",
      );
    }
    process.exit(1);
  }
  console.log();

  // ─── Step 4: Register AceDataCloud agent on-chain ───
  console.log("  [4/7] Registering AceDataCloud agent on-chain...");

  // Check if agent already exists
  const existingAgent = await client.agent.fetchNullable();
  if (existingAgent) {
    console.log(`         Agent already registered! Skipping registration.`);
    console.log(`         Name: ${existingAgent.name}`);
    console.log(`         Agent PDA: ${agentPda.toBase58()}`);
  } else {
    // Only take first 8 capabilities (SAP limit: 10 per agent)
    const capabilities = ACEDATA_SERVICES.slice(0, 8).map((s) => ({
      id: s.capability,
      description: s.description,
      protocolId: "acedata",
      version: "1.0",
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
          minPricePerCall: null,
          maxPricePerCall: null,
          rateLimit: 60,
          maxCallsPerSession: 100_000,
          burstLimit: null,
          tokenType: TokenType.Sol,
          tokenMint: null,
          tokenDecimals: 9,
          settlementMode: SettlementMode.X402,
          minEscrowDeposit: null,
          batchIntervalSec: null,
          volumeCurve: null,
        },
      ],
      protocols: ["mcp", "x402", "openai-compatible"],
    });

    console.log(`         TX: ${registerTx}`);
    console.log(`         Agent registered on-chain!`);
    console.log(`         Agent PDA: ${agentPda.toBase58()}`);
  }

  // ─── Step 5: Publish tool descriptors ───
  console.log(
    `  [5/7] Publishing ${ACEDATA_SERVICES.length} tool descriptors...`,
  );
  for (const service of ACEDATA_SERVICES) {
    try {
      const tx = await client.tools.publishByName(
        service.name, // toolName
        "acedata", // protocolId
        service.description, // description
        JSON.stringify({ prompt: "string" }), // inputSchema
        JSON.stringify({ result: "object" }), // outputSchema
        1, // httpMethod: POST = 1
        0, // category: Custom = 0
        service.paramsCount, // paramsCount
        service.requiredParams, // requiredParams
        false, // isCompound
      );
      console.log(`         ✓ ${service.name} (tx: ${tx.slice(0, 16)}...)`);
    } catch (e: any) {
      console.log(`         ✗ ${service.name}: ${e.message?.slice(0, 80)}`);
    }
    // Small delay to avoid RPC rate limiting on mainnet
    if (MAINNET_MODE) await new Promise((r) => setTimeout(r, 2000));
  }
  console.log();

  // ─── Step 6: Register discovery indexes ───
  console.log("  [6/7] Registering discovery indexes...");

  // Capability indexes
  for (const service of ACEDATA_SERVICES.slice(0, 5)) {
    try {
      await client.indexing.initCapabilityIndex(service.capability);
      console.log(`         ✓ capability: ${service.capability}`);
    } catch (e: any) {
      // Index might already exist, try adding instead
      try {
        await client.indexing.addToCapabilityIndex(service.capability);
        console.log(
          `         ✓ capability: ${service.capability} (joined existing)`,
        );
      } catch {
        console.log(
          `         ✗ capability: ${service.capability}: ${e.message?.slice(0, 60)}`,
        );
      }
    }
    if (MAINNET_MODE) await new Promise((r) => setTimeout(r, 2000));
  }

  // Protocol indexes
  for (const protocol of ["mcp", "x402"]) {
    try {
      await client.indexing.initProtocolIndex(protocol);
      console.log(`         ✓ protocol: ${protocol}`);
    } catch (e: any) {
      try {
        await client.indexing.addToProtocolIndex(protocol);
        console.log(`         ✓ protocol: ${protocol} (joined existing)`);
      } catch {
        console.log(
          `         ✗ protocol: ${protocol}: ${e.message?.slice(0, 60)}`,
        );
      }
    }
    if (MAINNET_MODE) await new Promise((r) => setTimeout(r, 2000));
  }
  console.log();

  // ─── Step 7: Verify — query our own profile ───
  console.log("  [7/7] Verifying on-chain registration...");
  try {
    const agent = await client.agent.fetch(); // defaults to connected wallet
    const [derivedPda] = client.agent.deriveAgent();
    const stats = await client.agent.fetchStats(derivedPda);

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
    const clusterParam = MAINNET_MODE ? "" : "?cluster=devnet";
    console.log(
      `  https://explorer.solana.com/address/${agentPda.toBase58()}${clusterParam}`,
    );
  } catch (e: any) {
    console.log(`  Could not fetch profile: ${e.message?.slice(0, 80)}`);
  }

  console.log();
  console.log("  " + "=".repeat(66));
  console.log("  What this means:");
  console.log("  • AceDataCloud is now a registered AI agent on Solana");
  console.log("  • Any Synapse agent can discover us via SAP protocol");
  console.log(
    "  • Our services are indexed by capability (image, music, search...)",
  );
  console.log(
    "  • Agents can find us via: client.discovery.findAgentsByCapability('midjourney:imagine')",
  );
  console.log("  • Payments flow through x402 → facilitator.acedata.cloud");
  console.log("  " + "=".repeat(66));
  console.log();
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
