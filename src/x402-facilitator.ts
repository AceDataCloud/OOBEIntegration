/**
 * OOBE Synapse × AceDataCloud — x402 Payment Integration
 *
 * Demonstrates how Synapse agents can pay for AceDataCloud API calls
 * using the x402 HTTP micropayment protocol (USDC on Base or Solana).
 *
 * Run:
 *   npm run x402
 */

import { config } from "dotenv";
config();

const X402_FLOW = `
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
`;

const SELLER_CODE = `
// ─── Seller (AceDataCloud API) ─── x402 Paywall Setup ───

import { X402Paywall } from '@oobe-protocol-labs/synapse-client-sdk/x402';

const paywall = new X402Paywall({
  facilitatorUrl: 'https://facilitator.acedata.cloud',
  // The facilitator supports /.well-known/x402 discovery
  chains: ['base', 'solana'],
  currency: 'USDC',
});

// Wrap an API endpoint: any request without valid payment → 402
app.use('/v1/chat/completions', paywall.middleware({
  maxAmountRequired: '0.001',  // $0.001 per request
  resource: 'chat-completions',
  description: 'AI chat completion (GPT-4o, Claude, Gemini, etc.)',
}));

// On successful payment:
// 1. Facilitator verifies the USDC authorization signature
// 2. Facilitator calls transferWithAuthorization (EVM) or SPL transfer (Solana)
// 3. USDC moves from buyer → seller on-chain
// 4. Request proceeds to upstream AI service
`;

const BUYER_CODE = `
// ─── Buyer (Synapse Agent) ─── x402 Auto-Payment ───

import { X402Client } from '@oobe-protocol-labs/synapse-client-sdk/x402';

const x402 = new X402Client({
  wallet: agent.wallet,  // Synapse agent's Solana wallet (has USDC)
  facilitatorUrl: 'https://facilitator.acedata.cloud',
  maxAutoPayment: '0.01',  // Auto-approve up to $0.01 per request
});

// Transparent payment — agent just makes a normal HTTP call
const response = await x402.fetch('https://api.acedata.cloud/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Analyze SOL/USDC pair on Raydium' }],
  }),
});

// If server returns 402 → x402 auto-signs USDC payment → retries → 200 OK
const data = await response.json();
console.log(data.choices[0].message.content);
// → "SOL/USDC on Raydium shows strong volume with TVL of $45M..."
`;

const FACILITATOR_CODE = `
// ─── Facilitator Registry ───

// AceDataCloud's facilitator endpoint supports discovery:
// GET https://facilitator.acedata.cloud/.well-known/x402

// Response:
{
  "facilitatorAddress": "0x...",        // Base (EVM) settlement address
  "solanaAddress": "FaC1...",           // Solana settlement address
  "supportedChains": ["base", "solana"],
  "supportedCurrencies": ["USDC"],
  "endpoints": {
    "supported": "/supported",
    "verify": "/verify",
    "settle": "/settle"
  }
}

// Agents can discover and register facilitators:
const { SynapseClient } = require('@oobe-protocol-labs/synapse-client-sdk');

const client = new SynapseClient({ rpcUrl });
client.registerFacilitator({
  url: 'https://facilitator.acedata.cloud',
  chains: ['base', 'solana'],
  priority: 1,  // preferred facilitator
});
`;

async function main() {
  console.log("=".repeat(70));
  console.log("  OOBE Synapse × AceDataCloud — x402 Micropayment Integration");
  console.log("  USDC-based agent-to-API payments on Base & Solana");
  console.log("=".repeat(70));

  console.log();
  console.log("Payment Flow:");
  console.log(X402_FLOW);

  console.log();
  console.log("Seller Side (AceDataCloud API with x402 Paywall):");
  console.log("-".repeat(70));
  console.log(SELLER_CODE);

  console.log();
  console.log("Buyer Side (Synapse Agent with Auto-Payment):");
  console.log("-".repeat(70));
  console.log(BUYER_CODE);

  console.log();
  console.log("Facilitator Discovery & Registration:");
  console.log("-".repeat(70));
  console.log(FACILITATOR_CODE);

  // --- Integration Value ---
  console.log();
  console.log("=".repeat(70));
  console.log("  Integration Value");
  console.log("=".repeat(70));
  console.log();
  console.log("  AceDataCloud Facilitator: https://facilitator.acedata.cloud");
  console.log("  Supported Chains:         Base (EVM) + Solana");
  console.log("  Currency:                 USDC");
  console.log();
  console.log("  Key Benefits:");
  console.log("  • Synapse agents pay per-call with USDC — no API keys needed");
  console.log("  • AceDataCloud's existing facilitator handles settlement");
  console.log("  • Solana settlement takes ~400ms (vs minutes on EVM L1)");
  console.log("  • $ACE token holders get discounted rates via CoinPolicy");
  console.log(
    "  • Agent wallets can hold both USDC (payments) + $ACE (discounts)",
  );
  console.log();
  console.log("  Revenue Model:");
  console.log("  ┌──────────────────────┬─────────────────────────────────┐");
  console.log("  │ API Call             │ x402 USDC micro-payment         │");
  console.log("  │ Settlement Fee       │ ~0.1% facilitator commission    │");
  console.log("  │ Discount (staking)   │ Hold $ACE → lower per-call cost│");
  console.log("  │ Volume               │ 1000s of autonomous agents 24/7│");
  console.log("  └──────────────────────┴─────────────────────────────────┘");
  console.log();
}

main().catch(console.error);
