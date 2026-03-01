# BlockForge — Composable DeFi Lego on Bitcoin

> Build your own DeFi protocol on Bitcoin L1. No code. Just blocks.

---

## Product Pitch

**What if you could build a DeFi protocol the way you build with Lego?**

BlockForge is the first composable DeFi builder on Bitcoin Layer 1. Pick your modules — Vault, Staking, Rewards, TimeLock, Escrow, NFT Positions — snap them together, configure the parameters, and deploy a fully functional DeFi protocol directly on Bitcoin.

No Solidity. No Ethereum. No bridges. Pure Bitcoin.

**Why it's unique:** Every DeFi protocol today is monolithic — built by engineers, understood by few. BlockForge makes protocol design visual, modular, and accessible. Each module is a Lego block with a clear interface: `onDeposit()` and `onWithdraw()`. Compose them into pipelines. Deploy in one click.

**Who it's for:** Builders, DAOs, and DeFi teams who want to launch on Bitcoin without writing smart contracts from scratch. Power users who want custom yield strategies. Anyone who believes DeFi belongs on Bitcoin.

**Why Bitcoin L1:** Bitcoin is the most secure, decentralized network in existence. With OP_NET, smart contracts run natively on Bitcoin — no sidechains, no trust assumptions. Your DeFi protocol inherits Bitcoin's security from block one.

*Build. Compose. Deploy. On Bitcoin.*

---

## Architecture

### Frontend (React + Vite + Tailwind)

```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Root component — 3-column layout
├── index.css                   # Tailwind + custom utilities
├── services/
│   ├── opnetWallet.js          # OP_NET wallet API wrapper
│   └── contractService.js      # SDK contract calls (write/view helpers)
├── data/
│   └── modules.js              # Module definitions, pipelines, config fields
├── hooks/
│   ├── useProtocolBuilder.js   # Core state: selection, config, pipeline gen
│   └── useOPNetWallet.js       # Wallet connect/disconnect state
└── components/
    ├── Header.jsx              # Logo, protocol name editor, BTC badge
    ├── ModuleSelector.jsx      # Left panel — toggle Lego blocks
    ├── PipelineVisualizer.jsx  # Center — visual deposit/withdraw flow
    ├── ConfigPanel.jsx         # Right panel — sliders, inputs, toggles
    ├── DeploymentOutput.jsx    # Modal — JSON config output
    └── Footer.jsx              # Reset, version info
```

### Smart Contracts (OP_NET / AssemblyScript)

```
contracts/
├── src/
│   ├── core/
│   │   ├── CoreContract.ts     # Orchestrator (stable OP_NET pattern)
│   │   └── index.ts            # Blockchain.contract entrypoint
│   └── modules/
│       ├── VaultModule.ts      # Module examples
│       ├── StakingModule.ts    # Module examples
│       ├── TimeLockModule.ts   # Module examples
│       ├── EscrowModule.ts     # Module examples
│       └── index.ts
├── deploy.ts                   # Deployment script
├── asconfig.json               # Build config with opnet-transform
├── package.json                # Contract dependencies
└── .env.example                # Mnemonic + RPC config
```

---

## State Model

```
selectedModules: string[]        // ['vault', 'staking', 'rewards']
moduleConfigs: {                 // Per-module configuration
  vault: { tokenType: 'BTC', maxDeposit: 10000000 },
  staking: { apy: 12, compounding: true, minStake: 10000 },
  ...
}
depositPipeline: string[]        // Computed: ['vault', 'staking', 'rewards']
withdrawPipeline: string[]       // Computed: ['timelock', 'escrow', 'vault']
deploymentConfig: object         // Generated JSON for deployment
```

---

## Module Interface (OP_NET)

Every module implements:

```typescript
interface Module {
  onDeposit(user: Address, amount: u256): void
  onWithdraw(user: Address, amount: u256): void
}
```

CoreContract calls modules in pipeline order:
- **Deposit:** `Vault → Staking → Rewards → NFT`
- **Withdraw:** `TimeLock → Escrow → Vault → NFT`

---

## Design System

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| BTC Orange | `#F7931A` | Primary, CTAs, accents |
| BTC Gold | `#FFB347` | Rewards, highlights |
| Neon Blue | `#00D4FF` | TimeLock, withdraw flow |
| Neon Green | `#00FF88` | Staking, success states |
| Neon Purple | `#A855F7` | Escrow, config panel |
| Neon Pink | `#FF006E` | NFT, advanced features |
| Dark BG | `#0D0D0D` | Background |
| Card BG | `#141414` | Card surfaces |

### Typography
- **Headings:** Inter 600/700
- **Body:** Inter 400/500
- **Code/Data:** JetBrains Mono

### Animations
- **Snap-in:** Spring animation when module is toggled on (scale 0.8→1.05→1.0)
- **Pipeline flow:** Animated gradient dots flowing through connectors
- **Float:** Gentle hover animation on empty states
- **Glow pulse:** Subtle shadow pulsing on active elements

### Mobile Adaptation
- 3-column → stacked layout on mobile
- Module selector becomes horizontal scroll
- Pipeline wraps vertically
- Config panel uses bottom sheet pattern

---

## Deployment Config Example

```json
{
  "name": "My DeFi Protocol",
  "modules": ["Vault", "Staking", "Rewards", "TimeLock"],
  "params": {
    "tokenType": "BTC",
    "maxDeposit": 10000000,
    "apy": 12,
    "compounding": true,
    "minStake": 10000,
    "rewardToken": "OP_20",
    "payoutFrequency": 100,
    "rewardRate": 50,
    "lockDuration": 1000,
    "earlyWithdrawPenalty": 10
  },
  "pipeline": {
    "deposit": ["Vault", "Staking", "Rewards"],
    "withdraw": ["TimeLock", "Vault"]
  },
  "timestamp": "2026-03-01T00:00:00.000Z"
}
```

---

## Quick Start

```bash
# Install frontend dependencies
npm install

# Start dev server
npm run dev

# --- Contracts (separate) ---
npm --prefix contracts install
npm --prefix contracts run build
# Configure contracts/.env then deploy
npm --prefix contracts run deploy:ts
```

### Contract deployment env

Use `contracts/.env`:

```env
MNEMONIC="..."
RPC_URL="https://testnet.opnet.org"
NETWORK="testnet"
WASM_PATH="./build/CoreContract.wasm"
FEE_RATE="5"
GAS_SAT_FEE="500000"
```

---

## Gas-Safe Contract Design

1. **Constructor:** Only pointer declarations (`new StoredU256`, `new AddressMemoryMap`)
2. **onDeployment():** All init logic runs under tx gas limit (up to 150B)
3. **No while loops:** All operations are O(1) per user
4. **Storage optimized:** Minimal storage reads/writes per transaction
5. **Pipeline masks:** Bitmask-based pipeline config (no arrays in storage)
6. **Module isolation:** Each module is a separate contract — one failure doesn't cascade

---

## License

MIT

Built with OP_NET on Bitcoin L1.
